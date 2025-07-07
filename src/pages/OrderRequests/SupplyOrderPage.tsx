import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { createMondayTask } from '../../utils/mondayUtils';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

interface SupplyLine {
  id: string;
  suppliesNeeded: string;
  quantity: string;
  neededBy: string;
  supplyLink: string;
}

function SupplyOrderPage(): JSX.Element {
  // Initial global form fields
  const initialFormData = {
    name: '',
    email: '',
    school: 'Aquinas',
    additionalInfo: '',
  };

  // Initial single supply line
  const createEmptyLine = (): SupplyLine => ({
    id: uuidv4(),
    suppliesNeeded: '',
    quantity: '',
    neededBy: '',
    supplyLink: '',
  });

  const [formData, setFormData] = useState(initialFormData);
  const [supplyLines, setSupplyLines] = useState<SupplyLine[]>([createEmptyLine()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MONDAY_SUPPLY_BOARD_ID =
    process.env.REACT_APP_MONDAY_SUPPLY_BOARD_ID || '7848780989';
  const MONDAY_SUPPLY_GROUP_ID =
    process.env.REACT_APP_MONDAY_SUPPLY_GROUP_ID || 'topics';
  const FORM_TYPE = 'Supply';

  // Handlers for global fields
  const handleGlobalChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handlers for individual supply lines
  const handleLineChange = (
    id: string,
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setSupplyLines(lines =>
      lines.map(line =>
        line.id === id ? { ...line, [name]: value } : line
      )
    );
  };

  const addSupplyLine = () => {
    setSupplyLines(lines => [...lines, createEmptyLine()]);
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setSupplyLines([createEmptyLine()]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const requestId = uuidv4();

    try {
      // Loop through each supply line and create separate entries
      for (const line of supplyLines) {
        const quantityNumber = parseInt(line.quantity, 10);

        // 1) Save to Firestore
        await addDoc(collection(db, 'supplyOrders'), {
          requestId,
          ...formData,
          suppliesNeeded: line.suppliesNeeded,
          quantity: quantityNumber,
          neededBy: Timestamp.fromDate(new Date(line.neededBy)),
          supplyLink: line.supplyLink,
          createdAt: Timestamp.now(),
        });

        // 2) Send to Monday.com
        const mondayFormData = {
          ...formData,
          suppliesNeeded: line.suppliesNeeded,
          quantity: quantityNumber,
          neededBy: line.neededBy,
          supplyLink: line.supplyLink,
        };

        await createMondayTask({
          formData: mondayFormData,
          boardId: MONDAY_SUPPLY_BOARD_ID,
          groupId: MONDAY_SUPPLY_GROUP_ID,
          formType: FORM_TYPE,
        });
      }

      toast.success('Supply Order Requests Successfully Submitted!');
      handleClear();
    } catch (error: any) {
      console.error('Error submitting order requests:', error);
      toast.error('Error submitting requests, please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md relative mt-8">
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
            onChange={handleGlobalChange}
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
            onChange={handleGlobalChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder="Enter your email"
            required
          />
        </div>

        {/* School */}
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

        {/* Additional Instructions */}
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

        {/* Dynamic Supply Lines */}
        <div>
          <h3 className="text-xl font-semibold text-[#83b786] mb-4">Supplies</h3>

          {supplyLines.map((line, idx) => (
            <div
              key={line.id}
              className="p-4 border border-gray-200 rounded-lg mb-6"
            >
              {/* Supplies Needed */}
              <div>
                <label className="block text-gray-700 font-medium">
                  What supplies do you need ordered?
                </label>
                <textarea
                  name="suppliesNeeded"
                  value={line.suppliesNeeded}
                  onChange={e => handleLineChange(line.id, e)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
                  placeholder="Enter supplies needed"
                  required
                />
              </div>

              {/* Quantity & Needed By */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-gray-700 font-medium">
                    How much of this supply do you need ordered?
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
                    When do you need these supplies by?
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

              {/* Supply Link */}
              <div className="mt-4">
                <label className="block text-gray-700 font-medium">
                  Supply Link (if applicable)
                </label>
                <input
                  type="url"
                  name="supplyLink"
                  value={line.supplyLink}
                  onChange={e => handleLineChange(line.id, e)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#83b786]"
                  placeholder="Insert link for the supply"
                />
              </div>
            </div>
          ))}

          <div className="text-center">
            <button
              type="button"
              onClick={addSupplyLine}
              className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              + Add Another Supply
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
            className={`px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200 ${
              isSubmitting ? 'cursor-not-allowed' : ''
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting…' : 'Submit Order Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SupplyOrderPage;