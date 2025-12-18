import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your project's Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "knowledge-center-5274257-2457a.firebaseapp.com",
  projectId: "knowledge-center-5274257-2457a",
  storageBucket: "knowledge-center-5274257-2457a.firebasestorage.app",
  messagingSenderId: "1037125453254",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
