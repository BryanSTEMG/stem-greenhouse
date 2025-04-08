// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Pages (existing) ...
import Home from '../pages/Home/Home';
import DonorLetter from '../pages/DonorLetter/DonorLetter'; 
import DonorLetterNewPage from '../pages/Letters/DonorLetter/DonorLetterNewPage';
import CentralLetter from '../pages/CentralLetter/CentralLetter';
import LabelMaker from '../pages/LabelMaker/LabelMaker';
import OrderRequests from '../pages/OrderRequests/OrderRequests';
import SignIn from '../pages/SignIn/SignIn';
import PrivateRoute from './PrivateRoute';
import SurveyProcessorPage from '../pages/DataEntry/ParticipantSurveyProcessorPage';
import SalesforcePage from '../pages/Salesforce/SalesforcePage';
import BirthdayFundraiserPage from '../pages/Letters/BirthdayFundraiser/BirthdayFundraiserPage';

// New Hire Page
import NewHirePage from '../pages/Letters/NewHire/NewHirePage';
// Job Acceptance Page
import JobAcceptancePage from '../pages/Letters/JobAcceptance/JobAcceptancePage';

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

      {/* Old Donor Letter */}
      <Route
        path="/donor-letter/*"
        element={
          <PrivateRoute>
            <DonorLetter />
          </PrivateRoute>
        }
      />

      {/* New Donor Letter (Docx) */}
      <Route
        path="/donor-letter-new/*"
        element={
          <PrivateRoute>
            <DonorLetterNewPage />
          </PrivateRoute>
        }
      />

      {/* Central Letter */}
      <Route
        path="/central-letter"
        element={
          <PrivateRoute>
            <CentralLetter />
          </PrivateRoute>
        }
      />

      {/* Birthday Fundraiser */}
      <Route
        path="/birthday-fundraiser"
        element={
          <PrivateRoute>
            <BirthdayFundraiserPage />
          </PrivateRoute>
        }
      />

      {/* Label Maker */}
      <Route
        path="/label-maker"
        element={
          <PrivateRoute>
            <LabelMaker />
          </PrivateRoute>
        }
      />

      {/* Order Requests */}
      <Route
        path="/order-requests/*"
        element={
          <PrivateRoute>
            <OrderRequests />
          </PrivateRoute>
        }
      />

      {/* Survey Processor */}
      <Route
        path="/survey-processor"
        element={
          <PrivateRoute>
            <SurveyProcessorPage />
          </PrivateRoute>
        }
      />

      {/* Salesforce */}
      <Route
        path="/salesforce"
        element={
          <PrivateRoute>
            <SalesforcePage />
          </PrivateRoute>
        }
      />

      {/* New Hire */}
      <Route
        path="/new-hire"
        element={
          <PrivateRoute>
            <NewHirePage />
          </PrivateRoute>
        }
      />

      {/* Job Acceptance */}
      <Route
        path="/job-acceptance"
        element={
          <PrivateRoute>
            <JobAcceptancePage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
