import React from 'react';
import DonorLetterForm, { DonorLetterFormData } from './DonorLetterForm';

function SingleDonorLetter(): JSX.Element {
  /**
   * Called when user clicks "Generate Letter" in the form.
   * You can add docx or PDF generation logic here.
   */
  const handleFormSubmit = (data: DonorLetterFormData) => {
    console.log('Form submitted:', data);
    // e.g. generate a docx/PDF file, or call an API endpoint, etc.
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-[#0a0002] mb-6">
        Single Donor Letter Generator
      </h2>
      <DonorLetterForm onSubmit={handleFormSubmit} />
    </div>
  );
}

export default SingleDonorLetter;
