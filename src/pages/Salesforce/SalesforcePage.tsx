// src/pages/Salesforce/SalesforcePage.tsx

import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

/**
 * If only certain users can upload to Salesforce, list them here.
 * You can also store this array in .env or Firestore if you prefer.
 */
const ALLOWED_SALESFORCE_USERS = [
  'bryan@stemgreenhouse.org',
  'info@stemgreenhouse.org',
  // Add more authorized emails as needed.
];

function SalesforcePage(): JSX.Element {
  const { user } = useContext(AuthContext);

  // Has the user accepted the disclaimers/instructions?
  const [disclaimerAccepted, setDisclaimerAccepted] = useState<boolean>(false);
  // Checkbox state to control the "Continue" button
  const [disclaimerChecked, setDisclaimerChecked] = useState<boolean>(false);

  // File upload state
  const [file, setFile] = useState<File | null>(null);

  /**
   * REPLACE this with your actual API Gateway endpoint + route.
   * For example:
   *   "https://6vs9aydei8.execute-api.us-east-2.amazonaws.com/default/salesforceUploadFunction"
   * Make sure that path matches exactly what you have in API Gateway:
   *   Stage name:     "default"
   *   Route path:     "/salesforceUploadFunction"
   */
  const API_URL = 'https://6vs9aydei8.execute-api.us-east-2.amazonaws.com/default/salesforceUploadFunction';

  // 1) Check whether the user has permission based on their email.
  //    If their email is not in ALLOWED_SALESFORCE_USERS, show an access denied screen.
  if (user) {
    const userEmail = user.email || '';
    const hasSalesforceAccess = ALLOWED_SALESFORCE_USERS.some(
      (allowedEmail) => allowedEmail.toLowerCase() === userEmail.toLowerCase()
    );

    if (!hasSalesforceAccess) {
      return (
        <div className="min-h-screen bg-[#f5f5f5] py-10 flex justify-center items-center">
          <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-8 text-center">
            <h1 className="text-4xl font-bold text-[#0a0002] mb-4">Access Denied</h1>
            <p className="text-gray-700 mb-6">
              You do not have permission to upload data to Salesforce.
              Please contact an administrator if you believe this is an error.
            </p>
          </div>
        </div>
      );
    }
  }

  // 2) If disclaimers not accepted, show disclaimers/instructions:
  if (!disclaimerAccepted) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] py-10">
        <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
          <h1 className="text-4xl font-bold text-center text-[#0a0002] mb-6">
            Salesforce Data Upload
          </h1>
          <h2 className="text-2xl font-semibold mb-4">Please Read Before Proceeding</h2>

          {/* Explanatory / Instructions Section */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            This tool allows you to upload new student applications to our Salesforce database.
            Maintaining accurate data is paramount, so please ensure you read the instructions
            and check your spreadsheet for correctness before proceeding.
          </p>
          <p className="text-gray-700 mb-6 leading-relaxed">
            <strong>Important Reminders &amp; Requirements:</strong>
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>
              <strong>Formatting:</strong> All cells must be stored as <em>text</em>.
              (e.g., ZIP codes must not appear as <code>49507.0</code>).
            </li>
            <li>
              <strong>Names &amp; Schools:</strong> Make sure student names, parent names, teacher
              names, and school names match the official capitalization.
            </li>
            <li>
              <strong>Grades:</strong> Enter numeric values only (e.g., <code>4</code>, <code>5</code>,
              <code>6</code>), no suffixes (<code>th</code>, <code>rd</code>, etc.).
            </li>
            <li>
              <strong>Phone Numbers:</strong> Provide only numbers (e.g., <code>6165551234</code>).
              Please do not include <code>/</code>, <code>-</code>, or spaces.
            </li>
            <li>
              <strong>Date of Birth (DOB):</strong> Use <em>MM/DD/YYYY</em> format (e.g.,
              <code>01/15/2010</code>).
            </li>
            <li>
              <strong>State:</strong> Use the 2-letter state code (e.g., <code>MI</code> for Michigan).
            </li>
            <li>
              <strong>Check Box Fields:</strong> Use <code>Yes</code> for checked,
              <code>No</code> for unchecked.
            </li>
            <li>
              <strong>Program ID:</strong> Make sure you have the correct <em>Program ID</em> in each
              row. If not sure, consult our Salesforce Program listing or documentation.
            </li>
          </ul>

          {/* Download Template */}
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              If you do not have the official Excel template, you can download it below:
            </p>
            <a
              href={`${process.env.PUBLIC_URL}/Salesforce_Applications_Template.xlsx`}
              download
              className="inline-block px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
            >
              Download Template
            </a>
          </div>

          {/* Checkbox + Continue Button */}
          <div className="mb-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-[#83b786] border-gray-300 rounded"
                checked={disclaimerChecked}
                onChange={() => setDisclaimerChecked(!disclaimerChecked)}
              />
              <span className="ml-2 text-gray-700">
                I have read and I understand the instructions.
              </span>
            </label>
          </div>

          <div>
            <button
              onClick={() => setDisclaimerAccepted(true)}
              className="px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!disclaimerChecked}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If disclaimers are accepted, show upload UI.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload.');
      return;
    }

    // Convert the selected file to base64
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        if (!evt.target?.result) {
          toast.error('Could not read the file data.');
          return;
        }

        // The result is a Data URL, we need to strip off the prefix
        const dataUrl = evt.target.result.toString();
        // Data URL looks like: "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,AAA..."
        const fileBase64 = dataUrl.replace(/^data:.*;base64,/, '');

        // POST to your API Gateway endpoint
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileBase64 }),
        });

        const result = await response.json();
        if (response.ok) {
          toast.success('Upload successful: ' + (result.message || 'No message returned.'));
        } else {
          toast.error('Upload failed: ' + (result.error || 'Unknown error'));
        }
      } catch (err: any) {
        toast.error('Error contacting server: ' + err.message);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-4xl font-bold text-center text-[#0a0002] mb-6">
          Salesforce Data Upload
        </h1>
        <p className="text-gray-700 mb-6 leading-relaxed">
          You have acknowledged the requirements. Please upload your Excel file (using our
          official template) below.
        </p>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Styled File Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Select Excel File</label>
            <div className="flex justify-center items-center">
              <label className="flex flex-col items-center px-4 py-6 bg-white text-[#83b786] border border-[#83b786] rounded-lg shadow-md cursor-pointer hover:bg-[#83b786] hover:text-white transition-colors duration-200">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M16.88 9.94l-5-5A1 1 0 0010.5 5h-7a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-7a1 1 0 00-.12-.44zM11 9V5.41L15.59 10H12a1 1 0 01-1-1z" />
                </svg>
                <span className="mt-2 text-base leading-normal">
                  {file ? file.name : 'Upload Excel File'}
                </span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
            >
              Submit to Salesforce
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SalesforcePage;
