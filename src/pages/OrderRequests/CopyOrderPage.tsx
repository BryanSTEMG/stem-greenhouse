// src/pages/OrderRequests/CopyOrderPage.tsx
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { createMondayTask } from '../../utils/mondayUtils';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

function CopyOrderForm(): JSX.Element {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    school: 'Aquinas',          // NEW
    blackWhiteOk: 'Yes',        // NEW (string "Yes"/"No" → easier to map to status)
    quantity: '',
    neededBy: '',
    copyLink: '',
    additionalInfo: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MONDAY_COPY_BOARD_ID = '7855775074';
  const MONDAY_COPY_GROUP_ID = 'topics';
  const FORM_TYPE = 'Copy';

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleClear = () => {
    setFormData({
      name: '',
      email: '',
      school: 'Aquinas',
      blackWhiteOk: 'Yes',
      quantity: '',
      neededBy: '',
      copyLink: '',
      additionalInfo: '',
    });
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requestId = uuidv4();

    try {
      await addDoc(collection(db, 'copyOrders'), {
        requestId,
        ...formData,
        blackWhiteOk: formData.blackWhiteOk === 'Yes',
        neededBy: Timestamp.fromDate(new Date(formData.neededBy)),
        createdAt: Timestamp.now(),
      });

      const mondayFormData = {
        name: formData.name,
        email: formData.email,
        school: formData.school,
        blackWhiteOk: formData.blackWhiteOk === 'Yes',
        quantity: parseInt(formData.quantity, 10),
        neededBy: formData.neededBy,
        supplyLink: formData.copyLink,
        additionalInfo: formData.additionalInfo,
      };

      await createMondayTask({
        formData: mondayFormData,
        boardId: MONDAY_COPY_BOARD_ID,
        groupId: MONDAY_COPY_GROUP_ID,
        formType: FORM_TYPE,
        file: file || undefined,
      });

      toast.success('Copy Order Request Successfully Submitted!');
      handleClear();
    } catch (error: any) {
      console.error('Error submitting copy request:', error);
      toast.error('Error submitting request, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md relative mt-8">
      <h2 className="text-3xl font-bold text-center text-[#0a0002] mb-6">
        Copy Order Form
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

        {/* School —— NEW */}
        <div>
          <label className="block text-gray-700 font-medium">
            Which campus are you at?
          </label>
          <select
            name="school"
            value={formData.school}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            required
          >
            <option value="Aquinas">Aquinas</option>
            <option value="GRCC">GRCC</option>
          </select>
        </div>

        {/* Black & White OK —— NEW */}
        <div>
          <label className="block text-gray-700 font-medium">
            Is black &amp; white printing okay?
          </label>
          <select
            name="blackWhiteOk"
            value={formData.blackWhiteOk}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            required
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-gray-700 font-medium">
            How many copies do you need?
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
            When do you need these copies by?
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

        {/* Copy Link */}
        <div>
          <label className="block text-gray-700 font-medium">
            Copy Link (if applicable)
          </label>
          <input
            type="url"
            name="copyLink"
            value={formData.copyLink}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Insert link for the copy"
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

        {/* Buttons */}
        <div className="text-center space-x-4">
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors duration-200"
          >
            Clear Form
          </button>

          <button
            type="submit"
            className={`px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200 ${
              isSubmitting ? 'cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting…' : 'Submit Copy Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CopyOrderForm;
