import React, { useState } from 'react';

export interface FormData {
  letterDate: string;        // [DATE]
  donorFullName: string;     // [DONOR FULL NAME]
  donorEmail: string;        // [DONOR EMAIL]
  donorAddress: string;      // [DONOR ADDRESS]
  donorFirstName: string;    // [DONOR FIRST NAME]
  donationAmount: string;    // [DONATION AMOUNT]
  donationHonor: string;     // [DONATION HONOR]
  receiptDate: string;       // [INSERT DATE]
  receiptAmount: string;     // [INSERT AMOUNT]
}

export interface BirthdayFundraiserFormProps {
  onGenerate: (data: FormData) => void;
}

const BirthdayFundraiserForm: React.FC<BirthdayFundraiserFormProps> = ({ onGenerate }) => {
  const [letterDate, setLetterDate] = useState('');
  const [donorFullName, setDonorFullName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [donorFirstName, setDonorFirstName] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [donationHonor, setDonationHonor] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [receiptAmount, setReceiptAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: FormData = {
      letterDate,
      donorFullName,
      donorEmail,
      donorAddress,
      donorFirstName,
      donationAmount,
      donationHonor,
      receiptDate,
      receiptAmount,
    };
    console.log("BirthdayFundraiserForm submitted:", data);
    onGenerate(data);
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-lg max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        Birthday Fundraiser Letter Form
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Letter Date (e.g. 3.28.2025):</label>
          <input
            type="text"
            value={letterDate}
            onChange={(e) => setLetterDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-[#83b786]"
            placeholder="e.g. 3.28.2025"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Donor Full Name:</label>
          <input
            type="text"
            value={donorFullName}
            onChange={(e) => setDonorFullName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-[#83b786]"
            placeholder="Enter full name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Donor Email:</label>
          <input
            type="email"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-[#83b786]"
            placeholder="Enter email"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Donor Address:</label>
          <input
            type="text"
            value={donorAddress}
            onChange={(e) => setDonorAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-[#83b786]"
            placeholder="Enter address"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Donor First Name:</label>
          <input
            type="text"
            value={donorFirstName}
            onChange={(e) => setDonorFirstName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-[#83b786]"
            placeholder="Enter first name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Donation Amount:</label>
          <input
            type="text"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-[#83b786]"
            placeholder="Enter donation amount"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Donation Honor (e.g. "Grace Clark"):</label>
          <input
            type="text"
            value={donationHonor}
            onChange={(e) => setDonationHonor(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-[#83b786]"
            placeholder="Enter donation honor"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Receipt Date (for bottom of letter):</label>
          <input
            type="date"
            value={receiptDate}
            onChange={(e) => setReceiptDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-[#83b786]"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700">Receipt Amount (for bottom of letter):</label>
          <input
            type="text"
            value={receiptAmount}
            onChange={(e) => setReceiptAmount(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-[#83b786]"
            placeholder="Enter receipt amount"
          />
        </div>
        <button
          type="submit"
          className="w-full px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
        >
          Generate Letter
        </button>
      </form>
    </div>
  );
};

export default BirthdayFundraiserForm;
