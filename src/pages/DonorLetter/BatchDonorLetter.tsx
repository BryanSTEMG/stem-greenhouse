// src/pages/DonorLetter/BatchDonorLetter.tsx

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generate } from '@pdfme/generator';
import { format } from 'date-fns';
import { template } from './source'; // Predefined PDF template
import Select from 'react-select';
import { toast } from 'react-toastify';
import { Document, Packer, Paragraph, TextRun } from 'docx';

function BatchDonorLetter(): JSX.Element {
  const [method, setMethod] = useState<'provided' | 'upload' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generateWordDocs, setGenerateWordDocs] = useState(false);

  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);

  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);

  const [dateColumn, setDateColumn] = useState<string | null>(null);
  const [addressColumn, setAddressColumn] = useState<string | null>(null);
  const [cityColumn, setCityColumn] = useState<string | null>(null);
  const [stateColumn, setStateColumn] = useState<string | null>(null);
  const [zipColumn, setZipColumn] = useState<string | null>(null);
  const [amountColumn, setAmountColumn] = useState<string | null>(null);
  const [donationDateColumn, setDonationDateColumn] = useState<string | null>(null);

  const [nameTemplate, setNameTemplate] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');

  const [availablePlaceholders, setAvailablePlaceholders] = useState<{ label: string; value: string }[]>([]);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<{ label: string; value: string } | null>(null);
  const [selectedPlaceholderForName, setSelectedPlaceholderForName] = useState<{ label: string; value: string } | null>(null);

  const handleMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMethod(e.target.value as 'provided' | 'upload');
    setUploadedFile(null);
    setSheetNames([]);
    setSelectedSheet(null);
    setHeaders([]);
    setData([]);
    setAvailablePlaceholders([]);
    resetFormFields();
    // Note: We no longer automatically fetch or load the provided template from the server.
    // The user will still upload their XLSX file. The "provided" method simply means we assume a known set of headers.
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      toast.error('Please select an Excel file.');
      return;
    }

    setUploadedFile(file);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      if (workbook.SheetNames.length > 0) {
        setSheetNames(workbook.SheetNames);
      } else {
        toast.error('No sheets found in the Excel file.');
      }
    } catch (error) {
      toast.error('An error occurred while reading the file. Please try again.');
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
      // Even in provided method, user must upload a file. If no file, error.
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
        const firstRow = jsonData[0];
        const hdrs = Object.keys(firstRow);
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
    setDateColumn(null);
    setAddressColumn(null);
    setCityColumn(null);
    setStateColumn(null);
    setZipColumn(null);
    setAmountColumn(null);
    setDonationDateColumn(null);
    setNameTemplate('');
    setGreeting('');
  };

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
    setMethod(null);
  };

  const handleProcessFile = async () => {
    if (!method) {
      toast.error('Please choose a method first.');
      return;
    }

    if (!uploadedFile || !selectedSheet) {
      toast.error('Please upload a file and select a sheet.');
      return;
    }

    if (data.length === 0) {
      toast.error('No data found in the selected sheet.');
      return;
    }

    if (!dateColumn || !addressColumn || !cityColumn || !stateColumn || !zipColumn || !amountColumn || !donationDateColumn) {
      toast.error('Please select columns for Date, Address, City, State, Zip, Amount, and Date of Donation.');
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
      // Prepare inputs
      const inputs = data.map((row: any) => {
        const rawDate = row[dateColumn] || '';
        const rawAddress = row[addressColumn] || '';
        const rawCity = row[cityColumn] || '';
        const rawState = row[stateColumn] || '';
        const rawZip = row[zipColumn] || '';
        const rawAmount = row[amountColumn] || '';
        const rawDonationDate = row[donationDateColumn] || '';

        const formattedDate = rawDate && typeof rawDate === 'string' && rawDate.trim() !== '' 
          ? format(new Date(rawDate), 'MMMM d, yyyy') : '';
        const formattedDonationDate = rawDonationDate && typeof rawDonationDate === 'string' && rawDonationDate.trim() !== ''
          ? format(new Date(rawDonationDate), 'MMMM d, yyyy') : '';

        const formattedAmount = formatAmount(String(rawAmount));

        let finalGreeting = greeting;
        headers.forEach((header) => {
          const placeholder = `[${header}]`;
          const value = row[header] || '';
          finalGreeting = finalGreeting.replaceAll(placeholder, value);
        });

        let finalName = nameTemplate;
        headers.forEach((header) => {
          const placeholder = `[${header}]`;
          const value = row[header] || '';
          finalName = finalName.replaceAll(placeholder, value);
        });

        return {
          'Date': formattedDate,
          'Name': finalName,
          'Address': rawAddress,
          'City': `${rawCity}, ${rawState} ${rawZip}`,
          'Greeting': finalGreeting,
          'Amount': `${formattedAmount} to support our efforts to`,
          'Amount 2': formattedAmount,
          'Date of donation': formattedDonationDate,
        };
      });

      // Generate PDFs
      const combinedPdfUint8Array = await generate({ template, inputs } as any);
      const combinedPdfBlob = new Blob([combinedPdfUint8Array], { type: 'application/pdf' });

      const pdfBlobs = [];
      for (let i = 0; i < inputs.length; i++) {
        const singleInput = [inputs[i]];
        const pdfUint8Array = await generate({ template, inputs: singleInput } as any);
        const pdfBlob = new Blob([pdfUint8Array], { type: 'application/pdf' });
        pdfBlobs.push({ blob: pdfBlob, index: i });
      }

      const zip = new JSZip();
      const pdfFolder = zip.folder('PDFs');
      pdfFolder?.file('DonorLetters_Combined.pdf', combinedPdfBlob);
      pdfBlobs.forEach(({ blob, index }) => {
        pdfFolder?.file(`DonorLetter_${index + 1}.pdf`, blob);
      });

      // If generateWordDocs is checked, also generate Word docs (wip)
      if (generateWordDocs) {
        // Note: Achieving a one-to-one match to PDF is difficult.
        // As a workaround, we only provide a simple textual version.
        // To improve, consider using 'html-to-docx' or more complex docx styling.
        const wordFolder = zip.folder('WordDocs (wip)');
        for (let i = 0; i < inputs.length; i++) {
          const docInputs = inputs[i];
          // Create a docx file
          const doc = new Document({
            sections: [
              {
                properties: {},
                children: [
                  new Paragraph({ children: [new TextRun({ text: `Date: ${docInputs['Date']}`, font: 'Times New Roman'})] }),
                  new Paragraph({ children: [new TextRun({ text: `Name: ${docInputs['Name']}`, font: 'Times New Roman', bold: true })] }),
                  new Paragraph({ children: [new TextRun({ text: `Address: ${docInputs['Address']}`, font: 'Times New Roman'})] }),
                  new Paragraph({ children: [new TextRun({ text: `City: ${docInputs['City']}`, font: 'Times New Roman'})] }),
                  new Paragraph({ children: [new TextRun({ text: docInputs['Greeting'], font: 'Times New Roman', italics: true })] }),
                  new Paragraph({ children: [new TextRun({ text: `Amount: ${docInputs['Amount 2']}`, font: 'Times New Roman'})] }),
                  new Paragraph({ children: [new TextRun({ text: `Date of Donation: ${docInputs['Date of donation']}`, font: 'Times New Roman'})] }),
                  new Paragraph({ children: [new TextRun({ text: "Note: This Word version is a simplified layout (WIP).", font: 'Times New Roman', color: "888888"})] }),
                ],
              },
            ],
          });

          const docBlob = await Packer.toBlob(doc);
          wordFolder?.file(`DonorLetter_${i + 1}.docx`, docBlob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'DonorLetters.zip');

      toast.success('Files generated and downloaded successfully.');
      handleClearFile();
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('An error occurred while processing the file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (val: string): string => {
    if (typeof val !== 'string') {
      val = String(val);
    }
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
      <h2 className="text-3xl font-bold text-center text-[#0a0002] mb-6">Batch Donor Letter Generator</h2>
      <div className="text-center mb-6">
        <p className="text-gray-700">
          You can download the provided template{' '}
          <a href="/batch_donor_TEMPLATE.xlsx" download className="text-[#83b786] underline font-medium">
            here
          </a>{' '}
          or upload your own excel sheet. If you select the provided template option, please still upload the corresponding XLSX file.
        </p>
      </div>

      {method === null && (
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Choose a method:
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="method"
                value="provided"
                onChange={handleMethodChange}
              />
              <span>Use Provided Template (expected headers as per template)</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="method"
                value="upload"
                onChange={handleMethodChange}
              />
              <span>Upload Own Excel (custom headers)</span>
            </label>
          </div>
        </div>
      )}

      {(method === 'upload' || method === 'provided') && (
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
      )}

      {sheetNames.length > 0 && method !== null && (
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

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Date</label>
            <Select
              options={headerOptions}
              value={dateColumn ? { label: dateColumn, value: dateColumn } : null}
              onChange={(option: any) => setDateColumn(option ? option.value : null)}
              isClearable
              placeholder="Select column for Date"
            />
          </div>

          <h3 className="text-xl font-semibold mb-2 text-[#0a0002]">Name Field Template</h3>
          <label className="block text-gray-700 font-medium mb-2">Insert Placeholder:</label>
          <Select
            options={availablePlaceholders}
            value={selectedPlaceholderForName}
            onChange={handlePlaceholderSelectForName}
            isClearable
            placeholder="Select a placeholder for Name..."
          />
          <label className="block text-gray-700 font-medium mt-4 mb-2">
            Name Template:
          </label>
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

          <h3 className="text-2xl font-semibold mb-4 text-[#0a0002]">Greeting</h3>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Insert Placeholder:
            </label>
            <Select
              options={availablePlaceholders}
              value={selectedPlaceholder}
              onChange={handlePlaceholderSelectForGreeting}
              isClearable
              placeholder="Select a placeholder for Greeting..."
            />
            <label className="block text-gray-700 font-medium mt-4 mb-2">
              Greeting Text:
            </label>
            <input
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#83b786]"
              placeholder='e.g. "Dear [Name],"'
            />
            <p className="text-gray-500 text-sm mt-2">
              You can use placeholders like [Name], [Date], [Amount], etc.
            </p>
          </div>

          <div className="mb-4 mt-6 flex items-center space-x-2">
            <input
              type="checkbox"
              checked={generateWordDocs}
              onChange={(e) => setGenerateWordDocs(e.target.checked)}
            />
            <span className="text-gray-700">Also generate Word docs? (WIP)</span>
          </div>

          {(method === 'upload' || method === 'provided') && (
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
          )}
        </>
      )}

      {isProcessing && <p className="mt-4 text-center text-[#83b786]">Processing...</p>}
    </div>
  );
}

export default BatchDonorLetter;
