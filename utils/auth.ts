import { 
    signOut, 
    onAuthStateChanged,
    User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserRole } from "../types";

/**
 * Gets or creates the user role from Firestore
 */
export const getUserRole = async (user: User): Promise<UserRole> => {
    try {
        console.log("Checking role for UID:", user.uid);
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const data = userDoc.data();
            console.log("User data found in Firestore:", data);
            
            // Спроба знайти поле role, ігноруючи пробіли в назві ключа
            let rawRole = data.role;
            if (rawRole === undefined) {
                // Якщо точного збігу немає, шукаємо ключ, який після trim() стає "role"
                const keys = Object.keys(data);
                const roleKey = keys.find(k => k.trim() === "role");
                if (roleKey) {
                    rawRole = data[roleKey];
                    console.log(`Found role in a field with non-standard name: "${roleKey}"`);
                }
            }

            const role = String(rawRole || "guest").toLowerCase().trim() as UserRole;
            
            const validRoles: UserRole[] = ["guest", "foreman", "designer", "architect", "admin"];
            if (validRoles.includes(role)) {
                return role;
            }
            return "guest";
        }

        const assignedRole: UserRole = "guest";
        await setDoc(userRef, {
            email: user.email,
            role: assignedRole,
            createdAt: new Date().toISOString()
        });

        return assignedRole;
    } catch (error) {
        console.error("CRITICAL: Error fetching user role:", error);
        return "guest";
    }
};

/**
 * Sets or updates a user's role in Firestore
 */
export const setUserRole = async (uid: string, role: UserRole, email: string) => {
    await setDoc(doc(db, "users", uid), {
        role: role.toLowerCase().trim(),
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
