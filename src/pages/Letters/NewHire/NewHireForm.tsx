import React, { useState } from 'react';

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

interface NewHireFormProps {
  onSubmit: (data: NewHireFormData) => void;
}

/**
 * Format a date string (ISO) into "MMM dd yyyy" (no commas).
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date
    .toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
    .replace(',', '');
};

const NewHireForm: React.FC<NewHireFormProps> = ({ onSubmit }) => {
  /**
   * Default form state. Using your "testing" defaults.
   * We transform them to "MMM dd yyyy" format for display.
   */
  const [formData, setFormData] = useState<NewHireFormData>({
    date: formatDate(new Date().toISOString()),
    candidateName: 'Jane Doe',
    candidateAddress: '123 STEM Lane',
    city: 'Grand Rapids',
    state: 'MI',
    zip: '49507',
    jobTitle: 'STEM Education Coordinator',
    employmentType: 'full-time',
    supervisorName: 'Alex Johnson',
    startDate: formatDate(
      new Date(Date.now() + 12096e5).toISOString() // +2 weeks
    ),
    salary: '45,000',
    payPeriod: 'year',
    weeklyHours: '40',
    responseDeadline: formatDate(
      new Date(Date.now() + 6048e5).toISOString() // +1 week
    ),
  });

  /**
   * When user clicks "Generate Offer Letter"
   * we pass the formatted data up.
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
   * Convert "MMM dd yyyy" -> "YYYY-MM-DD" for <input type="date" />
   */
  const getDateInputValue = (dateStr: string) => {
    // Attempt to parse the date
    const parsed = new Date(dateStr);
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
            setFormData({
              ...formData,
              candidateAddress: e.target.value,
            })
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
            <option value="MI">MI</option>
            {/* Add other states as needed */}
            <option value="IL">IL</option>
            <option value="OH">OH</option>
            <option value="IN">IN</option>
            <option value="WI">WI</option>
            {/* etc. */}
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
            setFormData({
              ...formData,
              employmentType: e.target.value,
            })
          }
        >
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
            setFormData({
              ...formData,
              supervisorName: e.target.value,
            })
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
        Generate Offer Letter
      </button>
    </form>
  );
};

export default NewHireForm;
