import { 
    collection, 
    doc, 
    getDocs, 
    addDoc,
    updateDoc, 
    deleteDoc, 
    query
} from "firebase/firestore";
import { db } from "@shared/api/firebase/firebase";
import { Tag } from "@shared/types";

const COLLECTION_NAME = "tags";

export const TagsApi = {
    getAll: async (): Promise<Tag[]> => {
        const q = query(collection(db, COLLECTION_NAME));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag));
    },

    create: async (tag: Omit<Tag, 'id'>): Promise<string> => {
        const ref = await addDoc(collection(db, COLLECTION_NAME), tag);
        return ref.id;
    },

    update: async (id: string, tag: Partial<Tag>): Promise<void> => {
        const ref = doc(db, COLLECTION_NAME, id);
        await updateDoc(ref, tag);
    },

    delete: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    }
};
