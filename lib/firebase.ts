// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyA45q_jQb2tSYVQyqbVDB8SE3QmeKbMlZw",
  authDomain: "industryselling-c18f2.firebaseapp.com",
  projectId: "industryselling-c18f2",
  storageBucket: "industryselling-c18f2.firebasestorage.app",
  messagingSenderId: "440694620000",
  appId: "1:440694620000:web:b72796efc03816a887a805",
  measurementId: "G-2X3FLS2RHS",
}

// Prevent re-initialization during hot reload in Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app);
export default app
