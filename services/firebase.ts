
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMBQTgieWoWVosWUNLG6hcoMhwLTIEb-M",
  authDomain: "iethreadscan.firebaseapp.com",
  projectId: "iethreadscan",
  storageBucket: "iethreadscan.firebasestorage.app",
  messagingSenderId: "691062522397",
  appId: "1:691062522397:web:5ad0a375b5c205392a3cf4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
