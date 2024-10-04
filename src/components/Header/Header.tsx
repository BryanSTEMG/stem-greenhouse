import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as Logo } from '../../assets/images/logo.svg';
import { ReactComponent as SettingsIcon } from '../../assets/icons/settings.svg';
import { AuthContext } from '../../context/AuthContext';

function Header(): JSX.Element {
  const { user, signIn, signOut } = useContext(AuthContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-gray-800 text-white flex items-center justify-between p-4">
      {/* Left Side */}
      <div className="flex items-center">
        {/* Logo */}
        <Link to="/">
          <Logo className="h-8 w-8 mr-4" />
        </Link>
        {/* Navigation Links */}
        <nav className="flex items-center">
          <Link to="/" className="mx-2 hover:text-gray-400">
            Home
          </Link>
          {/* Generators Dropdown */}
          <div
            className="relative mx-2"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button
              className="flex items-center focus:outline-none"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Generators
              <svg
                className="ml-1 w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.5 7l4.5 4.5L14.5 7h-9z" />
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute bg-white text-black mt-2 py-2 w-48 z-10">
                <Link
                  to="/donor-letter"
                  className="block px-4 py-2 hover:bg-gray-200"
                >
                  Donor Letter
                </Link>
                {/* Add more links here as needed */}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Right Side */}
      <div className="flex items-center">
        {user ? (
          <button onClick={signOut} className="mx-2 hover:text-gray-400">
            Sign Out
          </button>
        ) : (
          <button onClick={signIn} className="mx-2 hover:text-gray-400">
            Sign In with Google
          </button>
        )}
        {/* Settings Icon */}
        <button className="mx-2 focus:outline-none hover:text-gray-400">
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}

export default Header;
