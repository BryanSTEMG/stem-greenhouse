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
        <h1 className="text-4xl font-bold text-center text-[#0a0002] mb-6">
          Order Requests
        </h1>

        {!disclaimerAccepted ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Please Read Before Proceeding</h2>

            {/* Copy Order Instructions */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[#83b786] mb-2">Copy Order Guidelines</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>
                  <strong>Notice:</strong> Minimum <em>3 days</em> lead time is required.
                </li>
                <li>
                  <strong>Pick-up:</strong> Copies will be ready at the work table by the downstairs fridge.
                </li>
                <li>
                  <strong>Special Instructions:</strong> If you need staples, double-sided printing, specific page ranges, etc., please note them clearly.
                </li>
                <li>
                  <strong>Color vs. Black & White:</strong> Please request color copies only when absolutely necessary to help us manage costs.
                </li>
              </ul>
            </div>

            {/* Supply Order Instructions */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#83b786] mb-2">Supply Order Guidelines</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>
                  <strong>Notice:</strong> Minimum <em>5 days</em> lead time is required for ordering supplies.
                </li>
                <li>
                  <strong>Pick-up:</strong> Supplies can be collected from the designated shelf in the office (TBD) or at your selected site.
                </li>
                <li>
                  <strong>Details:</strong> Provide complete product details—brand, model, size, quantity, color, vendor link, etc.—to ensure we order exactly what you need.
                </li>
                <li>
                  <strong>Bulk vs. Individual:</strong> If you need items in packs (e.g., three-packs), specify that to avoid receiving single units.
                </li>
              </ul>
            </div>

            <div className="text-center">
              <button
                onClick={handleAcceptDisclaimer}
                className="px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
              >
                Accept and Continue
              </button>
            </div>
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
