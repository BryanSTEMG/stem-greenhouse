import React, { useState } from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import DonorLetterForm, { DonorLetterFormData } from './DonorLetterForm';
import DonorLetterOutput from './DonorLetterOutput';
import BatchFromTemplate from './BatchFromTemplate';
import BatchFromXLSX from './BatchFromXLSX';

/**
 * A small inline component for the "Single Generator" tab,
 * which displays the form and output side by side.
 */
const SingleGenerator: React.FC = () => {
  const [formData, setFormData] = useState<DonorLetterFormData | null>(null);

  const handleFormSubmit = (data: DonorLetterFormData) => {
    console.log('Form data received in SingleGenerator:', data);
    setFormData(data);
  };

  return (
    <div>
      {/* The single-donor form */}
      <DonorLetterForm onSubmit={handleFormSubmit} />

      {/* If user has submitted data, show the docx output generator */}
      {formData && (
        <div className="mt-8">
          <DonorLetterOutput formData={formData} />
        </div>
      )}
    </div>
  );
};

/**
 * Main page with tabbed navigation for Donor Letter (New).
 */
const DonorLetterNewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-4xl font-bold text-center text-[#0a0002] mb-6">
          Donor Letter (New)
        </h1>

        {/* Tab Headers */}
        <div className="flex justify-center mb-6 border-b border-gray-200">
          <NavLink
            to="single"
            end
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

        {/* Routes for each tab */}
        <Routes>
          <Route path="single" element={<SingleGenerator />} />
          <Route path="batch-template" element={<BatchFromTemplate />} />
          <Route path="batch-xlsx" element={<BatchFromXLSX />} />
          {/* Fallback if no sub-route is matched */}
          <Route
            path="*"
            element={
              <p className="text-center text-gray-600">
                Please select an option above.
              </p>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default DonorLetterNewPage;
