// src/pages/DonorLetter/BatchFromXLSX.tsx

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import Select from 'react-select';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

/* =================== Utility Helpers =================== */

/**
 * Convert normal points to half-points (docx uses half-points).
 */
const ptToHalfPt = (pt: number) => pt * 2;

/**
 * Formats a date as "MMM dd yyyy" (e.g. "Mar 02 2025"), removing the comma.
 */
const formatDate = (date: Date): string => {
  return date
    .toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })
    .replace(',', '');
};

/**
 * Attempt to parse Excel cell data as date:
 * - If numeric, interpret as an Excel date serial
 * - If string, parse normally
 * Returns "MMM dd yyyy" if valid, or empty string if invalid/blank.
 */
const parseExcelDate = (val: any): string => {
  if (!val) return '';

  // If numeric, treat as Excel date serial
  if (typeof val === 'number') {
    if (XLSX.SSF?.parse_date_code) {
      const dateObj = XLSX.SSF.parse_date_code(val);
      if (dateObj) {
        const d = new Date(dateObj.y, dateObj.m - 1, dateObj.d);
        return formatDate(d);
      }
    }
    // Fallback if parse_date_code is unavailable
    const fallback = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(fallback.getTime()) ? '' : formatDate(fallback);
  }

  // If string, parse normally
  const parsed = new Date(val);
  if (isNaN(parsed.getTime())) return '';
  return formatDate(parsed);
};

/**
 * Formats a donation amount string (remove non-numbers, handle decimals, add commas).
 */
const formatAmount = (val: string): string => {
  // Remove all but digits and decimal
  const cleanedValue = val.replace(/[^0-9.]/g, '');
  const parts = cleanedValue.split('.');
  let integerPart = parts[0] || '';
  let decimalPart = parts[1] || '';

  decimalPart = decimalPart.substring(0, 2); // up to 2 decimals
  // Remove leading zeros unless the entire part is "0"
  integerPart = integerPart.replace(/^0+(?!$)/, '');
  // Insert commas
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  let formatted = integerPart;
  if (decimalPart.length > 0) {
    formatted += '.' + decimalPart;
  }
  return formatted;
};

/* ================ DOCX Generation ================ */

