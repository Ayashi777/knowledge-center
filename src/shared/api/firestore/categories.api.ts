import { 
    collection, 
    doc, 
    getDocs, 
    setDoc, 
    deleteDoc, 
    query, 
    orderBy
} from "firebase/firestore";
import { db } from "../../../firebase";
import { Category } from "../../../types";

const COLLECTION_NAME = "categories";

export const CategoriesApi = {
    getAll: async (): Promise<Category[]> => {
        // You might want to order by something, but currently types don't have 'order'
        const q = query(collection(db, COLLECTION_NAME));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
    },

    createOrUpdate: async (category: Category): Promise<void> => {
        const ref = doc(db, COLLECTION_NAME, category.id);
        await setDoc(ref, category, { merge: true });
    },

    delete: async (id: string): Promise<void> => {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    }
};
