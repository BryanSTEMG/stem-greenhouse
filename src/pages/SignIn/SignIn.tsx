import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';

function SignIn(): JSX.Element {
  const { user, signInWithGoogle } = useContext(AuthContext);

  const handleSignIn = async () => {
    console.log('SignIn: Sign In button clicked');
    await signInWithGoogle();
  };

  if (user) {
    console.log('SignIn: User is already authenticated, redirecting to home');
    return <Navigate to="/" />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Welcome to Stem Greenhouse
        </h1>
        <button
          onClick={handleSignIn}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
}

export default SignIn;
