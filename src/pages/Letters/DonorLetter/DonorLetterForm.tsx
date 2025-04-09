import React, { useState } from 'react';

/**
 * Interface describing the fields for a donor letter (DOCX) generator.
 */
export interface DonorLetterFormData {
  letterDate: string;
  donorName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  donationAmount: string;
  donationDate: string;
}

export interface DonorLetterFormProps {
  onSubmit: (data: DonorLetterFormData) => void;
}

/**
 * Formats a JavaScript Date into "MMM dd yyyy" without commas.
 */
const formatDate = (date: Date) => {
  return date
    .toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
    .replace(',', '');
};

const DonorLetterForm: React.FC<DonorLetterFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<DonorLetterFormData>({
    letterDate: '',
    donorName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    donationAmount: '',
    donationDate: '',
  });

  const stateCodes = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  ];

  /**
   * Parse the ISO date from the input (YYYY-MM-DD) into local format.
   */
  const handleDateChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'letterDate' | 'donationDate'
  ) => {
    const newRawDate = e.target.value; // "YYYY-MM-DD"
    if (!newRawDate) return;
    const newDateObj = new Date(newRawDate);
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: formatDate(newDateObj),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      {/* Letter Date */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Letter Date:
        </label>
        <input
          type="date"
          value={
            formData.letterDate
              ? new Date(formData.letterDate).toISOString().split('T')[0]
              : ''
          }
          onChange={(e) => handleDateChange(e, 'letterDate')}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
        />
      </div>

      {/* Donor Name(s) */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Donor Name(s):
        </label>
        <input
          type="text"
          value={formData.donorName}
          onChange={(e) =>
            setFormData({ ...formData, donorName: e.target.value })
          }
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          placeholder="Enter donor name(s)"
        />
      </div>

      {/* Street Address */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Street Address:
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          placeholder="Enter street address"
        />
      </div>

      {/* City, State, ZIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* City */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            City:
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) =>
              setFormData({ ...formData, city: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter city"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            State:
          </label>
          <select
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          >
            <option value="">Select state</option>
            {stateCodes.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>

        {/* ZIP */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            ZIP:
          </label>
          <input
            type="text"
            value={formData.zip}
            onChange={(e) =>
              setFormData({ ...formData, zip: e.target.value })
            }
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter ZIP code"
          />
        </div>
      </div>

      {/* Donation Amount */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Donation Amount:
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.donationAmount}
          onChange={(e) =>
            setFormData({ ...formData, donationAmount: e.target.value })
          }
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          placeholder="Enter donation amount"
        />
      </div>

      {/* Donation Date */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-1">
          Donation Date:
        </label>
        <input
          type="date"
          value={
            formData.donationDate
              ? new Date(formData.donationDate).toISOString().split('T')[0]
              : ''
          }
          onChange={(e) => handleDateChange(e, 'donationDate')}
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-[#83b786] text-white font-semibold py-3 rounded-md hover:bg-[#72a376] transition-colors duration-200"
      >
        Generate Letter
      </button>
    </form>
  );
};

export default DonorLetterForm;
