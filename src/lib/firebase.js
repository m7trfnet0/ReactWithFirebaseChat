import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-788c8.firebaseapp.com",
  projectId: "reactchat-788c8",
  storageBucket: "reactchat-788c8.appspot.com",
  messagingSenderId: "382609329684",
  appId: "1:382609329684:web:31ae1b655799dcdcece101"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
