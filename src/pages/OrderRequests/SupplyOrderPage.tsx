// src/pages/SupplyOrderPage.tsx

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { createMondayTask } from '../../utils/mondayUtils';
import { db } from '../../firebase';

function SupplyOrderPage(): JSX.Element {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    suppliesNeeded: '',
    quantity: '',
    neededBy: '',
    supplyLink: '',
    additionalInfo: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use environment variables instead of hardcoding
  const MONDAY_SUPPLY_BOARD_ID = process.env.REACT_APP_MONDAY_SUPPLY_BOARD_ID || '7848780989';
  const MONDAY_SUPPLY_GROUP_ID = process.env.REACT_APP_MONDAY_SUPPLY_GROUP_ID || 'topics';
  const FORM_TYPE = 'Supply';

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Autofill function for testing
  const handleAutofill = () => {
    setFormData({
      name: 'Bryan',
      email: 'bryan@stemgreenhouse.org',
      suppliesNeeded: 'Box',
      quantity: '10',
      neededBy: '2024-12-04',
      supplyLink:
        'https://www.amazon.com/Kraft-12-1-Corrugated-Handle-Carry/dp/B01MRPPL34/ref=sr_1_1_sspa',
      additionalInfo: '',
    });
    setFile(null);
  };

  // Clear form function
  const handleClear = () => {
    setFormData({
      name: '',
      email: '',
      suppliesNeeded: '',
      quantity: '',
      neededBy: '',
      supplyLink: '',
      additionalInfo: '',
    });
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Generate a unique ID for the request
    const requestId = uuidv4();

    try {
      // Convert quantity to a number
      const quantityNumber = parseInt(formData.quantity, 10);

      // Save request data to Firestore
      await addDoc(collection(db, 'supplyOrders'), {
        requestId,
        ...formData,
        quantity: quantityNumber,
        neededBy: Timestamp.fromDate(new Date(formData.neededBy)),
        createdAt: Timestamp.now(),
      });

      // Prepare formData for the Monday task
      const mondayFormData = {
        ...formData,
        quantity: quantityNumber,
        additionalInfo: formData.additionalInfo || '',
      };

      // Create a task in Monday.com via AWS Lambda/API Gateway
      await createMondayTask({
        formData: mondayFormData,
        boardId: MONDAY_SUPPLY_BOARD_ID,
        groupId: MONDAY_SUPPLY_GROUP_ID,
        formType: FORM_TYPE,
        file: file || undefined,
      });

      alert('Order request submitted successfully!');
      handleClear();
    } catch (error: any) {
      console.error('Error submitting order request:', error);
      alert('An error occurred while submitting your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-[#0a0002] mb-6">
        Supply Order Form
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Name */}
        <div>
          <label className="block text-gray-700 font-medium">Your Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter your name"
            required
          />
        </div>
        {/* Email */}
        <div>
          <label className="block text-gray-700 font-medium">Your Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter your email"
            required
          />
        </div>
        {/* Supplies Needed */}
        <div>
          <label className="block text-gray-700 font-medium">
            What supplies do you need ordered?
          </label>
          <textarea
            name="suppliesNeeded"
            value={formData.suppliesNeeded}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter supplies needed"
            required
          />
        </div>
        {/* Quantity */}
        <div>
          <label className="block text-gray-700 font-medium">
            How much of this supply do you need ordered?
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter quantity needed"
            required
          />
        </div>
        {/* Needed By */}
        <div>
          <label className="block text-gray-700 font-medium">
            When do you need these supplies by?
          </label>
          <input
            type="date"
            name="neededBy"
            value={formData.neededBy}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            required
          />
        </div>
        {/* Supply Link */}
        <div>
          <label className="block text-gray-700 font-medium">
            Supply Link (if applicable)
          </label>
          <input
            type="url"
            name="supplyLink"
            value={formData.supplyLink}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Insert link for the supply"
          />
        </div>
        {/* Additional Information */}
        <div>
          <label className="block text-gray-700 font-medium">
            Additional Instructions/Information
          </label>
          <textarea
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Write any additional instructions or information"
          />
        </div>
        {/* File Upload */}
        <div>
          <label className="block text-gray-700 font-medium">
            Upload File (if applicable)
          </label>
          <input
            type="file"
            name="file"
            onChange={handleFileChange}
            className="mt-1 block w-full text-gray-700"
          />
        </div>
        {/* Autofill and Clear Buttons */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleAutofill}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors duration-200 mr-2"
          >
            Autofill Test Data
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors duration-200"
          >
            Clear Form
          </button>
        </div>
        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className={`px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200 ${
              isSubmitting ? 'cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Order Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SupplyOrderPage;
