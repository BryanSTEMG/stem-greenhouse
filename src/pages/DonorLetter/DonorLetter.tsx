// src/pages/DonorLetter/DonorLetter.tsx

import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import SingleDonorLetter from './SingleDonorLetter';

// NEW IMPORTS
import BatchFromTemplate from './BatchFromTemplate';
import BatchFromXlsx from './BatchFromXLSX';

function DonorLetter(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-4xl font-bold text-center text-[#0a0002] mb-6">Donor Letter Generator</h1>

        {/* Tab Headers */}
        <div className="flex justify-center mb-6 border-b border-gray-200">
          <NavLink
            to="single"
            className={({ isActive }) =>
              `py-3 px-6 text-lg font-semibold ${
                isActive
                  ? 'border-b-4 border-[#83b786] text-[#83b786]'
                  : 'text-gray-600 hover:text-[#83b786] hover:border-b-4 hover:border-[#83b786] transition-colors duration-200'
              }`
            }
          >
            Single Generator
          </NavLink>

          {/* New tab for Batch from Template */}
          <NavLink
            to="batch-template"
            className={({ isActive }) =>
              `py-3 px-6 text-lg font-semibold ${
                isActive
                  ? 'border-b-4 border-[#83b786] text-[#83b786]'
                  : 'text-gray-600 hover:text-[#83b786] hover:border-b-4 hover:border-[#83b786] transition-colors duration-200'
              }`
            }
          >
            Batch from Template
          </NavLink>

          {/* New tab for Batch from XLSX */}
          <NavLink
            to="batch-xlsx"
            className={({ isActive }) =>
              `py-3 px-6 text-lg font-semibold ${
                isActive
                  ? 'border-b-4 border-[#83b786] text-[#83b786]'
                  : 'text-gray-600 hover:text-[#83b786] hover:border-b-4 hover:border-[#83b786] transition-colors duration-200'
              }`
            }
          >
            Batch from XLSX
          </NavLink>
        </div>

        {/* Content Area */}
        <div>
          <Routes>
            <Route path="single" element={<SingleDonorLetter />} />

            {/* Route for "Batch from Template" */}
            <Route path="batch-template" element={<BatchFromTemplate />} />

            {/* Route for "Batch from XLSX" */}
            <Route path="batch-xlsx" element={<BatchFromXlsx />} />

            {/* Default (if none selected) */}
            <Route path="/" element={<p className="text-center text-gray-600">Please select an option above.</p>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default DonorLetter;
