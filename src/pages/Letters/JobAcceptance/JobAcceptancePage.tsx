import React, { useState } from 'react';
import JobAcceptanceForm, { JobAcceptanceFormData } from './JobAcceptanceForm';
import JobAcceptanceOutput from './JobAcceptanceOutput';

/**
 * Main container for the "Job Acceptance" letter generator page.
 */
const JobAcceptancePage: React.FC = () => {
  const [formData, setFormData] = useState<JobAcceptanceFormData | null>(null);

  const handleGenerate = (data: JobAcceptanceFormData) => {
    console.log('JobAcceptancePage received form data:', data);
    setFormData(data);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#0a0002]">
          Job Acceptance Letter
        </h1>

        <JobAcceptanceForm onGenerate={handleGenerate} />

        {/* Show docx generation button if we have data */}
        {formData && (
          <div className="mt-8">
            <JobAcceptanceOutput formData={formData} />
          </div>
        )}
      </div>
    </div>
  );
};

export default JobAcceptancePage;
