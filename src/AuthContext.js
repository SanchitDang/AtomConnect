/* eslint-disable react/prop-types */
// AuthContext.js
import React, { useContext, useState, useEffect, createContext } from "react";
import { auth, db, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign in function
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign up function
  const signup = async (name, email, password) => {
    console.log(name, email, password)
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user details to Firestore
    const userDetails = {
      name: name,
      email: user.email,
      brands: [], // Empty array for brands
      createdAt: new Date(), // Timestamp of creation
      uid: user.uid,
    };

    // Create a document for the user in the 'users' collection
    await setDoc(doc(db, "admins", user.uid), userDetails);
    
    return user;
  };

  // Sign out function
  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
