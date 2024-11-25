// src/routes/AppRoutes.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import DonorLetter from '../pages/DonorLetter/DonorLetter';
import CentralLetter from '../pages/CentralLetter/CentralLetter';
import LabelMaker from '../pages/LabelMaker/LabelMaker';
import OrderRequests from '../pages/OrderRequests/OrderRequests'; // Import the new component
import SignIn from '../pages/SignIn/SignIn';
import PrivateRoute from './PrivateRoute';

function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/donor-letter/*"
        element={
          <PrivateRoute>
            <DonorLetter />
          </PrivateRoute>
        }
      />
      <Route
        path="/central-letter"
        element={
          <PrivateRoute>
            <CentralLetter />
          </PrivateRoute>
        }
      />
      <Route
        path="/label-maker"
        element={
          <PrivateRoute>
            <LabelMaker />
          </PrivateRoute>
        }
      />
      <Route
        path="/order-requests/*"
        element={
          <PrivateRoute>
            <OrderRequests />
          </PrivateRoute>
        }
      />
      {/* Other routes can be added here */}
    </Routes>
  );
}

export default AppRoutes;
