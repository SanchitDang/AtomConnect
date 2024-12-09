import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD-P_BdsMzLMYFw4IRL_RMI7y2pZYiEtwo",
  authDomain: "atom-connect-w0on0w.firebaseapp.com",
  projectId: "atom-connect-w0on0w",
  storageBucket: "atom-connect-w0on0w.appspot.com",
  messagingSenderId: "13091131290",
  appId: "1:13091131290:web:46549f3e286fd6fc4cb423"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const auth = getAuth(firebaseApp);

// Export necessary functions and services
export {
  db,
  storage,
  collection,
  auth,
  firebaseApp,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  ref,
  uploadBytes,
  getDownloadURL,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
};
