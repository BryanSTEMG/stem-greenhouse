// src/pages/Letters/LettersPage.tsx
import React, { useState } from 'react';

// Different forms
import BirthdayFundraiserForm from './BirthdayFundraiser/BirthdayFundraiserForm';
import DonorLetterForm from './DonorLetter/DonorLetterForm';

import JobAcceptanceForm from './JobAcceptance/JobAcceptanceForm';
import { JobAcceptanceFormData } from './JobAcceptance/JobAcceptanceForm';

import NewHireForm from './NewHire/NewHireForm';
import { NewHireFormData } from './NewHire/NewHireForm';

const LettersPage: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState<string>('');

  const handleLetterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLetter(event.target.value);
  };

  const handleNewHireSubmit = (data: NewHireFormData) => {
    console.log('Submitting New Hire form data:', data);
  };

  // Example stub for job acceptance
  const handleJobAcceptGenerate = (data: JobAcceptanceFormData) => {
    console.log('Generating Job Acceptance form data:', data);
  };

  const renderForm = () => {
    switch (selectedLetter) {
      case 'birthday':
        return <BirthdayFundraiserForm onGenerate={() => { /* stub */ }} />;
      case 'donor':
        return <DonorLetterForm onSubmit={() => { /* stub */ }} />;
      case 'newHire':
        return <NewHireForm onSubmit={handleNewHireSubmit} />;
      case 'jobAcceptance':
        return <JobAcceptanceForm onGenerate={handleJobAcceptGenerate} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-xl mx-auto">
      <h1 className="text-4xl font-bold text-center text-[#0a0002] mb-6">
        Letter Generator
      </h1>

      <select
        value={selectedLetter}
        onChange={handleLetterChange}
        className="w-full px-4 py-3 border rounded-md mb-6"
      >
        <option value="">Select Letter Type</option>
        <option value="birthday">Birthday Fundraiser Letter</option>
        <option value="donor">Donor Letter (New DOCX)</option>
        <option value="newHire">New Hire Letter</option>
        <option value="jobAcceptance">Job Acceptance Letter</option>
      </select>

      {renderForm()}
    </div>
  );
};

export default LettersPage;
