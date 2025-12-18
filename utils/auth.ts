import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    User
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, limit, query } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserRole } from "../types";

/**
 * Gets or creates the user role from Firestore
 */
export const getUserRole = async (user: User): Promise<UserRole> => {
    try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            return userDoc.data().role as UserRole;
        }

        // Emergency Bootstrap: If no users exist at all, make the first one an ADMIN
        const usersQuery = query(collection(db, "users"), limit(1));
        const usersSnapshot = await getDocs(usersQuery);
        
        const isFirstUser = usersSnapshot.empty;
        const assignedRole: UserRole = isFirstUser ? "admin" : "guest";

        // Create the user profile in Firestore
        await setDoc(userRef, {
            email: user.email,
            role: assignedRole,
            createdAt: new Date().toISOString()
        });

        return assignedRole;
    } catch (error) {
        console.error("Error fetching/creating role:", error);
        return "guest";
    }
};

/**
 * Sets or updates a user's role in Firestore
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
            const role = await getUserRole(user);
            callback(user, role);
        } else {
            callback(null, "guest");
        }
    });
};

export const logoutUser = () => signOut(auth);
