// src/pages/DonorLetter/BatchFromXlsx.tsx

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generate } from '@pdfme/generator';
import { format } from 'date-fns';
import { template } from './source';
import Select from 'react-select';
import { toast } from 'react-toastify';

function BatchFromXlsx(): JSX.Element {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // For multi-sheet files
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

  // Data for mapping
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);

  // The letter date is user-chosen:
  const [letterDate, setLetterDate] = useState<string>(''); // The date the letter is made

  const [addressColumn, setAddressColumn] = useState<string | null>(null);
  const [cityColumn, setCityColumn] = useState<string | null>(null);
  const [stateColumn, setStateColumn] = useState<string | null>(null);
  const [zipColumn, setZipColumn] = useState<string | null>(null);
  const [amountColumn, setAmountColumn] = useState<string | null>(null);
  const [donationDateColumn, setDonationDateColumn] = useState<string | null>(null);

  // For constructing name/greeting
  const [nameTemplate, setNameTemplate] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');

  // For placeholders
  const [availablePlaceholders, setAvailablePlaceholders] = useState<{ label: string; value: string }[]>([]);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<{ label: string; value: string } | null>(null);
  const [selectedPlaceholderForName, setSelectedPlaceholderForName] = useState<{ label: string; value: string } | null>(null);

  // ---------- Helper to parse dates (numeric or string) ----------
  const parseDateString = (val: any): string => {
    if (!val) return '';

    if (typeof val === 'number') {
      // Attempt parse as Excel date
      const dateObj = XLSX.SSF.parse_date_code ? XLSX.SSF.parse_date_code(val) : null;
      if (dateObj) {
        const jsDate = new Date(dateObj.y, dateObj.m - 1, dateObj.d);
        return format(jsDate, 'MMMM d, yyyy');
      }
      // Fallback if parse_date_code not found
      const fallback = new Date(Math.round((val - 25569) * 86400 * 1000));
      return isNaN(fallback.getTime()) ? '' : format(fallback, 'MMMM d, yyyy');
    }

    // If it's a string, parse normally
    const parsed = new Date(val);
    if (isNaN(parsed.getTime())) return '';
    return format(parsed, 'MMMM d, yyyy');
  };

  // ----------- FILE UPLOAD -----------
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
      if (workbook.SheetNames.length === 0) {
        toast.error('No sheets found in the Excel file.');
        return;
      }
      setSheetNames(workbook.SheetNames);
    } catch (error) {
      toast.error('Error reading Excel file.');
      console.error(error);
    }
  };

  const handleSheetSelect = (option: any) => {
    if (option) {
      setSelectedSheet(option.value);
      loadSheetData(option.value);
    } else {
      setSelectedSheet(null);
      setHeaders([]);
      setData([]);
      setAvailablePlaceholders([]);
      resetFormFields();
    }
  };

  const loadSheetData = (sheetName: string) => {
    if (!uploadedFile) {
      toast.error('No file uploaded.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });

      if (jsonData.length > 0) {
        const hdrs = Object.keys(jsonData[0]);
        setHeaders(hdrs);
        setAvailablePlaceholders(hdrs.map((header) => ({ label: header, value: `[${header}]` })));
        setData(jsonData);
      } else {
        setHeaders([]);
        setData([]);
        setAvailablePlaceholders([]);
        toast.error('Selected sheet is empty.');
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const resetFormFields = () => {
    setLetterDate('');
    setAddressColumn(null);
    setCityColumn(null);
    setStateColumn(null);
    setZipColumn(null);
    setAmountColumn(null);
    setDonationDateColumn(null);
    setNameTemplate('');
    setGreeting('');
  };

  // ----------- PLACEHOLDERS -----------
  const handlePlaceholderSelectForGreeting = (option: any) => {
    if (option) {
      setGreeting((prev) => prev + option.value);
      setSelectedPlaceholder(null);
    }
  };

  const handlePlaceholderSelectForName = (option: any) => {
    if (option) {
      setNameTemplate((prev) => prev + option.value);
      setSelectedPlaceholderForName(null);
    }
  };

  // ----------- CLEAR -----------
  const handleClearFile = () => {
    setUploadedFile(null);
    setSheetNames([]);
    setSelectedSheet(null);
    setHeaders([]);
    setData([]);
    setAvailablePlaceholders([]);
    setGreeting('');
    setNameTemplate('');
    resetFormFields();
  };

  // ----------- PROCESS / GENERATE -----------
  const handleProcessFile = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a file.');
      return;
    }
    if (!selectedSheet) {
      toast.error('Please select a sheet.');
      return;
    }
    if (data.length === 0) {
      toast.error('No data found in the selected sheet.');
      return;
    }

    if (!letterDate) {
      toast.error('Please select a letter date.');
      return;
    }

    if (!addressColumn || !cityColumn || !stateColumn || !zipColumn || !amountColumn || !donationDateColumn) {
      toast.error('Select columns for Address, City, State, Zip, Amount, and Date of Donation.');
      return;
    }
    if (!nameTemplate) {
      toast.error('Please provide a template for the Name field.');
      return;
    }
    if (!greeting) {
      toast.error('Please provide a greeting.');
      return;
    }

    setIsProcessing(true);

    try {
      // The letter date is user-selected, not mapped from Excel
      const letterDateFormatted =
        letterDate.trim() !== '' ? format(new Date(letterDate), 'MMMM d, yyyy') : '';

      // Prepare inputs
      const inputs = data.map((row) => {
        const rawDonationDate = row[donationDateColumn] || '';
        const rawAmount = row[amountColumn] || '';

        // Use parseDateString to handle numeric or string
        const formattedDonationDate = parseDateString(rawDonationDate);
        const formattedAmount = formatAmount(String(rawAmount));

        // Build greeting
        let finalGreeting = greeting;
        headers.forEach((header) => {
          const placeholder = `[${header}]`;
          const value = row[header] || '';
          finalGreeting = finalGreeting.replaceAll(placeholder, value);
        });

        // Build name
        let finalName = nameTemplate;
        headers.forEach((header) => {
          const placeholder = `[${header}]`;
          const value = row[header] || '';
          finalName = finalName.replaceAll(placeholder, value);
        });

        return {
          // Insert the user-chosen letter date
          Date: letterDateFormatted,
          Name: finalName,
          Address: row[addressColumn] || '',
          City: `${row[cityColumn] || ''}, ${row[stateColumn] || ''} ${row[zipColumn] || ''}`,
          Greeting: finalGreeting,
          Amount: `${formattedAmount} to support our efforts to`,
          'Amount 2': formattedAmount,
          'Date of donation': formattedDonationDate,
        };
      });

      // Generate PDFs
      // @ts-ignore
      const combinedPdfUint8Array = await generate({ template, inputs });
      const combinedPdfBlob = new Blob([combinedPdfUint8Array], { type: 'application/pdf' });

      // Generate individual PDFs
      const pdfBlobs = [];
      for (let i = 0; i < inputs.length; i++) {
        const singleInput = [inputs[i]];
        // @ts-ignore
        const pdfUint8Array = await generate({ template, inputs: singleInput });
        const pdfBlob = new Blob([pdfUint8Array], { type: 'application/pdf' });
        pdfBlobs.push({ blob: pdfBlob, index: i });
      }

      // Zip them
      const zip = new JSZip();
      const pdfFolder = zip.folder('PDFs');
      pdfFolder?.file('DonorLetters_Combined.pdf', combinedPdfBlob);
      pdfBlobs.forEach(({ blob, index }) => {
        pdfFolder?.file(`DonorLetter_${index + 1}.pdf`, blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'DonorLetters.zip');

      toast.success('Files generated and downloaded successfully.');
      handleClearFile();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error generating PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (val: string): string => {
    const cleanedValue = val.replace(/[^0-9.]/g, '');
    const parts = cleanedValue.split('.');
    let integerPart = parts[0] || '';
    let decimalPart = parts[1] || '';

    decimalPart = decimalPart.substring(0, 2);
    integerPart = integerPart.replace(/^0+(?!$)/, '');
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    let formattedValue = integerPart;
    if (decimalPart.length > 0) {
      formattedValue += '.' + decimalPart;
    }
    return formattedValue;
  };

  const headerOptions = headers.map((h) => ({ label: h, value: h }));

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-[#0a0002] mb-6">
        Batch Donor Letter (XLSX with Mapping)
      </h2>
      <div className="text-center mb-6">
        <p className="text-gray-700">
          Upload an Excel file, select a sheet, then map columns to fields. We’ll generate donor letters for each row.
        </p>
      </div>

      {/* Upload Excel */}
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

      {/* Choose sheet */}
      {sheetNames.length > 0 && (
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Choose a sheet:
          </label>
          <Select
            options={sheetNames.map((name) => ({ label: name, value: name }))}
            onChange={handleSheetSelect}
            isClearable
            placeholder="Select a sheet..."
          />
        </div>
      )}

      {selectedSheet && headers.length > 0 && (
        <>
          <h3 className="text-2xl font-semibold mb-4 text-[#0a0002]">Map Fields</h3>

          {/* Letter Date (non-mapped) */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Letter Date</label>
            <input
              type="date"
              value={letterDate}
              onChange={(e) => setLetterDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            />
            <p className="text-gray-500 text-sm mt-2">
              This is the date that appears on the letter (formatted as June 27, 2021).
            </p>
          </div>

          <hr className="my-4" />

          <h3 className="text-xl font-semibold mb-2 text-[#0a0002]">Name Field Template</h3>
          <label className="block text-gray-700 font-medium mb-2">Insert Placeholder:</label>
          <Select
            options={availablePlaceholders}
            value={selectedPlaceholderForName}
            onChange={handlePlaceholderSelectForName}
            isClearable
            placeholder="Select a placeholder for Name..."
          />
          <label className="block text-gray-700 font-medium mt-4 mb-2">Name Template:</label>
          <input
            type="text"
            value={nameTemplate}
            onChange={(e) => setNameTemplate(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder='e.g. "[First Name] [Last Name]"'
          />
          <p className="text-gray-500 text-sm mt-2">
            Use placeholders to construct the name from multiple columns if needed.
          </p>

          <hr className="my-4" />

          <div className="mb-4 mt-6">
            <label className="block text-gray-700 font-medium mb-1">Address</label>
            <Select
              options={headerOptions}
              value={addressColumn ? { label: addressColumn, value: addressColumn } : null}
              onChange={(option: any) => setAddressColumn(option ? option.value : null)}
              isClearable
              placeholder="Select column for Address"
            />
          </div>

          <div className="flex space-x-4 mb-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1">City</label>
              <Select
                options={headerOptions}
                value={cityColumn ? { label: cityColumn, value: cityColumn } : null}
                onChange={(option: any) => setCityColumn(option ? option.value : null)}
                isClearable
                placeholder="Select column for City"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1">State</label>
              <Select
                options={headerOptions}
                value={stateColumn ? { label: stateColumn, value: stateColumn } : null}
                onChange={(option: any) => setStateColumn(option ? option.value : null)}
                isClearable
                placeholder="Select column for State"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1">Zip Code</label>
              <Select
                options={headerOptions}
                value={zipColumn ? { label: zipColumn, value: zipColumn } : null}
                onChange={(option: any) => setZipColumn(option ? option.value : null)}
                isClearable
                placeholder="Select column for Zip"
              />
            </div>
          </div>

          <hr className="my-4" />

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Gift Amount</label>
            <Select
              options={headerOptions}
              value={amountColumn ? { label: amountColumn, value: amountColumn } : null}
              onChange={(option: any) => setAmountColumn(option ? option.value : null)}
              isClearable
              placeholder="Select column for Gift Amount"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Date of Donation</label>
            <Select
              options={headerOptions}
              value={donationDateColumn ? { label: donationDateColumn, value: donationDateColumn } : null}
              onChange={(option: any) => setDonationDateColumn(option ? option.value : null)}
              isClearable
              placeholder="Select column for Donation Date"
            />
          </div>

          <hr className="my-4" />

          <h3 className="text-2xl font-semibold mb-4 text-[#0a0002]">Greeting</h3>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Insert Placeholder:</label>
            <Select
              options={availablePlaceholders}
              value={selectedPlaceholder}
              onChange={handlePlaceholderSelectForGreeting}
              isClearable
              placeholder="Select a placeholder for Greeting..."
            />
            <label className="block text-gray-700 font-medium mt-4 mb-2">Greeting Text:</label>
            <input
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#83b786]"
              placeholder='e.g. "Dear [Name],"'
            />
            <p className="text-gray-500 text-sm mt-2">
              You can use placeholders like [Name], [Amount], etc.
            </p>
          </div>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={handleProcessFile}
              disabled={isProcessing}
              className="px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
            >
              {isProcessing ? 'Processing...' : 'Generate Letters'}
            </button>
            <button
              onClick={handleClearFile}
              disabled={isProcessing}
              className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors duration-200"
            >
              Clear All
            </button>
          </div>
        </>
      )}

      {isProcessing && <p className="mt-4 text-center text-[#83b786]">Processing...</p>}
    </div>
  );
}

export default BatchFromXlsx;
