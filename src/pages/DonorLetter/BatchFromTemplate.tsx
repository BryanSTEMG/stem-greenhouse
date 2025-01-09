// src/pages/DonorLetter/BatchFromTemplate.tsx

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generate } from '@pdfme/generator';
import { format } from 'date-fns';
import { template } from './source'; // PDF template with your fields
import { toast } from 'react-toastify';

function BatchFromTemplate(): JSX.Element {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // This will store the read data from the single sheet
  const [data, setData] = useState<Record<string, any>[]>([]);

  // Helper to parse various possible date strings or numbers
  const parseDateString = (val: any): string => {
    if (!val) return '';

    // If numeric, it may be an Excel date serial
    if (typeof val === 'number') {
      // Use XLSX.SSF to parse if available
      const dateObj = XLSX.SSF.parse_date_code ? XLSX.SSF.parse_date_code(val) : null;
      if (dateObj) {
        // dateObj = { y: 2025, m: 1, d: 9, ... } for example
        const jsDate = new Date(dateObj.y, dateObj.m - 1, dateObj.d);
        return format(jsDate, 'MMMM d, yyyy');
      }
      // Fallback if parse_date_code not available
      // (Approx formula: add days to Excel epoch of 1899-12-30)
      // This fallback is rarely needed; parse_date_code should exist.
      const fallbackDate = new Date(Math.round((val - 25569) * 86400 * 1000));
      return isNaN(fallbackDate.getTime()) ? '' : format(fallbackDate, 'MMMM d, yyyy');
    }

    // If it’s a string, try to parse as normal
    const parsed = new Date(val);
    if (isNaN(parsed.getTime())) {
      return '';
    }
    return format(parsed, 'MMMM d, yyyy'); // e.g. June 27, 2021
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error('Please select an Excel file.');
      return;
    }

    setUploadedFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      // Must have exactly one sheet
      if (workbook.SheetNames.length !== 1) {
        toast.error('Template file must have exactly one sheet. Please try again.');
        setUploadedFile(null);
        return;
      }

      const sheetName = workbook.SheetNames[0];
      const ws = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
      if (jsonData.length === 0) {
        toast.error('Selected sheet is empty.');
        return;
      }

      setData(jsonData);
    } catch (error) {
      toast.error('Error reading Excel file.');
      console.error(error);
    }
  };

  const handleGeneratePdf = async () => {
    if (!uploadedFile) {
      toast.error('Please upload an Excel file first.');
      return;
    }
    if (data.length === 0) {
      toast.error('No data found in the sheet.');
      return;
    }

    setIsProcessing(true);
    try {
      // Create PDF inputs based on your known template fields
      const inputs = data.map((row) => {
        const rawDate = row['Date'] || '';
        const rawDonationDate = row['Donation Date'] || '';
        const rawAmount = row['Amount'] || '';

        // Use our parseDateString helper
        const formattedDate = parseDateString(rawDate);
        const formattedDonationDate = parseDateString(rawDonationDate);
        const formattedAmount = formatAmount(String(rawAmount));

        return {
          Date: formattedDate,
          Name: row['Name'] || '',
          Address: row['Address'] || '',
          City: `${row['City'] || ''}, ${row['State'] || ''} ${row['Zip'] || ''}`,
          Greeting: (row['Greeting'] || '') + ',',
          Amount: `${formattedAmount} to support our efforts to`,
          'Amount 2': formattedAmount,
          'Date of donation': formattedDonationDate,
        };
      });

      // Generate PDFs (combined + individual)
      // @ts-ignore
      const combinedPdfUint8Array = await generate({ template, inputs });
      const combinedPdfBlob = new Blob([combinedPdfUint8Array], { type: 'application/pdf' });

      const pdfBlobs: Array<{ blob: Blob; index: number }> = [];
      for (let i = 0; i < inputs.length; i++) {
        const singleInput = [inputs[i]];
        // @ts-ignore
        const pdfUint8Array = await generate({ template, inputs: singleInput });
        const pdfBlob = new Blob([pdfUint8Array], { type: 'application/pdf' });
        pdfBlobs.push({ blob: pdfBlob, index: i });
      }

      // Zip them up
      const zip = new JSZip();
      const pdfFolder = zip.folder('PDFs');
      pdfFolder?.file('DonorLetters_Combined.pdf', combinedPdfBlob);
      pdfBlobs.forEach(({ blob, index }) => {
        pdfFolder?.file(`DonorLetter_${index + 1}.pdf`, blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'DonorLetters.zip');

      toast.success('PDFs generated successfully.');
      setUploadedFile(null);
      setData([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple amount formatter
  const formatAmount = (val: string): string => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    let integerPart = parts[0] || '';
    let decimalPart = parts[1] || '';

    decimalPart = decimalPart.substring(0, 2);
    integerPart = integerPart.replace(/^0+(?!$)/, '');
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return decimalPart.length > 0 ? `${integerPart}.${decimalPart}` : integerPart;
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-[#0a0002] mb-6">Batch Donor Letter (Template)</h2>
      <p className="text-center mb-6 text-gray-700">
        Upload the Excel file that has exactly one sheet. We’ll generate donor letters using the fixed template.
      </p>

      <div className="mb-6 flex justify-center items-center">
        <label className="flex flex-col items-center px-4 py-6 bg-white text-[#83b786] rounded-lg shadow-md tracking-wide uppercase border border-[#83b786] cursor-pointer hover:bg-[#83b786] hover:text-white transition-colors duration-200">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.88 9.94l-5-5A1 1 0 0010.5 5h-7a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-7a1 1 0 00-.12-.44zM11 9V5.41L15.59 10H12a1 1 0 01-1-1z" />
          </svg>
          <span className="mt-2 text-base leading-normal">
            {uploadedFile ? uploadedFile.name : 'Upload Excel File'}
          </span>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isProcessing || uploadedFile !== null}
          />
        </label>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={handleGeneratePdf}
          disabled={isProcessing}
          className="px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
        >
          {isProcessing ? 'Processing...' : 'Generate PDFs'}
        </button>
      </div>
    </div>
  );
}

export default BatchFromTemplate;
