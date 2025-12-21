import { 
    onAuthStateChanged, 
    User,
    signOut as firebaseSignOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    Auth
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@shared/api/firebase/firebase';
import { UserRole, UserProfile } from '@shared/types';

export const AuthApi = {
    subscribeToAuthChanges: (callback: (user: User | null, role: UserRole) => void) => {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data() as UserProfile;
                        callback(user, userData.role || 'guest');
                    } else {
                        callback(user, 'guest');
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    callback(user, 'guest');
                }
            } else {
                callback(null, 'guest');
            }
        });
    },

    login: (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    },

    logout: () => firebaseSignOut(auth),

    register: async (data: {
        email: string;
        password: string;
        name: string;
        company: string;
        phone: string;
        requestedRole: UserRole;
    }) => {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        // Create user profile
        await setDoc(doc(db, "users", user.uid), {
            email: data.email,
            role: 'guest' as UserRole, 
            name: data.name,
            company: data.company,
            phone: data.phone,
            requestedRole: data.requestedRole,
            createdAt: new Date().toISOString()
        });

        // Create access request
        await addDoc(collection(db, "requests"), {
            uid: user.uid, 
            name: data.name,
            company: data.company,
            email: data.email,
            phone: data.phone,
            requestedRole: data.requestedRole,
            status: 'pending',
            date: new Date().toISOString()
        });

        return userCredential;
    }
};

// Maintain backward compatibility if needed, but better to use AuthApi
export const subscribeToAuthChanges = AuthApi.subscribeToAuthChanges;
export const logout = AuthApi.logout;
