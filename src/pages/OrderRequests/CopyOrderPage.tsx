// src/pages/OrderRequests/CopyOrderPage.tsx

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { createMondayTask } from '../../utils/mondayUtils';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

interface CopyLine {
  id: string;
  copyLink: string;
  blackWhiteOk: 'Yes' | 'No';
  quantity: string;
  neededBy: string;
  file: File | null;
}

function CopyOrderForm(): JSX.Element {
  // Global form fields
  const initialFormData = {
    name: '',
    email: '',
    school: 'Aquinas',
    additionalInfo: '',
  };

  // Factory for a blank copy‐line
  const createEmptyLine = (): CopyLine => ({
    id: uuidv4(),
    copyLink: '',
    blackWhiteOk: 'Yes',
    quantity: '',
    neededBy: '',
    file: null,
  });

  const [formData, setFormData] = useState(initialFormData);
  const [copyLines, setCopyLines] = useState<CopyLine[]>([createEmptyLine()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MONDAY_COPY_BOARD_ID = '7855775074';
  const MONDAY_COPY_GROUP_ID = 'topics';
  const FORM_TYPE = 'Copy';

  // Handle global input changes
  const handleGlobalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle per‐line input changes
  const handleLineChange = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCopyLines(lines =>
      lines.map(line =>
        line.id === id ? { ...line, [name]: value } : line
      )
    );
  };

  // Handle per‐line file selection
  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCopyLines(lines =>
      lines.map(line =>
        line.id === id ? { ...line, file } : line
      )
    );
  };

  // Add another copy‐line
  const addCopyLine = () => {
    setCopyLines(lines => [...lines, createEmptyLine()]);
  };

  // Reset entire form
  const handleClear = () => {
    setFormData(initialFormData);
    setCopyLines([createEmptyLine()]);
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const requestId = uuidv4();

    try {
      for (const line of copyLines) {
        const qty = parseInt(line.quantity, 10);

        // 1) Save to Firestore
        await addDoc(collection(db, 'copyOrders'), {
          requestId,
          ...formData,
          blackWhiteOk: line.blackWhiteOk === 'Yes',
          quantity: qty,
          neededBy: Timestamp.fromDate(new Date(line.neededBy)),
          copyLink: line.copyLink,
          createdAt: Timestamp.now(),
        });

        // 2) Send to Monday.com
        const mondayFormData = {
          name: formData.name,
          email: formData.email,
          school: formData.school,
          blackWhiteOk: line.blackWhiteOk === 'Yes',
          quantity: qty,
          neededBy: line.neededBy,
          supplyLink: line.copyLink,
          additionalInfo: formData.additionalInfo,
        };

        await createMondayTask({
          formData: mondayFormData,
          boardId: MONDAY_COPY_BOARD_ID,
          groupId: MONDAY_COPY_GROUP_ID,
          formType: FORM_TYPE,
          file: line.file ?? undefined,
        });
      }

      toast.success('Copy Order Requests Successfully Submitted!');
      handleClear();
    } catch (err: any) {
      console.error('Error submitting copy requests:', err);
      toast.error('Error submitting requests, please try again.');
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
        {/* Global Fields */}
        <div>
          <label className="block text-gray-700 font-medium">Your Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleGlobalChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium">Your Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleGlobalChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium">
            Which campus are you at?
          </label>
          <select
            name="school"
            value={formData.school}
            onChange={handleGlobalChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            required
          >
            <option value="Aquinas">Aquinas</option>
            <option value="GRCC">GRCC</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium">
            Additional Instructions/Information
          </label>
          <textarea
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleGlobalChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Write any additional instructions or information"
          />
        </div>

        {/* Dynamic Copy Lines */}
        <div>
          <h3 className="text-xl font-semibold text-[#83b786] mb-4">Copies</h3>
          {copyLines.map((line, idx) => (
            <div
              key={line.id}
              className="p-4 border border-gray-200 rounded-lg mb-6"
            >
              {/* Black & White */}
              <div>
                <label className="block text-gray-700 font-medium">
                  Is black &amp; white printing okay?
                </label>
                <select
                  name="blackWhiteOk"
                  value={line.blackWhiteOk}
                  onChange={e => handleLineChange(line.id, e)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
                  required
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Quantity & Needed By */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-gray-700 font-medium">
                    How many copies do you need?
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={line.quantity}
                    onChange={e => handleLineChange(line.id, e)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
                    placeholder="Enter quantity needed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium">
                    When do you need these copies by?
                  </label>
                  <input
                    type="date"
                    name="neededBy"
                    value={line.neededBy}
                    onChange={e => handleLineChange(line.id, e)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
                    required
                  />
                </div>
              </div>

              {/* Copy Link */}
              <div className="mt-4">
                <label className="block text-gray-700 font-medium">
                  Copy Link (if applicable)
                </label>
                <input
                  type="url"
                  name="copyLink"
                  value={line.copyLink}
                  onChange={e => handleLineChange(line.id, e)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
                  placeholder="Insert link for the copy"
                />
              </div>

              {/* File Upload */}
              <div className="mt-4">
                <label className="block text-gray-700 font-medium">
                  Upload File (if applicable)
                </label>
                <input
                  type="file"
                  name="file"
                  onChange={e => handleFileChange(line.id, e)}
                  className="mt-1 block w-full text-gray-700"
                />
              </div>
            </div>
          ))}

          <div className="text-center">
            <button
              type="button"
              onClick={addCopyLine}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              + Add Another Copy
            </button>
          </div>
        </div>

        {/* Form Actions */}
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
            disabled={isSubmitting}
            className="px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
          >
            {isSubmitting ? 'Submitting…' : 'Submit Copy Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CopyOrderForm;
