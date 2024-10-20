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
      {/* Rest of the Home Page Content */}
      <h1 className="text-3xl font-bold">Welcome to Stem Greenhouse</h1>
      <p className="mt-2">This is the home page.</p>
    </div>
  );
}

export default Home;
