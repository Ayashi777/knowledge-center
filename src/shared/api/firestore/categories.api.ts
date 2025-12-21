import { 
    collection, 
    doc, 
    getDocs, 
    setDoc, 
    deleteDoc, 
    query,
    onSnapshot 
} from "firebase/firestore";
import { db } from "@shared/api/firebase/firebase";
import { Category } from "@shared/types";

const COLLECTION_NAME = "categories";

export const CategoriesApi = {
    getAll: async (): Promise<Category[]> => {
        const q = query(collection(db, COLLECTION_NAME));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    },

    subscribeAll: (onUpdate: (categories: Category[]) => void) => {
        const q = query(collection(db, COLLECTION_NAME));
        return onSnapshot(q, (snapshot) => {
            const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
            onUpdate(categories);
        });
    },

    createOrUpdate: async (category: Category): Promise<void> => {
        const ref = doc(db, COLLECTION_NAME, category.id);
        await setDoc(ref, category, { merge: true });
    },

    delete: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    }
};
