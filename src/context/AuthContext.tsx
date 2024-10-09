import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import app from '../firebase';

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

  const allowedEmails = ['bryan@stemgreenhouse.org']; 

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting to sign in with Google');
      const result = await signInWithPopup(auth, provider);
      const signedInUser = result.user;

      if (signedInUser.email && allowedEmails.includes(signedInUser.email)) {
        console.log('Sign-in successful and email is authorized');
        // User will be set in onAuthStateChanged
      } else {
        console.log('Email is not authorized');
        // Sign out the user
        await signOut(auth);
        alert('Your email is not authorized to access this application.');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const signOutUser = async () => {
    try {
      console.log('Attempting to sign out');
      await signOut(auth);
      console.log('Sign-out successful');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      if (currentUser && currentUser.email && allowedEmails.includes(currentUser.email)) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    console.log('AuthContext: Loading authentication state...');
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
