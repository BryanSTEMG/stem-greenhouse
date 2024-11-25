// src/components/SignIn/SignIn.tsx

import React, { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGoogle } from 'react-icons/fa';

const SignIn: React.FC = () => {
  const { user, signInWithGoogle } = useContext(AuthContext);

  const handleSignIn = async () => {
    console.log('SignIn: Sign In button clicked');
    try {
      await signInWithGoogle();
      // Handle successful sign-in, e.g., redirect or state update
      console.log('Successfully signed in!');
    } catch (error) {
      console.error('SignIn: Error during sign in', error);
      // Handle sign-in error
      console.error('Failed to sign in. Please try again.');
    }
  };

  useEffect(() => {
    const imageUrl = `${process.env.PUBLIC_URL}/images/background.jpg`;
    console.log('Attempting to load image from:', imageUrl);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => console.log('Background image loaded successfully.');
    img.onerror = () =>
      console.error(
        'Error loading background image. Check if the path is correct and the file is accessible.'
      );
  }, []);

  if (user) {
    console.log('SignIn: User is already authenticated, redirecting to home');
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL}/images/background.jpg)`,
        }}
      ></div>

      {/* Animated Outer Box */}
      <motion.div
        initial={{ x: '100vw', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className="absolute inset-y-0 right-0 w-full md:w-2/3 lg:w-1/3 flex items-center justify-center px-4"
        style={{
          background: 'linear-gradient(-45deg, #83b786, #7ab680, #6ba674, #5aa668)',
          backgroundSize: '800% 800%',
          animation: 'gradient-animation 15s ease infinite',
          borderRadius: '1rem',
        }}
      >
        {/* Define Keyframes for Gradient Animation */}
        <style>
          {`
            @keyframes gradient-animation {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}
        </style>

        {/* Inner Content Box */}
        <div
          className="p-10 rounded-lg shadow-lg w-full max-w-md border border-white/10"
          style={{
            backgroundColor: '#83b786', // Solid color for inner box
            borderRadius: '1rem',
          }}
        >
          {/* Added whitelogo.png Image */}
          <img
            src={`${process.env.PUBLIC_URL}/images/whitelogo.png`}
            alt="STEM Greenhouse Logo"
            className="w-12 h-12 mb-4 mx-auto"
          />

          {/* Heading */}
          <motion.h1
            className="text-3xl font-bold mb-8 text-center text-white"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 50 }}
          >
            Welcome to STEM Greenhouse
          </motion.h1>

          {/* Sign-In Button */}
          <motion.button
            onClick={handleSignIn}
            className="flex items-center justify-center w-full px-6 py-3 bg-[#0a0002] text-white rounded-lg hover:bg-[#727272] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Sign In with Google"
          >
            <FaGoogle className="mr-2" />
            Sign In with Google
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default SignIn;
