import { 
    onAuthStateChanged, 
    User,
    signOut as firebaseSignOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db, auth } from '@shared/api/firebase/firebase';
import { UserRole, UserProfile } from '@shared/types';

const normalizeRole = (raw: any): UserRole => {
  const role = String(raw || 'guest').toLowerCase().trim() as UserRole;
  const valid: UserRole[] = ['guest', 'foreman', 'designer', 'architect', 'admin'];
  return valid.includes(role) ? role : 'guest';
};

const extractRoleLoose = (data: any): UserRole => {
  if (!data) return 'guest';
  if (data.role !== undefined) return normalizeRole(data.role);

  const roleKey = Object.keys(data).find(k => k.trim() === 'role');
  return normalizeRole(roleKey ? data[roleKey] : 'guest');
};

const getUserRole = async (user: User): Promise<UserRole> => {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) return extractRoleLoose(snap.data());

  const assigned: UserRole = 'guest';
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email || '',
    role: assigned,
    createdAt: new Date().toISOString(),
  }, { merge: true });

  return assigned;
};

export const AuthApi = {
    subscribeToAuthChanges: (callback: (user: User | null, role: UserRole) => void) => {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const role = await getUserRole(user);
                    callback(user, role);
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
            uid: user.uid,
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

// --- Legacy Exports for 1:1 Compatibility with Main ---
export const subscribeToAuthChanges = AuthApi.subscribeToAuthChanges;
export const logout = AuthApi.logout;
export const login = AuthApi.login;
export const register = AuthApi.register;
