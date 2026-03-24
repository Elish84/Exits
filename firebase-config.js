// Firebase v9 modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDG_-XAP-hzNVa6BtA34_YpYFeqE73L6mE",
  authDomain: "project-4875540944725487473.firebaseapp.com",
  projectId: "project-4875540944725487473",
  storageBucket: "project-4875540944725487473.firebasestorage.app",
  messagingSenderId: "266712033696",
  appId: "1:266712033696:web:311179722317a1903e9cc5",
  measurementId: "G-MFJ43LRCSQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// חיבור אוטומטי (לקריאה)
signInAnonymously(auth);
