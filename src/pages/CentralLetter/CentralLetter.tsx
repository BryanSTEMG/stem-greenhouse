// src/pages/CentralLetter/CentralLetter.tsx

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generate } from '@pdfme/generator';
import { template } from './source';

function CentralLetter(): JSX.Element {
  const [uploadedExcelFile, setUploadedExcelFile] = useState<File | null>(null);
  const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to download the Excel template
  const handleDownloadTemplate = () => {
    console.log('Initiating template download...');
    try {
      // Create a worksheet with one column "First Name"
      const ws = XLSX.utils.json_to_sheet([{ "First Name": "" }]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");

      // Write the workbook to binary array
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      // Create a Blob from the binary array
      const blob = new Blob([wbout], { type: 'application/octet-stream' });

      // Trigger the download
      saveAs(blob, 'CentralLetter_Template.xlsx');
      console.log('Template downloaded successfully.');
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('An error occurred while downloading the template.');
    }
  };

  // Handle Excel File Upload
  const handleExcelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      alert('Please select an Excel file.');
      return;
    }

    console.log('Excel file selected:', file.name);
    setUploadedExcelFile(file);

    try {
      // Read the Excel file to get column headers
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Get headers from the first row
      const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
      console.log('Column headers found:', headers);
      setColumnHeaders(headers);
    } catch (error) {
      console.error('Error reading Excel file:', error);
      alert('An error occurred while reading the Excel file.');
    }
  };

  // Function to Capitalize the First Letter
  const capitalizeFirstLetter = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Function to Convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Handle Processing of File
  const handleProcessFile = async () => {
    if (!uploadedExcelFile) {
      alert('No Excel file uploaded.');
      return;
    }

    if (columnHeaders.length === 0) {
      alert('No column headers found in the Excel file.');
      return;
    }

    setIsProcessing(true);
    console.log('Starting PDF generation process...');

    try {
      // Read the Excel file
      console.log('Reading Excel file...');
      const excelData = await uploadedExcelFile.arrayBuffer();
      const workbook = XLSX.read(excelData);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { raw: false });
      console.log('Excel data parsed:', jsonData);

      // Prepare inputs for PDF generation
      const inputs = jsonData.map((row: any) => {
        const originalName = row[columnHeaders[0]]; // Assuming "First Name" is the first column
        const capitalizedName = capitalizeFirstLetter(originalName);
        return {
          'FirstName': capitalizedName + ",",
        };
      });
      console.log('Prepared inputs for PDF generation:', inputs);

      // Initialize JSZip
      const zip = new JSZip();
      console.log('JSZip initialized.');

      // Generate individual PDFs
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        console.log(`Generating PDF for ${input.FirstName} (${i + 1}/${inputs.length})`);
        try {
          //@ts-ignore
          const pdfUint8Array = await generate({ template, inputs: [input] }); // Corrected line
          console.log(`PDF generated for ${input.FirstName}:`, pdfUint8Array);
          const pdfBlob = new Blob([pdfUint8Array], { type: 'application/pdf' });
          zip.file(`CentralLetter_${i + 1}.pdf`, pdfBlob);
          console.log(`Added CentralLetter_${i + 1}.pdf to ZIP.`);
        } catch (pdfError: any) {
          console.error(`Error generating PDF for ${input.FirstName}:`, pdfError);
          alert(`An error occurred while generating PDF for ${input.FirstName}.`);
        }
      }

      // Generate zip file
      console.log('Generating ZIP file...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'CentralLetters.zip');
      console.log('ZIP file generated and downloaded successfully.');

      setIsProcessing(false);
      alert('PDFs generated and downloaded successfully.');

      // Clear the uploaded file and selections
      handleClearFiles();
    } catch (error: any) {
      console.error('Error processing file:', error);
      setIsProcessing(false);

      if (
        error.name === 'PDFInvalidObjectParsingError' ||
        error.name === 'MissingPDFHeaderError'
      ) {
        alert(
          'An error occurred while processing the base PDF file. Please ensure the PDF is valid and try again.'
        );
      } else if (error.message && error.message.includes('replacePlaceholders')) {
        alert(
          'An internal error occurred during PDF generation. Please check your template and try again.'
        );
      } else {
        alert('An error occurred while processing the file.');
      }
    }
  };

  // Handle Clearing of Files and Selections
  const handleClearFiles = () => {
    console.log('Clearing uploaded files and selections...');
    setUploadedExcelFile(null);
    setColumnHeaders([]);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-[#0a0002] mb-6">
        Central Letter Generator
      </h2>
      <div className="text-center">
        <p className="text-gray-700">
          Download the Excel template, enter the first names, and upload the filled Excel file to generate individual PDFs.
        </p>
      </div>
      <div className="mt-6">
        {/* Download Template */}
        <div className="flex justify-center items-center mb-6">
          <button
            onClick={handleDownloadTemplate}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors duration-200"
          >
            Download Excel Template
          </button>
        </div>

        {/* Upload Excel File */}
        <div className="flex justify-center items-center mb-4">
          <label className="flex flex-col items-center px-4 py-6 bg-white text-[#83b786] rounded-lg shadow-md tracking-wide uppercase border border-[#83b786] cursor-pointer hover:bg-[#83b786] hover:text-white transition-colors duration-200">
            <svg
              className="w-8 h-8"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M16.88 9.94l-5-5A1 1 0 0010.5 5h-7a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-7a1 1 0 00-.12-.44zM11 9V5.41L15.59 10H12a1 1 0 01-1-1z" />
            </svg>
            <span className="mt-2 text-base leading-normal">
              {uploadedExcelFile ? uploadedExcelFile.name : 'Upload Excel File'}
            </span>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleExcelFileUpload}
              className="hidden"
              disabled={isProcessing || uploadedExcelFile !== null}
            />
          </label>
        </div>

        {/* Process Button */}
        {uploadedExcelFile && (
          <div className="flex justify-center items-center mt-6">
            <button
              onClick={handleProcessFile}
              disabled={isProcessing}
              className={`px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200 ${
                isProcessing ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              {isProcessing ? 'Processing...' : 'Generate PDFs'}
            </button>
          </div>
        )}

        {/* Clear Button */}
        {uploadedExcelFile && !isProcessing && (
          <div className="flex justify-center items-center mt-4">
            <button
              onClick={handleClearFiles}
              className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors duration-200"
            >
              Clear
            </button>
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && (
          <p className="mt-4 text-center text-[#83b786]">Processing...</p>
        )}
      </div>
    </div>
  );
}

export default CentralLetter;
