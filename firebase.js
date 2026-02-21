// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCaEHDX2rn639rAWdAFRAYecrQ51PzYy6E",
  authDomain: "interinest.firebaseapp.com",
  projectId: "interinest",
  storageBucket: "interinest.firebasestorage.app",
  messagingSenderId: "339085557269",
  appId: "1:339085557269:web:9bb9a2128721f17cefd81c",
  measurementId: "G-LZZPYKH650"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// const analytics = getAnalytics(app);
export const analyticsPromise =
  typeof window === "undefined"
    ? Promise.resolve(null)
    : isSupported()
        .then((ok) => (ok ? getAnalytics(app) : null))
        .catch(() => null)


export { app, auth, db, storage };