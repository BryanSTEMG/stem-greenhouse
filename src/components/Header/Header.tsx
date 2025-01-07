// src/components/Header/Header.tsx

import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Header(): JSX.Element {
  const { user, signOutUser } = useContext(AuthContext);

  return (
    <header className="bg-[#0a0002] text-white flex items-center justify-between px-6 py-2 shadow-md">
      {/* Left Side (Logo and Navigation Links) */}
      <div className="flex items-center">
        {/* Logo and Company Name */}
        <Link to="/" className="flex items-center">
          <img
            src={`${process.env.PUBLIC_URL}/images/logo.png`}
            alt="STEM Greenhouse Logo"
            className="h-8 mr-2"
          />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold text-[#ffffff]">STEM</span>
            <span className="text-xl font-bold text-[#ffffff] -mt-1">Greenhouse</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-10 border-l border-gray-300 mx-4"></div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-lg font-medium ${
                isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/order-requests"
            className={({ isActive }) =>
              `text-lg font-medium ${
                isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
              }`
            }
          >
            Order Requests
          </NavLink>
          <NavLink
            to="/label-maker"
            className={({ isActive }) =>
              `text-lg font-medium ${
                isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
              }`
            }
          >
            Label Maker
          </NavLink>
          <NavLink
            to="/donor-letter"
            className={({ isActive }) =>
              `text-lg font-medium ${
                isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
              }`
            }
          >
            Donor Letter
          </NavLink>
          <NavLink
            to="/central-letter"
            className={({ isActive }) =>
              `text-lg font-medium ${
                isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
              }`
            }
          >
            Central Letter
          </NavLink>
          {/* Attendance Link */}
          <a
            href="https://access.stemgreenhouse.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-medium text-white hover:text-[#83b786] transition-colors duration-200"
          >
            Attendance
          </a>

          {/* New link to your Survey Processor */}
          <NavLink
            to="/survey-processor"
            className={({ isActive }) =>
              `text-lg font-medium ${
                isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
              }`
            }
          >
            Survey Processor
          </NavLink>
        </nav>
      </div>

      {/* Right Side (Sign Out Button) */}
      <div className="flex items-center">
        {user && (
          <button
            onClick={signOutUser}
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
          >
            Sign Out
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
