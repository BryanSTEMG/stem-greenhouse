// src/pages/DonorLetter/BatchDonorLetter.tsx

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generate } from '@pdfme/generator';
import { format } from 'date-fns';
import { template } from './source';

function BatchDonorLetter(): JSX.Element {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      alert('Please select an Excel file.');
      return;
    }

    setUploadedFile(file);
  };

  const handleProcessFile = async () => {
    if (!uploadedFile) {
      alert('No file uploaded.');
      return;
    }

    setIsProcessing(true);

    try {
      // Read the Excel file
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { raw: false });

      // Prepare inputs for PDF generation
      const inputs = jsonData.map((row: any) => {
        // Format dates
        const formattedDate = format(new Date(row.Date), 'MMMM d, yyyy');
        const formattedDonationDate = format(new Date(row['Donation Date']), 'MMMM d, yyyy');

        // Format amount
        const amount = formatAmount(row.Amount);

        return {
          'Date': formattedDate,
          'Name': row.Name,
          'Address': row.Address,
          'City': `${row.City}, ${row.State} ${row.Zip}`,
          'Greeting': row.Greeting + ',',
          'Amount': `${amount} to support our efforts to`,
          'Amount 2': amount,
          'Date of donation': formattedDonationDate,
        };
      });

      // Generate combined PDF
      // @ts-ignore
      const combinedPdfUint8Array = await generate({ template, inputs });
      const combinedPdfBlob = new Blob([combinedPdfUint8Array], { type: 'application/pdf' });

      // Generate PDFs individually
      const pdfBlobs = [];
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        // Generate PDF for each input
        // @ts-ignore
        const pdfUint8Array = await generate({ template, inputs: [input] });
        const pdfBlob = new Blob([pdfUint8Array], { type: 'application/pdf' });
        pdfBlobs.push({ blob: pdfBlob, index: i });
      }

      // Zip the PDFs
      const zip = new JSZip();
      // Add combined PDF
      zip.file('DonorLetters_Combined.pdf', combinedPdfBlob);
      // Add individual PDFs
      pdfBlobs.forEach(({ blob, index }) => {
        zip.file(`DonorLetter_${index + 1}.pdf`, blob);
      });

      // Generate zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'DonorLetters.zip');

      setIsProcessing(false);
      alert('PDFs generated and downloaded successfully.');
      // Clear the uploaded file
      setUploadedFile(null);
    } catch (error) {
      console.error('Error processing file:', error);
      setIsProcessing(false);
      alert('An error occurred while processing the file.');
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
  };

  // Function to format amount
  const formatAmount = (value: string): string => {
    // Remove all non-digit characters except for dot
    const cleanedValue = value.replace(/[^0-9.]/g, '');

    // Split on dot to get decimal parts
    const parts = cleanedValue.split('.');
    let integerPart = parts[0];
    let decimalPart = parts[1] || '';

    // Limit decimal part to two digits
    decimalPart = decimalPart.substring(0, 2);

    // Remove leading zeros
    integerPart = integerPart.replace(/^0+(?!$)/, '');

    // Add commas to integer part
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let formattedValue = integerPart;
    if (decimalPart.length > 0) {
      formattedValue += '.' + decimalPart;
    }

    return formattedValue;
  };

  return (
    <div>
      <h2 className="text-2xl font-bold">Batch Donor Letter Generator</h2>
      <div className="mt-4">
        <p>
          You can download the template{' '}
          <a href="/batch_donor_TEMPLATE.xlsx" download className="text-blue-500 underline">
            here
          </a>
          .
        </p>
        <div className="mt-4">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            disabled={isProcessing || uploadedFile !== null}
          />
        </div>
        {uploadedFile && (
          <div className="mt-4">
            <p>File uploaded: {uploadedFile.name}</p>
            <button
              onClick={handleProcessFile}
              disabled={isProcessing}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-2"
            >
              {isProcessing ? 'Processing...' : 'Process File'}
            </button>
            <button
              onClick={handleClearFile}
              disabled={isProcessing}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Clear File
            </button>
          </div>
        )}
        {isProcessing && <p className="mt-2 text-blue-500">Processing...</p>}
      </div>
    </div>
  );
}

export default BatchDonorLetter;
