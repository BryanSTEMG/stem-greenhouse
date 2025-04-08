// src/components/Header/Header.tsx

import React, { useContext, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaChevronDown } from 'react-icons/fa';

function Header(): JSX.Element {
  const { user, signOutUser } = useContext(AuthContext);
  const [isLettersOpen, setIsLettersOpen] = useState(false);

  return (
    <header className="bg-[#0a0002] text-white flex items-center justify-between px-6 py-2 shadow-md">
      {/* Left Side: Logo + Nav */}
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img
            src={`${process.env.PUBLIC_URL}/images/logo.png`}
            alt="STEM Greenhouse Logo"
            className="h-8 mr-2"
          />
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold text-white">STEM</span>
            <span className="text-xl font-bold text-white -mt-1">Greenhouse</span>
          </div>
        </Link>

        <div className="h-10 border-l border-gray-300 mx-4"></div>

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

          {/* Letters Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLettersOpen(!isLettersOpen)}
              className="flex items-center text-lg font-medium text-white hover:text-[#83b786]"
            >
              Letters
              <FaChevronDown
                className={`ml-1 transition-transform duration-200 ${
                  isLettersOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isLettersOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-[#0a0002] rounded-md shadow-lg py-1 z-50">
                <NavLink
                  to="/donor-letter"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
                    }`
                  }
                  onClick={() => setIsLettersOpen(false)}
                >
                  Donor Letter (Old)
                </NavLink>
                <NavLink
                  to="/central-letter"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
                    }`
                  }
                  onClick={() => setIsLettersOpen(false)}
                >
                  Central Letter
                </NavLink>
                <NavLink
                  to="/birthday-fundraiser"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
                    }`
                  }
                  onClick={() => setIsLettersOpen(false)}
                >
                  Birthday Fundraiser
                </NavLink>
                <NavLink
                  to="/donor-letter-new"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
                    }`
                  }
                  onClick={() => setIsLettersOpen(false)}
                >
                  Donor Letter (New)
                </NavLink>
                <NavLink
                  to="/new-hire"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
                    }`
                  }
                  onClick={() => setIsLettersOpen(false)}
                >
                  New Hire Letter
                </NavLink>
                <NavLink
                  to="/job-acceptance"
                  className={({ isActive }) =>
                    `block px-4 py-2 text-sm ${
                      isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
                    }`
                  }
                  onClick={() => setIsLettersOpen(false)}
                >
                  Job Acceptance Letter
                </NavLink>
              </div>
            )}
          </div>

          {/* Attendance */}
          <a
            href="https://access.stemgreenhouse.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-medium text-white hover:text-[#83b786] transition-colors duration-200"
          >
            Attendance
          </a>

          {/* Salesforce */}
          <NavLink
            to="/salesforce"
            className={({ isActive }) =>
              `text-lg font-medium ${
                isActive ? 'text-[#83b786]' : 'text-white hover:text-[#83b786]'
              }`
            }
          >
            Salesforce
          </NavLink>
        </nav>
      </div>

      {/* Right Side: Sign Out */}
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
