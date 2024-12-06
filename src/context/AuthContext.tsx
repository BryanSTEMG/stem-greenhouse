// src/context/AuthContext.tsx

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import { app } from '../firebase';
import { toast } from 'react-toastify';

interface AuthContextProps {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const signedInUser = result.user;

      if (signedInUser.email && signedInUser.email.endsWith('@stemgreenhouse.org')) {
        toast.success('You have successfully signed in!');
      } else {
        toast.error('Your email domain is not authorized. Please use an @stemgreenhouse.org email.');
        await signOut(auth);
      }
    } catch (error) {
      toast.error('An error occurred while attempting to sign in. Please try again.');
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      toast.success('You have successfully signed out.');
    } catch (error) {
      toast.error('An error occurred while signing out. Please try again.');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && currentUser.email && currentUser.email.endsWith('@stemgreenhouse.org')) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
