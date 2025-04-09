import React, { useState } from 'react'

/**
 * Interface describing the fields for the New Hire Offer Letter.
 */
export interface NewHireFormData {
  date: string;
  candidateName: string;
  candidateAddress: string;
  city: string;
  state: string;
  zip: string;
  jobTitle: string;
  employmentType: string;
  supervisorName: string;
  startDate: string;
  salary: string;
  payPeriod: string;
  weeklyHours: string;
  responseDeadline: string;
}

/**
 * Format a date string (ISO) into "MMM dd yyyy" (no commas).
 */
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date
    .toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
    .replace(',', '');
};

interface NewHireFormProps {
  onSubmit: (data: NewHireFormData) => void;
}

// Complete list of U.S. state codes.
const stateCodes = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

const NewHireForm: React.FC<NewHireFormProps> = ({ onSubmit }) => {
  /**
   * Default form state with empty values.
   */
  const [formData, setFormData] = useState<NewHireFormData>({
    date: '',
    candidateName: '',
    candidateAddress: '',
    city: '',
    state: '',
    zip: '',
    jobTitle: '',
    employmentType: '',
    supervisorName: '',
    startDate: '',
    salary: '',
    payPeriod: '',
    weeklyHours: '',
    responseDeadline: '',
  });

  /**
   * When user clicks "Generate Letter" we pass the formatted data up.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      // Ensure these fields are re-formatted as "MMM dd yyyy"
      date: formatDate(formData.date),
      startDate: formatDate(formData.startDate),
      responseDeadline: formatDate(formData.responseDeadline),
    });
  };

  /**
   * Convert a date string to "YYYY-MM-DD" for <input type="date" />.
   */
  const getDateInputValue = (dateStr: string) => {
    if (!dateStr) return '';
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return '';
    return parsed.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
      {/* Offer Date */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Offer Date:
        </label>
        <input
          type="date"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          value={getDateInputValue(formData.date)}
          onChange={(e) =>
            setFormData({ ...formData, date: e.target.value })
          }
        />
      </div>

      {/* Candidate Name */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Candidate Name:
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          value={formData.candidateName}
          onChange={(e) =>
            setFormData({ ...formData, candidateName: e.target.value })
          }
        />
      </div>

      {/* Address */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Address:
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          value={formData.candidateAddress}
          onChange={(e) =>
            setFormData({ ...formData, candidateAddress: e.target.value })
          }
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
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            value={formData.city}
            onChange={(e) =>
              setFormData({ ...formData, city: e.target.value })
            }
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            State:
          </label>
          <select
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            value={formData.state}
            onChange={(e) =>
              setFormData({ ...formData, state: e.target.value })
            }
          >
            <option value="">Select a state</option>
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
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            value={formData.zip}
            onChange={(e) =>
              setFormData({ ...formData, zip: e.target.value })
            }
          />
        </div>
      </div>

      {/* Job Title */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Job Title:
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          value={formData.jobTitle}
          onChange={(e) =>
            setFormData({ ...formData, jobTitle: e.target.value })
          }
        />
      </div>

      {/* Employment Type */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Employment Type:
        </label>
        <select
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          value={formData.employmentType}
          onChange={(e) =>
            setFormData({ ...formData, employmentType: e.target.value })
          }
        >
          <option value="">Select employment type</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
        </select>
      </div>

      {/* Supervisor Name */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Supervisor Name:
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          value={formData.supervisorName}
          onChange={(e) =>
            setFormData({ ...formData, supervisorName: e.target.value })
          }
        />
      </div>

      {/* Start Date */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Start Date:
        </label>
        <input
          type="date"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          value={getDateInputValue(formData.startDate)}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
        />
      </div>

      {/* Salary + Pay Period */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Salary:
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            value={formData.salary}
            onChange={(e) =>
              setFormData({ ...formData, salary: e.target.value })
            }
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Pay Period:
          </label>
          <select
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            value={formData.payPeriod}
            onChange={(e) =>
              setFormData({ ...formData, payPeriod: e.target.value })
            }
          >
            <option value="">Select pay period</option>
            <option value="hour">Hour</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {/* Weekly Hours */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Weekly Hours:
        </label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          value={formData.weeklyHours}
          onChange={(e) =>
            setFormData({ ...formData, weeklyHours: e.target.value })
          }
        />
      </div>

      {/* Response Deadline */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-1">
          Response Deadline:
        </label>
        <input
          type="date"
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
          value={getDateInputValue(formData.responseDeadline)}
          onChange={(e) =>
            setFormData({
              ...formData,
              responseDeadline: e.target.value,
            })
          }
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

export default NewHireForm;
