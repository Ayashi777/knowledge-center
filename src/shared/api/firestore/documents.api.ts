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
    QueryConstraint,
    Timestamp,
    DocumentData
} from "firebase/firestore";
import { db } from "@shared/api/firebase/firebase";
import { Document, DocumentContent, Language } from "@shared/types";

const COLLECTION_NAME = "documents";

const prepareDataForFirestore = (data: Record<string, any>): Record<string, any> => {
    const cleaned: Record<string, any> = {};
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
            cleaned[key] = data[key];
        }
    });
    return cleaned;
};

const mapToDocument = (id: string, data: DocumentData): Document => {
    return {
        ...data,
        id: id,
        content: data.content || {},
        updatedAt: data.updatedAt as Timestamp,
        createdAt: data.createdAt as Timestamp,
    } as Document;
};

export const DocumentsApi = {
    subscribeFiltered: (
        options: { 
            categoryKey?: string; 
            limitCount?: number;
            sortBy?: 'recent' | 'alpha';
        }, 
        onUpdate: (docs: Document[]) => void, 
        onError?: (error: Error) => void
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
            const docs = snapshot.docs.map(snap => mapToDocument(snap.id, snap.data()));
            onUpdate(docs);
        }, (error) => {
            onError?.(error as Error);
        });
    },

    getById: async (id: string): Promise<Document | null> => {
        const snap = await getDoc(doc(db, COLLECTION_NAME, id));
        return snap.exists() ? mapToDocument(snap.id, snap.data()) : null;
    },

    create: async (documentData: Partial<Document>): Promise<void> => {
        const id = documentData.id || `doc_${Date.now()}`;
        const docRef = doc(db, COLLECTION_NAME, id);
        
        const payload = prepareDataForFirestore({
            ...documentData,
            id,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp()
        });
        
        await setDoc(docRef, payload);
    },

    updateMetadata: async (id: string, metadata: Partial<Omit<Document, 'content'>>): Promise<void> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const payload = prepareDataForFirestore({
            ...metadata,
            updatedAt: serverTimestamp()
        });
        await updateDoc(docRef, payload);
    },

    // 🔥 Deep Deep Optimization: Using dot notation to update only specific language content
    updateContent: async (id: string, lang: Language, content: DocumentContent): Promise<void> => {
        const docRef = doc(db, COLLECTION_NAME, id);
        
        // Use a transaction to ensure updatedAt is synced with content change
        await runTransaction(db, async (transaction) => {
            transaction.update(docRef, {
                [`content.${lang}`]: content,
                updatedAt: serverTimestamp()
            });
        });
    },

    delete: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    }
};