const buildLetterParagraphs = (
  letterDate: string,
  name: string,
  address: string,
  cityStateZip: string,
  greeting: string,
  donationAmount: string,
  donationDate: string
): Paragraph[] => {
  return [
    // 5 blank lines
    new Paragraph({}), new Paragraph({}), new Paragraph({}), new Paragraph({}), new Paragraph({}),

    // Letter Date
    new Paragraph({
      children: [
        new TextRun({
          text: letterDate,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // 3 blank lines
    new Paragraph({}), new Paragraph({}), new Paragraph({}),

    // Donor Name
    new Paragraph({
      children: [
        new TextRun({
          text: name,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // Address
    new Paragraph({
      children: [
        new TextRun({
          text: address,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // City/State/ZIP
    new Paragraph({
      children: [
        new TextRun({
          text: cityStateZip,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // 3 blank lines
    new Paragraph({}), new Paragraph({}), new Paragraph({}),

    // Greeting
    new Paragraph({
      children: [
        new TextRun({
          text: greeting,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // 1 blank line
    new Paragraph({}),

    // Body
    new Paragraph({
      children: [
        new TextRun({
          text:
            `The STEM Greenhouse thanks you for your generous gift of $${donationAmount} ` +
            `to support our efforts to prepare youth in our community for careers in science, technology, ` +
            `engineering, and math. It is individual donations such as yours that help us complete our mission ` +
            `and allow us to expand our programs. We are a tax-exempt organization, and your donation qualifies ` +
            `as a tax deduction should you care to take it. This letter will serve as your receipt. ` +
            `Thank you again for assisting the STEM Greenhouse. If you need additional information about our ` +
            `organization, please do not hesitate to contact us.`,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // 3 blank lines
    new Paragraph({}), new Paragraph({}), new Paragraph({}),

    // Sincerely
    new Paragraph({
      children: [
        new TextRun({
          text: 'Sincerely,',
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // 6 blank lines for signature
    new Paragraph({}), new Paragraph({}), new Paragraph({}),
    new Paragraph({}), new Paragraph({}), new Paragraph({}),

    // Signature block
    new Paragraph({
      children: [
        new TextRun({
          text: 'Keli Christopher, Ph.D.',
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Executive Director and Founder',
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'STEM Greenhouse',
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // 5 blank lines
    new Paragraph({}), new Paragraph({}), new Paragraph({}), new Paragraph({}), new Paragraph({}),

    // Footer with donation info
    new Paragraph({
      children: [
        new TextRun({
          text:
            'STEM Greenhouse is recognized as a 501(c)(3) nonprofit organization ' +
            'and its tax number is 32-0454196. Your contribution is tax-deductible to the extent ' +
            'allowed by law. No goods or services were provided in exchange for your generous ' +
            'financial donation. Please retain this receipt as verification of the above donation ' +
            'in compliance with IRS regulation.',
          font: 'PT Sans',
          size: ptToHalfPt(9),
          color: '222222',
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Date: ${donationDate}`,
          font: 'PT Sans',
          size: ptToHalfPt(9),
          color: '222222',
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Amount: $${donationAmount}`,
          font: 'PT Sans',
          size: ptToHalfPt(9),
          color: '222222',
        }),
      ],
    }),
  ];
};

/**
 * Build a single-letter docx for one row.
 */
const buildSingleLetterDoc = async (
  letterDate: string,
  name: string,
  address: string,
  cityStateZip: string,
  greeting: string,
  amount: string,
  donationDate: string
): Promise<Blob> => {
  const paragraphs = buildLetterParagraphs(
    letterDate,
    name,
    address,
    cityStateZip,
    greeting,
    amount,
    donationDate
  );

  const doc = new DocxDocument({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 8.5 * 72 * 20,
              height: 11 * 72 * 20,
            },
            margin: {
              top: 1 * 72 * 20,
              bottom: 1 * 72 * 20,
              left: 1 * 72 * 20,
              right: 1 * 72 * 20,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  return blob;
};

/**
 * Build one combined doc with each letter separated by a page break.
 */
const buildCombinedDoc = async (
  letters: Array<{
    letterDate: string;
    name: string;
    address: string;
    cityStateZip: string;
    greeting: string;
    amount: string;
    donationDate: string;
  }>
): Promise<Blob> => {
  let allParagraphs: Paragraph[] = [];

  letters.forEach((row, idx) => {
    const p = buildLetterParagraphs(
      row.letterDate,
      row.name,
      row.address,
      row.cityStateZip,
      row.greeting,
      row.amount,
      row.donationDate
    );
    allParagraphs = [...allParagraphs, ...p];

    if (idx < letters.length - 1) {
      // page break
      allParagraphs.push(
        new Paragraph({
          children: [],
          pageBreakBefore: true,
        })
      );
    }
  });

  const doc = new DocxDocument({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 8.5 * 72 * 20,
              height: 11 * 72 * 20,
            },
            margin: {
              top: 1 * 72 * 20,
              bottom: 1 * 72 * 20,
              left: 1 * 72 * 20,
              right: 1 * 72 * 20,
            },
          },
        },
        children: allParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
};

/* =================== COMPONENT =================== */

function BatchFromXLSX(): JSX.Element {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // For mapping
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);

  // The letter date is user-chosen (not from Excel)
  const [letterDate, setLetterDate] = useState<string>('');

  // Mapped columns
  const [addressColumn, setAddressColumn] = useState<string | null>(null);
  const [cityColumn, setCityColumn] = useState<string | null>(null);
  const [stateColumn, setStateColumn] = useState<string | null>(null);
  const [zipColumn, setZipColumn] = useState<string | null>(null);
  const [amountColumn, setAmountColumn] = useState<string | null>(null);
  const [donationDateColumn, setDonationDateColumn] = useState<string | null>(
    null
  );

  // For constructing name/greeting
  const [nameTemplate, setNameTemplate] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');

  // We let user pick placeholders from the columns
  const [availablePlaceholders, setAvailablePlaceholders] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedPlaceholderForName, setSelectedPlaceholderForName] = useState<
    { label: string; value: string } | null
  >(null);
  const [selectedPlaceholderForGreeting, setSelectedPlaceholderForGreeting] =
    useState<{ label: string; value: string } | null>(null);

  /* ========== File + Sheet Selection ========== */

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      alert('Please select an Excel file.');
      return;
    }
    setUploadedFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      if (workbook.SheetNames.length === 0) {
        alert('No sheets found in the Excel file.');
        return;
      }
      setSheetNames(workbook.SheetNames);
    } catch (error) {
      alert('Error reading Excel file.');
      console.error(error);
    }
  };

  const handleSheetSelect = (option: any) => {
    if (!option) {
      setSelectedSheet(null);
      setHeaders([]);
      setData([]);
      setAvailablePlaceholders([]);
      resetFormFields();
      return;
    }
    setSelectedSheet(option.value);
    loadSheetData(option.value);
  };

  const loadSheetData = (sheetName: string) => {
    if (!uploadedFile) {
      alert('No file uploaded.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
        defval: '',
      });
      if (jsonData.length > 0) {
        const hdrs = Object.keys(jsonData[0]);
        setHeaders(hdrs);
        setAvailablePlaceholders(
          hdrs.map((header) => ({ label: header, value: `[${header}]` }))
        );
        setData(jsonData);
      } else {
        setHeaders([]);
        setData([]);
        setAvailablePlaceholders([]);
        alert('Selected sheet is empty.');
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

  const handleClearFile = () => {
    setUploadedFile(null);
    setSheetNames([]);
    setSelectedSheet(null);
    setHeaders([]);
    setData([]);
    setAvailablePlaceholders([]);
    setSelectedPlaceholderForName(null);
    setSelectedPlaceholderForGreeting(null);
    resetFormFields();
  };

  /* ========== Placeholder Insertions ========== */
  const handlePlaceholderSelectForName = (option: any) => {
    if (option) {
      setNameTemplate((prev) => prev + option.value);
      setSelectedPlaceholderForName(null);
    }
  };
  const handlePlaceholderSelectForGreeting = (option: any) => {
    if (option) {
      setGreeting((prev) => prev + option.value);
      setSelectedPlaceholderForGreeting(null);
    }
  };

  /* ========== Main Processing ========== */
  const handleProcessFile = async () => {
    if (!uploadedFile) {
      alert('Please upload a file.');
      return;
    }
    if (!selectedSheet) {
      alert('Please select a sheet.');
      return;
    }
    if (data.length === 0) {
      alert('No data found in the selected sheet.');
      return;
    }
    if (!letterDate) {
      alert('Please enter a letter date.');
      return;
    }

    // Check required mappings
    if (
      !addressColumn ||
      !cityColumn ||
      !stateColumn ||
      !zipColumn ||
      !amountColumn ||
      !donationDateColumn
    ) {
      alert(
        'Please map columns for Address, City, State, Zip, Donation Date, and Amount.'
      );
      return;
    }
    if (!nameTemplate) {
      alert('Please provide a template for the Name field.');
      return;
    }
    if (!greeting) {
      alert('Please provide a greeting.');
      return;
    }

    setIsProcessing(true);

    try {
      // Convert letterDate from "YYYY-MM-DD" to "MMM dd yyyy"
      let letterDateFormatted = '';
      try {
        const d = new Date(letterDate);
        letterDateFormatted = isNaN(d.getTime()) ? '' : formatDate(d);
      } catch {
        letterDateFormatted = '';
      }

      const rowInputs = data.map((row) => {
        // Build final name from placeholders
        let finalName = nameTemplate;
        headers.forEach((header) => {
          const placeholder = `[${header}]`;
          const cellValue = row[header] || '';
          finalName = finalName.replaceAll(placeholder, cellValue);
        });

        // Build greeting from placeholders
        let finalGreeting = greeting;
        headers.forEach((header) => {
          const placeholder = `[${header}]`;
          const cellValue = row[header] || '';
          finalGreeting = finalGreeting.replaceAll(placeholder, cellValue);
        });

        // Format address lines
        const addr = row[addressColumn] || '';
        const c = row[cityColumn] || '';
        const s = row[stateColumn] || '';
        const z = row[zipColumn] || '';

        // Parse donation date, amount
        const rawDonationDate = parseExcelDate(row[donationDateColumn]);
        const rawAmount = formatAmount(String(row[amountColumn]));

        return {
          letterDate: letterDateFormatted,
          name: finalName,
          address: addr,
          cityStateZip: `${c}, ${s} ${z}`,
          greeting: finalGreeting,
          amount: rawAmount,
          donationDate: rawDonationDate,
        };
      });

      // Build combined doc
      const combinedBlob = await buildCombinedDoc(rowInputs);

      // Build individual docs
      const docBlobs: Blob[] = [];
      for (let i = 0; i < rowInputs.length; i++) {
        const b = await buildSingleLetterDoc(
          rowInputs[i].letterDate,
          rowInputs[i].name,
          rowInputs[i].address,
          rowInputs[i].cityStateZip,
          rowInputs[i].greeting,
          rowInputs[i].amount,
          rowInputs[i].donationDate
        );
        docBlobs.push(b);
      }

      // Zip them
      const JSZIP = new JSZip();
      const folder = JSZIP.folder('DOCX')!;
      folder.file('DonorLetters_Combined.docx', combinedBlob);

      docBlobs.forEach((blob, idx) => {
        folder.file(`DonorLetter_${idx + 1}.docx`, blob);
      });

      const zipBlob = await JSZIP.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'DonorLetters.zip');

      alert('Letters generated and downloaded successfully.');
      handleClearFile();
    } catch (error) {
      console.error(error);
      alert('Error generating DOCX letters.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Build drop-down options for known headers
  const headerOptions = headers.map((h) => ({ label: h, value: h }));

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-[#0a0002] mb-6">
        Batch from XLSX
      </h2>
      <div className="text-center mb-6">
        <p className="text-gray-700">
          Upload an Excel file, select a sheet, map columns to fields,
          then build docx letters for each row.
        </p>
      </div>

      {/* File Upload */}
      <div className="mb-6 flex justify-center items-center">
        <label className="flex flex-col items-center px-4 py-6 bg-white text-[#83b786] rounded-lg shadow-md tracking-wide uppercase border border-[#83b786] cursor-pointer hover:bg-[#83b786] hover:text-white transition-colors duration-200">
          <svg
            className="w-8 h-8"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
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

      {/* Sheet Selector */}
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

      {/* Mapping + Form */}
      {selectedSheet && headers.length > 0 && (
        <>
          <h3 className="text-2xl font-semibold mb-4 text-[#0a0002]">
            Map Fields
          </h3>

          {/* Letter Date */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Letter Date (shown at top):
            </label>
            <input
              type="date"
              value={letterDate}
              onChange={(e) => setLetterDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            />
            <p className="text-gray-500 text-sm mt-1">
              (We’ll display this date as e.g. Mar 02 2025)
            </p>
          </div>

          <hr className="my-4" />

          {/* Name Template */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Name Template
            </label>
            <div className="mb-2">
              <label className="text-gray-600 text-sm">
                Insert Placeholder:
              </label>
              <Select
                options={availablePlaceholders}
                value={selectedPlaceholderForName}
                onChange={handlePlaceholderSelectForName}
                isClearable
                placeholder="Select placeholder..."
              />
            </div>
            <input
              type="text"
              value={nameTemplate}
              onChange={(e) => setNameTemplate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#83b786]"
              placeholder='e.g. "[FirstName] [LastName]"'
            />
            <p className="text-gray-500 text-sm mt-1">
              Build the Name by combining placeholders, e.g. [FirstName] [LastName].
            </p>
          </div>

          {/* Address */}
          <div className="mb-4 mt-6">
            <label className="block text-gray-700 font-medium mb-1">
              Address Column
            </label>
            <Select
              options={headerOptions}
              value={addressColumn ? { label: addressColumn, value: addressColumn } : null}
              onChange={(opt) => setAddressColumn(opt ? opt.value : null)}
              isClearable
              placeholder="Select column for Address"
            />
          </div>

          {/* City, State, Zip */}
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="mb-4 md:flex-1">
              <label className="block text-gray-700 font-medium mb-1">
                City Column
              </label>
              <Select
                options={headerOptions}
                value={cityColumn ? { label: cityColumn, value: cityColumn } : null}
                onChange={(opt) => setCityColumn(opt ? opt.value : null)}
                isClearable
                placeholder="Select column for City"
              />
            </div>
            <div className="mb-4 md:flex-1">
              <label className="block text-gray-700 font-medium mb-1">
                State Column
              </label>
              <Select
                options={headerOptions}
                value={stateColumn ? { label: stateColumn, value: stateColumn } : null}
                onChange={(opt) => setStateColumn(opt ? opt.value : null)}
                isClearable
                placeholder="Select column for State"
              />
            </div>
            <div className="mb-4 md:flex-1">
              <label className="block text-gray-700 font-medium mb-1">
                Zip Column
              </label>
              <Select
                options={headerOptions}
                value={zipColumn ? { label: zipColumn, value: zipColumn } : null}
                onChange={(opt) => setZipColumn(opt ? opt.value : null)}
                isClearable
                placeholder="Select column for Zip"
              />
            </div>
          </div>

          <hr className="my-4" />

          {/* Donation Amount */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Donation Amount Column
            </label>
            <Select
              options={headerOptions}
              value={amountColumn ? { label: amountColumn, value: amountColumn } : null}
              onChange={(opt) => setAmountColumn(opt ? opt.value : null)}
              isClearable
              placeholder="Select column for Donation Amount"
            />
          </div>

          {/* Donation Date */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Donation Date Column
            </label>
            <Select
              options={headerOptions}
              value={donationDateColumn ? { label: donationDateColumn, value: donationDateColumn } : null}
              onChange={(opt) => setDonationDateColumn(opt ? opt.value : null)}
              isClearable
              placeholder="Select column for Donation Date"
            />
            <p className="text-gray-500 text-sm mt-1">
              Cells in this column can be either recognized date strings or numeric date serials.
            </p>
          </div>

          <hr className="my-4" />

          {/* Greeting */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">
              Greeting
            </label>
            <div className="mb-2">
              <label className="text-gray-600 text-sm">
                Insert Placeholder:
              </label>
              <Select
                options={availablePlaceholders}
                value={selectedPlaceholderForGreeting}
                onChange={handlePlaceholderSelectForGreeting}
                isClearable
                placeholder="Select placeholder..."
              />
            </div>
            <input
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#83b786]"
              placeholder='e.g. "Dear [FirstName],"'
            />
            <p className="text-gray-500 text-sm mt-1">
              You can use placeholders from your spreadsheet columns.
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

      {isProcessing && (
        <p className="mt-4 text-center text-[#83b786]">Processing...</p>
      )}
    </div>
  );
}

export default BatchFromXLSX;
