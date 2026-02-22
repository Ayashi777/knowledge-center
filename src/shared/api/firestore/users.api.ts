import { 
    collection, 
    doc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    onSnapshot 
} from "firebase/firestore";
import { db } from "@shared/api/firebase/firebase";
import { UserProfile, UserRole } from "@shared/types";

export interface AccessRequest {
    id: string;
    uid?: string;
    name: string;
    email: string;
    phone?: string;
    company: string;
    requestedRole?: UserRole;
    status: 'pending' | 'approved' | 'denied';
    date: string;
    assignedRole?: UserRole;
}

export const UsersApi = {
    getAllUsers: async (): Promise<UserProfile[]> => {
        const snapshot = await getDocs(collection(db, "users"));
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    },

    subscribeUsers: (onUpdate: (users: UserProfile[]) => void) => {
        return onSnapshot(collection(db, "users"), (snapshot) => {
            const users = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
            onUpdate(users);
        });
    },

    updateUser: async (uid: string, data: Partial<UserProfile>): Promise<void> => {
        await updateDoc(doc(db, "users", uid), data);
    },

    deleteUser: async (uid: string): Promise<void> => {
        await deleteDoc(doc(db, "users", uid));
    },

    // --- Access Requests ---
    getAllRequests: async (): Promise<AccessRequest[]> => {
         const snapshot = await getDocs(collection(db, "requests"));
         return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessRequest));
    },

    subscribeRequests: (onUpdate: (requests: AccessRequest[]) => void) => {
        return onSnapshot(collection(db, "requests"), (snapshot) => {
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AccessRequest));
            onUpdate(requests);
        });
    },

    updateRequestStatus: async (requestId: string, status: 'approved' | 'denied', assignedRole?: UserRole): Promise<void> => {
        const data: any = { status };
        if (assignedRole) data.assignedRole = assignedRole;
        await updateDoc(doc(db, "requests", requestId), data);
    }
};
