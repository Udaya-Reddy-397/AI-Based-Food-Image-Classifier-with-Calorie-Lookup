import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnqGApFjNM6OMmLI2haKCs3aIRDCmFgIQ",
  authDomain: "nutriscan-9e68d.firebaseapp.com",
  projectId: "nutriscan-9e68d",
  storageBucket: "nutriscan-9e68d.firebasestorage.app",
  messagingSenderId: "647082882133",
  appId: "1:647082882133:web:33113fa9df98eb5f3f50dc"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, doc, setDoc, getDoc, collection, query, where, getDocs, addDoc };
