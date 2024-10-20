// src/routes/AppRoutes.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import DonorLetter from '../pages/DonorLetter/DonorLetter';
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
      {/* Other routes can be added here */}
    </Routes>
  );
}

export default AppRoutes;
