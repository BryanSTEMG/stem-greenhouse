// src/components/Header/Header.tsx

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Header(): JSX.Element {
  const { user, signOutUser } = useContext(AuthContext);

  return (
    <header className="bg-gray-800 text-white flex items-center justify-between p-4">
      {/* Left Side */}
      <div className="flex items-center">
        <Link to="/">
          <span className="text-xl font-bold mr-4">Stem Greenhouse</span>
        </Link>
        <nav className="flex items-center">
          <Link to="/" className="mx-2 hover:text-gray-400">
            Home
          </Link>
          <Link to="/donor-letter" className="mx-2 hover:text-gray-400">
            Donor Letter
          </Link>
          {/* Add other navigation links if needed */}
        </nav>
      </div>

      {/* Right Side */}
      <div className="flex items-center">
        {user && (
          <button
            onClick={signOutUser}
            className="mx-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
