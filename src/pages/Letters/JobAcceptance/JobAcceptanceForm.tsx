import React, { useState } from 'react'

/**
 * Data interface describing fields for the Job Acceptance form.
 */
export interface JobAcceptanceFormData {
  candidateName: string;
  jobTitle: string;
  startDate: string;   // e.g. "2025-04-21"
  salary: string;      // e.g. "45,000"
  payPeriod: string;   // "hour" or "year"
}

export interface JobAcceptanceFormProps {
  onGenerate: (data: JobAcceptanceFormData) => void;
}

/**
 * A Tailwind-styled form for job acceptance.
 */
const JobAcceptanceForm: React.FC<JobAcceptanceFormProps> = ({ onGenerate }) => {
  const [formData, setFormData] = useState<JobAcceptanceFormData>({
    candidateName: '',
    jobTitle: '',
    startDate: '',
    salary: '',
    payPeriod: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      {/* Candidate Name */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Candidate’s Name:
        </label>
        <input
          type="text"
          value={formData.candidateName}
          onChange={(e) =>
            setFormData({ ...formData, candidateName: e.target.value })
          }
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
        />
      </div>

      {/* Job Title */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Job Title:
        </label>
        <input
          type="text"
          value={formData.jobTitle}
          onChange={(e) =>
            setFormData({ ...formData, jobTitle: e.target.value })
          }
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
        />
      </div>

      {/* Start Date */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Start Date:
        </label>
        <input
          type="date"
          value={formData.startDate}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
        />
      </div>

      {/* Salary */}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-1">
          Salary:
        </label>
        <input
          type="text"
          value={formData.salary}
          onChange={(e) =>
            setFormData({ ...formData, salary: e.target.value })
          }
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
        />
      </div>

      {/* Pay Period */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-1">
          Pay Period:
        </label>
        <select
          value={formData.payPeriod}
          onChange={(e) =>
            setFormData({ ...formData, payPeriod: e.target.value })
          }
          className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
        >
          <option value="">Select pay period</option>
          <option value="hour">Hour</option>
          <option value="year">Year</option>
        </select>
      </div>

      {/* Generate Button */}
      <button
        type="submit"
        className="w-full bg-[#83b786] text-white font-semibold py-3 rounded-md hover:bg-[#72a376] transition-colors duration-200"
      >
        Generate Letter
      </button>
    </form>
  );
};

export default JobAcceptanceForm;
