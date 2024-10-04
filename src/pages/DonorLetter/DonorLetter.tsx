import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import SingleDonorLetter from './SingleDonorLetter';
import BatchDonorLetter from './BatchDonorLetter';

function DonorLetter(): JSX.Element {
  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">Donor Letter Generator</h1>
      <nav className="mt-2">
        <Link to="single" className="mr-4 text-blue-500">
          Single Generator
        </Link>
        <Link to="batch" className="text-blue-500">
          Batch Generator
        </Link>
      </nav>
      <Routes>
        <Route path="single" element={<SingleDonorLetter />} />
        <Route path="batch" element={<BatchDonorLetter />} />
        <Route path="/" element={<p>Please select an option above.</p>} />
      </Routes>
    </div>
  );
}

export default DonorLetter;
