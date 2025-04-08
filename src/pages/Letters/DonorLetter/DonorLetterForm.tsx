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

interface DonorLetterFormProps {
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
    letterDate: formatDate(new Date()),
    donorName: 'John and Jane Doe',
    address: '123 Main Street',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    donationAmount: '500.00',
    donationDate: formatDate(new Date()),
  });

  /**
   * Parse the ISO date from the input (YYYY-MM-DD) into local format
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
          value={new Date(formData.letterDate).toISOString().split('T')[0]}
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
          placeholder="e.g. John and Jane Doe"
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
        />
      </div>

      {/* City, State, Zip */}
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
            placeholder="Springfield"
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
            {/* Add other states as needed */}
            <option value="AL">AL</option>
            <option value="AK">AK</option>
            <option value="AZ">AZ</option>
            <option value="AR">AR</option>
            <option value="CA">CA</option>
            <option value="CO">CO</option>
            <option value="CT">CT</option>
            <option value="DE">DE</option>
            <option value="FL">FL</option>
            <option value="GA">GA</option>
            <option value="HI">HI</option>
            <option value="ID">ID</option>
            <option value="IL">IL</option>
            <option value="IN">IN</option>
            {/* ... etc. */}
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
            placeholder="62704"
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
          placeholder="500.00"
        />
      </div>

      {/* Donation Date */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-1">
          Donation Date:
        </label>
        <input
          type="date"
          value={new Date(formData.donationDate).toISOString().split('T')[0]}
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
