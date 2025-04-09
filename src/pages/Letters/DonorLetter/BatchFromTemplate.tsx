// src/pages/DonorLetter/BatchFromTemplate.tsx

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';

/**
 * NOTE: Place your batch_donor_template.docx file in the following location:
 * /public/templates/batch_donor_template.docx
 * This makes it available at "/templates/batch_donor_template.docx" in the browser.
 */

/**
 * Utility function to convert points to half-points (used by docx)
 */
const ptToHalfPt = (pt: number) => pt * 2;

/**
 * Formats a JS Date into "MMM dd yyyy" with no comma.
 * e.g. "Mar 02 2025"
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
 * Parses an Excel cell's value as a date.
 * If the value is numeric, it assumes an Excel date serial.
 * If it's a string, parses normally.
 * Returns a formatted date string ("MMM dd yyyy") or an empty string.
 */
const parseExcelDate = (val: any): string => {
  if (!val) return '';

  if (typeof val === 'number') {
    if (XLSX.SSF && XLSX.SSF.parse_date_code) {
      const dateObj = XLSX.SSF.parse_date_code(val);
      if (dateObj) {
        const d = new Date(dateObj.y, dateObj.m - 1, dateObj.d);
        return formatDate(d);
      }
    }
    const fallback = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(fallback.getTime()) ? '' : formatDate(fallback);
  }

  const parsed = new Date(val);
  if (isNaN(parsed.getTime())) return '';
  return formatDate(parsed);
};

/**
 * Builds an array of docx Paragraph objects for a single letter.
 */
const buildLetterParagraphs = (
  letterDate: string,
  donorName: string,
  address: string,
  cityStateZip: string,
  donationAmount: string,
  donationDate: string
): Paragraph[] => {
  return [
    // 5 blank lines before the date
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),

    // Letter date
    new Paragraph({
      spacing: { after: ptToHalfPt(10) },
      children: [
        new TextRun({
          text: letterDate,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // 3 blank lines after date
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),

    // Donor name(s)
    new Paragraph({
      children: [
        new TextRun({
          text: donorName,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // Street address
    new Paragraph({
      children: [
        new TextRun({
          text: address,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // City, State, ZIP
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
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),

    // Greeting
    new Paragraph({
      children: [
        new TextRun({
          text: `Dear ${donorName},`,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // 1 blank line
    new Paragraph({}),

    // Main content paragraph
    new Paragraph({
      spacing: { after: ptToHalfPt(10) },
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
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),

    // Sincerely,
    new Paragraph({
      children: [
        new TextRun({
          text: 'Sincerely,',
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    }),

    // 6 blank lines for signature space
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),

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
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),
    new Paragraph({}),

    // Receipt info
    new Paragraph({
      spacing: { after: ptToHalfPt(10) },
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
 * Builds a docx Document (single letter) from the row data and returns a Blob.
 */
const buildSingleLetterDoc = async (
  letterDate: string,
  donorName: string,
  address: string,
  cityStateZip: string,
  donationAmount: string,
  donationDate: string
): Promise<Blob> => {
  const paragraphs = buildLetterParagraphs(
    letterDate,
    donorName,
    address,
    cityStateZip,
    donationAmount,
    donationDate
  );

  const doc = new DocxDocument({
    sections: [
      {
        properties: {
          page: {
            size: { width: 8.5 * 72 * 20, height: 11 * 72 * 20 },
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
 * Builds one combined docx Document containing multiple letters (separated by page breaks) and returns a Blob.
 */
const buildCombinedDoc = async (
  rowData: Array<{
    letterDate: string;
    donorName: string;
    address: string;
    cityStateZip: string;
    donationAmount: string;
    donationDate: string;
  }>
): Promise<Blob> => {
  let allParagraphs: Paragraph[] = [];

  rowData.forEach((row, idx) => {
    const paragraphs = buildLetterParagraphs(
      row.letterDate,
      row.donorName,
      row.address,
      row.cityStateZip,
      row.donationAmount,
      row.donationDate
    );
    allParagraphs = [...allParagraphs, ...paragraphs];

    if (idx < rowData.length - 1) {
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
            size: { width: 8.5 * 72 * 20, height: 11 * 72 * 20 },
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

function BatchFromTemplate(): JSX.Element {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

      if (workbook.SheetNames.length !== 1) {
        toast.error('Template file must have exactly one sheet. Please try again.');
        setUploadedFile(null);
        setData([]);
        return;
      }

      const sheetName = workbook.SheetNames[0];
      const ws = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
        defval: '',
      });
      if (jsonData.length === 0) {
        toast.error('Selected sheet is empty.');
        setData([]);
        return;
      }

      setData(jsonData);
      toast.success('Template file loaded successfully.');
    } catch (error) {
      toast.error('Error reading Excel file.');
      console.error(error);
    }
  };

  const handleGenerateDocs = async () => {
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
      // Assume the Excel template contains the following columns:
      // "Date", "Name", "Address", "City", "State", "Zip", "Amount", "Donation Date"
      const rowInputs = data.map((row) => {
        const letterDate = parseExcelDate(row['Date']);
        const donorName = row['Name'] || '';
        const address = row['Address'] || '';
        const cityStateZip = `${row['City'] || ''}, ${row['State'] || ''} ${row['Zip'] || ''}`;
        const donationAmount = String(row['Amount'] || '');
        const donationDate = parseExcelDate(row['Donation Date']);
        return {
          letterDate,
          donorName,
          address,
          cityStateZip,
          donationAmount,
          donationDate,
        };
      });

      const combinedDocBlob = await buildCombinedDoc(rowInputs);
      const docBlobs = [];
      for (let i = 0; i < rowInputs.length; i++) {
        const singleBlob = await buildSingleLetterDoc(
          rowInputs[i].letterDate,
          rowInputs[i].donorName,
          rowInputs[i].address,
          rowInputs[i].cityStateZip,
          rowInputs[i].donationAmount,
          rowInputs[i].donationDate
        );
        docBlobs.push(singleBlob);
      }

      const zip = new JSZip();
      // Place files at the root of the zip (no subfolder)
      zip.file('DonorLetters_Combined.docx', combinedDocBlob);
      docBlobs.forEach((blob, index) => {
        zip.file(`DonorLetter_${index + 1}.docx`, blob);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'DonorLetters.zip');

      toast.success('DOCX letters generated successfully. Download should start soon.');
      setUploadedFile(null);
      setData([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate DOCX letters.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-[#0a0002] mb-6">
        Batch from Template (DOCX)
      </h2>
      <p className="text-center mb-6 text-gray-700">
        Upload an Excel file that has exactly one sheet with columns named: Date, Name, Address, City, State, Zip, Amount, Donation Date.
      </p>

      {/* Download Template Link */}
      <div className="mb-6 text-center">
        <a
          href="/templates/batch_donor_template.docx"
          download
          className="text-[#83b786] underline"
        >
          Download Batch Donor Template
        </a>
      </div>

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
          onClick={handleGenerateDocs}
          disabled={isProcessing}
          className="px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
        >
          {isProcessing ? 'Processing...' : 'Generate DOCX Letters'}
        </button>
      </div>
    </div>
  );
}

export default BatchFromTemplate;
