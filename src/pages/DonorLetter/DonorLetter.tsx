// src/pages/DonorLetter/DonorLetter.tsx

import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import SingleDonorLetter from './SingleDonorLetter';
import BatchDonorLetter from './BatchDonorLetter';

function DonorLetter(): JSX.Element {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Donor Letter Generator</h1>
      <div className="mt-4">
        {/* Tab Headers */}
        <div className="flex border-b">
          <NavLink
            to="single"
            className={({ isActive }) =>
              `py-2 px-4 -mb-px border-b-2 font-medium text-sm ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            Single Generator
          </NavLink>
          <NavLink
            to="batch"
            className={({ isActive }) =>
              `py-2 px-4 -mb-px border-b-2 font-medium text-sm ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`
            }
          >
            Batch Generator
          </NavLink>
        </div>
        {/* Content Area */}
        <div className="mt-4">
          <Routes>
            <Route path="single" element={<SingleDonorLetter />} />
            <Route path="batch" element={<BatchDonorLetter />} />
            <Route path="/" element={<p>Please select an option above.</p>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default DonorLetter;
