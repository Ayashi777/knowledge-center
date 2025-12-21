import { 
    getAuth, 
    onAuthStateChanged, 
    User,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@shared/api/firebase/firebase';
import { UserRole, UserProfile } from '@shared/types';

export const subscribeToAuthChanges = (callback: (user: User | null, role: UserRole) => void) => {
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
};

export const logout = () => firebaseSignOut(auth);
