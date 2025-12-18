import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserRole } from "../types";

/**
 * Gets the user role from Firestore
 */
export const getUserRole = async (uid: string): Promise<UserRole> => {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data().role as UserRole;
        }
        return "guest";
    } catch (error) {
        console.error("Error fetching role:", error);
        return "guest";
    }
};

/**
 * Sets or updates a user's role in Firestore (Admin only action ideally)
 */
export const setUserRole = async (uid: string, role: UserRole, email: string) => {
    await setDoc(doc(db, "users", uid), {
        role,
        email,
        updatedAt: new Date().toISOString()
    }, { merge: true });
};

/**
 * Listens for auth state changes and fetches roles
 */
export const subscribeToAuthChanges = (callback: (user: User | null, role: UserRole) => void) => {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            const role = await getUserRole(user.uid);
            callback(user, role);
        } else {
            callback(null, "guest");
        }
    });
};

export const logoutUser = () => signOut(auth);
