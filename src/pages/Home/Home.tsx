import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

function Home(): JSX.Element {
  const { user, signOutUser } = useContext(AuthContext);

  const handleSignOut = async () => {
    console.log('Home: Sign Out button clicked');
    await signOutUser();
  };

  console.log('Home: Current user:', user);

  return (
    <div className="p-4">
      {/* Sign Out Button at the Top Right */}
      <div className="flex justify-end">
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>

      {/* Rest of the Home Page Content */}
      <h1 className="text-3xl font-bold">Welcome to Stem Greenhouse</h1>
      <p className="mt-2">This is the home page.</p>
    </div>
  );
}

export default Home;
