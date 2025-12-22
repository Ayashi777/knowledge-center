import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    serverTimestamp,
    runTransaction,
    orderBy,
    onSnapshot,
    where,
    limit,
    startAfter,
    QueryConstraint
} from "firebase/firestore";
import { db } from "@shared/api/firebase/firebase";
import { Document, DocumentContent, Language } from "@shared/types";

const COLLECTION_NAME = "documents";

const stripUndefinedDeep = (value: any): any => {
    if (Array.isArray(value)) {
        return value.map(stripUndefinedDeep).filter((v) => v !== undefined);
    }
    if (value && typeof value === 'object') {
        const out: any = {};
        for (const [k, v] of Object.entries(value)) {
            const cleaned = stripUndefinedDeep(v);
            if (cleaned !== undefined) out[k] = cleaned;
        }
        return out;
    }
    return value === undefined ? undefined : value;
};

const mapDocument = (doc: any): Document => {
    const data = doc.data ? doc.data() : doc;
    const id = doc.id || data.id;

    return {
        ...data,
        id,
        content: data.content || {},
        updatedAt: data.updatedAt,
        createdAt: data.createdAt
    } as Document;
};

export const DocumentsApi = {
    getAll: async (): Promise<Document[]> => {
        const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(mapDocument);
    },

    subscribeAll: (onUpdate: (docs: Document[]) => void, onError?: (error: any) => void) => {
        const q = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(mapDocument);
            onUpdate(docs);
        }, onError);
    },

    subscribeFiltered: (
        options: { 
            categoryKey?: string; 
            limitCount?: number;
            sortBy?: 'recent' | 'alpha';
        }, 
        onUpdate: (docs: Document[]) => void, 
        onError?: (error: any) => void
    ) => {
        const constraints: QueryConstraint[] = [];

        if (options.categoryKey && options.categoryKey !== 'all') {
            constraints.push(where('categoryKey', '==', options.categoryKey));
        }

        if (options.sortBy === 'alpha') {
            constraints.push(orderBy('title', 'asc'));
        } else {
            constraints.push(orderBy('updatedAt', 'desc'));
        }

        if (options.limitCount) {
            constraints.push(limit(options.limitCount));
        }

        const q = query(collection(db, COLLECTION_NAME), ...constraints);

        return onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(mapDocument);
            onUpdate(docs);
        }, (error) => {
            // Firestore might require an index for some combinations
            if (error.code === 'failed-precondition') {
                console.warn("Firestore index required. Falling back to simple query.");
                // Fallback to simple query if index is missing
                const fallbackQ = query(collection(db, COLLECTION_NAME), orderBy('updatedAt', 'desc'), limit(options.limitCount || 50));
                onSnapshot(fallbackQ, (snap) => onUpdate(snap.docs.map(mapDocument)), onError);
            } else {
                onError?.(error);
            }
        });
    },

    getById: async (id: string): Promise<Document | null> => {
        const snap = await getDoc(doc(db, COLLECTION_NAME, id));
        return snap.exists() ? mapDocument(snap) : null;
    },

    create: async (docData: Partial<Document>): Promise<void> => {
        const id = docData.id || `doc${Date.now()}`;
        const docRef = doc(db, COLLECTION_NAME, id);
        
        const cleanData = stripUndefinedDeep({
            ...docData,
            id,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp()
        });
        
        if (!cleanData.content) cleanData.content = {};
        
        await setDoc(docRef, cleanData);
    },

    updateMetadata: async (id: string, data: Partial<Document>): Promise<void> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const { content, ...safeData } = data as any;
        
        const cleanData = stripUndefinedDeep({
            ...safeData,
            updatedAt: serverTimestamp()
        });

        await updateDoc(docRef, cleanData);
    },

    updateContent: async (id: string, lang: Language, newContent: DocumentContent): Promise<void> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const html = (newContent?.html ?? '').toString();

        await runTransaction(db, async (tx) => {
            const snap = await tx.get(docRef);
            
            if (!snap.exists()) {
                 tx.set(docRef, stripUndefinedDeep({
                    id,
                    content: { [lang]: { html } },
                    updatedAt: serverTimestamp(),
                 }));
                 return;
            }

            const data = snap.data();
            const currentContent = data?.content || {};
            
            const nextContent = stripUndefinedDeep({
                ...currentContent,
                [lang]: { html }
            });

            tx.update(docRef, {
                content: nextContent,
                updatedAt: serverTimestamp()
            });
        });
    },

    delete: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    }
};
