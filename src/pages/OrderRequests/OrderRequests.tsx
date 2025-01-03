// src/pages/OrderRequests/OrderRequests.tsx

import React, { useState } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import SupplyOrderForm from './SupplyOrderPage';
import CopyOrderForm from './CopyOrderPage';

function OrderRequests(): JSX.Element {
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);

  const handleAcceptDisclaimer = () => {
    setDisclaimerAccepted(true);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-4xl font-bold text-center text-[#0a0002] mb-6">Order Requests</h1>
        {!disclaimerAccepted ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Please Read Before Proceeding</h2>
            <p className="text-gray-700 mb-6">
              In order to ensure accuracy and timely delivery, please provide detailed information about your requested items.
              For example, if you need "Balloons," specify the type, size, colors, and any other relevant details.
              Give us enough lead time to ensure on-time delivery.
            </p>
            <button
              onClick={handleAcceptDisclaimer}
              className="px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
            >
              Accept and Continue
            </button>
          </div>
        ) : (
          <>
            {/* Tab Headers */}
            <div className="flex justify-center mb-6 border-b border-gray-200">
              <NavLink
                to="supply-order"
                className={({ isActive }) =>
                  `py-3 px-6 text-lg font-semibold ${
                    isActive
                      ? 'border-b-4 border-[#83b786] text-[#83b786]'
                      : 'text-gray-600 hover:text-[#83b786] hover:border-b-4 hover:border-[#83b786] transition-colors duration-200'
                  }`
                }
              >
                Supply Order Form
              </NavLink>
              <NavLink
                to="copy-order"
                className={({ isActive }) =>
                  `py-3 px-6 text-lg font-semibold ${
                    isActive
                      ? 'border-b-4 border-[#83b786] text-[#83b786]'
                      : 'text-gray-600 hover:text-[#83b786] hover:border-b-4 hover:border-[#83b786] transition-colors duration-200'
                  }`
                }
              >
                Copy Order Form
              </NavLink>
            </div>
            {/* Content Area */}
            <div>
              <Routes>
                <Route path="/" element={<Navigate to="supply-order" replace />} />
                <Route path="supply-order" element={<SupplyOrderForm />} />
                <Route path="copy-order" element={<CopyOrderForm />} />
              </Routes>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OrderRequests;
