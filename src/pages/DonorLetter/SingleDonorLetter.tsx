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
    const formattedDate = format(new Date(formData.date + 'T00:00:00'), 'MMMM d, yyyy');
    const formattedDonationDate = format(new Date(formData.donationDate + 'T00:00:00'), 'MMMM d, yyyy');

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
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-[#0a0002] mb-6">Single Donor Letter Generator</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Date */}
        <div>
          <label className="block text-gray-700 font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            required
          />
        </div>
        {/* Name */}
        <div>
          <label className="block text-gray-700 font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter donor's name"
            required
          />
        </div>
        {/* Address */}
        <div>
          <label className="block text-gray-700 font-medium">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter address"
            required
          />
        </div>
        {/* City */}
        <div>
          <label className="block text-gray-700 font-medium">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter city"
            required
          />
        </div>
        {/* State and Zip Code */}
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-gray-700 font-medium">State</label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
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
          <div className="flex-1">
            <label className="block text-gray-700 font-medium">Zip Code</label>
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
              placeholder="Enter zip code"
              required
            />
          </div>
        </div>
        {/* Greeting */}
        <div>
          <label className="block text-gray-700 font-medium">Greeting</label>
          <input
            type="text"
            name="greeting"
            value={formData.greeting}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter greeting"
            required
          />
        </div>
        {/* Gift Amount */}
        <div>
          <label className="block text-gray-700 font-medium">Gift Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter gift amount"
            required
          />
        </div>
        {/* Date of Donation */}
        <div>
          <label className="block text-gray-700 font-medium">Date of Donation</label>
          <input
            type="date"
            name="donationDate"
            value={formData.donationDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            required
          />
        </div>
        {/* Generate Button */}
        <div className="text-center">
          <button
            type="submit"
            className={`px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200 ${
              isGenerating ? 'cursor-not-allowed' : ''
            }`}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Letter'}
          </button>
        </div>
      </form>

      {/* Download PDF Button */}
      {pdfBlob && (
        <div className="mt-6 text-center">
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
          >
            Download PDF
          </button>
        </div>
      )}
    </div>
  );
}

export default SingleDonorLetter;