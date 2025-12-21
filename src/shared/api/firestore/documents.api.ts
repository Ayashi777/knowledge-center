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
    runTransaction
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
        const q = query(collection(db, COLLECTION_NAME));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(mapDocument);
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
