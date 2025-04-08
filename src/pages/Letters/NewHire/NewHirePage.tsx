import React, { useState } from 'react';
import NewHireForm, { NewHireFormData } from './NewHireForm';
import NewHireOutput from './NewHireOutput';

/**
 * Main container for the "New Hire Letter" page.
 * Renders the form and, once submitted, displays a button for docx generation.
 */
const NewHirePage: React.FC = () => {
  const [formData, setFormData] = useState<NewHireFormData | null>(null);

  const handleFormSubmit = (data: NewHireFormData) => {
    console.log('NewHirePage received form data:', data);
    setFormData(data);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#0a0002]">
          New Hire Offer Letter
        </h1>

        {/* The New Hire Form */}
        <NewHireForm onSubmit={handleFormSubmit} />

        {/* If we have data, show the docx output generator */}
        {formData && (
          <div className="mt-8">
            <NewHireOutput formData={formData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewHirePage;
