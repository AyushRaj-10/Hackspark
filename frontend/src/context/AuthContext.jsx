// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Import db
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Firestore functions

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // 1. Check if user data exists in Firestore
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // 2. If yes, use THAT data (Real data from DB)
          setUser({
            ...currentUser,
            avatar: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`,
            ...docSnap.data() // Spreads points, badges, level, etc.
          });
        } else {
          // 3. Fallback if no DB entry exists yet
          setUser({
            ...currentUser,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`,
            points: 0,
            badges: []
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password, name) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    await updateProfile(user, { displayName: name });

    // 4. SUPER USER HACK: Write profile with unlocked badges
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      points: 1250,
      level: "Urban Legend",
      nextLevelProgress: 85,
      co2Saved: 145.5,
      trips: 42,
      // The "Faked" Badges List
      badges: [
        "eco_starter",    
        "early_bird",     
        "navigator",      
        "streak_7",       
        "zen_master",     // Ensuring all displayed badges are defined in the array
        "explorer",       
        "carbon_crusher", 
        "urban_legend"    
      ]
    });
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};