// src/components/Header/Header.tsx

import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as Logo } from "../../assets/images/logo.svg";
import { ReactComponent as SettingsIcon } from "../../assets/icons/settings.svg";
import { AuthContext } from "../../context/AuthContext";

function Header(): JSX.Element {
  const { user, signOutUser } = useContext(AuthContext);

  return (
    <header className="bg-gray-800 text-white flex items-center justify-between p-4">
      {/* Left Side */}
      <div className="flex items-center">
        <Link to="/">
          <Logo className="h-8 w-8 mr-4" />
        </Link>
        <nav className="flex items-center">
          <Link to="/" className="mx-2 hover:text-gray-400">
            Home
          </Link>
          {/* Generators Dropdown */}
          {/* (Include your existing Generators dropdown code here) */}
        </nav>
      </div>

      {/* Right Side */}
      <div className="flex items-center">
        {user && (
          <button onClick={signOutUser} className="mx-2 hover:text-gray-400">
            Sign Out
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
