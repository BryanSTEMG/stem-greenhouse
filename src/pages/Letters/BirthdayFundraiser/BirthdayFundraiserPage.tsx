import React, { useState } from 'react';
import BirthdayFundraiserForm, { FormData } from './BirthdayFundraiserForm';
import BirthdayFundraiserOutput from './BirthdayFundraiserOutput';

const BirthdayFundraiserPage: React.FC = () => {
  // We'll store the submitted form data here
  const [formData, setFormData] = useState<FormData | null>(null);

  // This callback is passed to the form
  const handleGenerate = (data: FormData) => {
    console.log("Received form data in BirthdayFundraiserPage:", data);
    setFormData(data);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        {/* 1) Render the Form */}
        <BirthdayFundraiserForm onGenerate={handleGenerate} />

        {/* 2) If we have form data, show the output (download buttons) */}
        {formData && (
          <div className="mt-8">
            <BirthdayFundraiserOutput formData={formData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthdayFundraiserPage;
