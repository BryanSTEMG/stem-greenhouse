// src/pages/DonorLetter/SingleDonorLetter.tsx

import React, { useState } from 'react';
import { generate } from '@pdfme/generator';
import { format } from 'date-fns';
import { template } from './source';

function SingleDonorLetter(): JSX.Element {
  const [formData, setFormData] = useState({
    date: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    greeting: '',
    amount: '',
    donationDate: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Array of US state codes
  const stateCodes = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  ];

  // Updated handleChange to accept input and select elements
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prevData => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    // Format dates
    const formattedDate = format(new Date(formData.date), 'MMMM d, yyyy');
    const formattedDonationDate = format(new Date(formData.donationDate), 'MMMM d, yyyy');

    // Prepare inputs for PDF generation
    const inputs = [
      {
        'Date': formattedDate,
        'Name': formData.name,
        'Address': formData.address,
        'City': `${formData.city}, ${formData.state} ${formData.zip}`,
        'Greeting': formData.greeting + ",",
        'Amount': `${formData.amount} to support our efforts to`,
        'Amount 2': formData.amount,
        'Date of donation': formattedDonationDate,
      },
    ];

    try {
      // Generate PDF
      // @ts-ignore
      const pdfUint8Array = await generate({ template, inputs });
      const pdfBlob = new Blob([pdfUint8Array], { type: 'application/pdf' });
      setPdfBlob(pdfBlob);
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'DonorLetter.pdf';
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Single Donor Letter Generator</h2>
      <form className="mt-4" onSubmit={handleSubmit}>
        {/* Date */}
        <div className="mb-4">
          <label className="block text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter donor's name"
            required
          />
        </div>
        {/* Address */}
        <div className="mb-4">
          <label className="block text-gray-700">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter address"
            required
          />
        </div>
        {/* City */}
        <div className="mb-4">
          <label className="block text-gray-700">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter city"
            required
          />
        </div>
        {/* State */}
        <div className="mb-4">
          <label className="block text-gray-700">State</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          >
            <option value="">Select a state</option>
            {stateCodes.map(code => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
        {/* Zip Code */}
        <div className="mb-4">
          <label className="block text-gray-700">Zip Code</label>
          <input
            type="text"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter zip code"
            required
          />
        </div>
        {/* Greeting */}
        <div className="mb-4">
          <label className="block text-gray-700">Greeting</label>
          <input
            type="text"
            name="greeting"
            value={formData.greeting}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter greeting"
            required
          />
        </div>
        {/* Gift Amount */}
        <div className="mb-4">
          <label className="block text-gray-700">Gift Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            placeholder="Enter gift amount"
            required
          />
        </div>
        {/* Date of Donation */}
        <div className="mb-4">
          <label className="block text-gray-700">Date of Donation</label>
          <input
            type="date"
            name="donationDate"
            value={formData.donationDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>
        {/* Generate Button */}
        <button
          type="submit"
          className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
            isGenerating ? 'cursor-not-allowed' : ''
          }`}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Letter'}
        </button>
      </form>

      {/* Download PDF Button */}
      {pdfBlob && (
        <div className="mt-4">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default SingleDonorLetter;
