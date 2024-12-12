// src/pages/CentralLetter/CentralLetter.tsx

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { generate } from '@pdfme/generator';
import { PDFDocument } from 'pdf-lib';
import Select from 'react-select';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

interface TemplateFieldSchema {
  position: { x: number; y: number };
  width: number;
  height: number;
  fontSize: number;
  type: 'text';
  alignment: 'left' | 'right' | 'center';
  fontColor: string;
  lineHeight: number;
  rotate: number;
}

interface Template {
  schemas: Array<Record<string, TemplateFieldSchema>>;
  basePdf: string;
}

function CentralLetter(): JSX.Element {
  const [uploadedPDFFile, setUploadedPDFFile] = useState<File | null>(null);
  const [uploadedExcelFile, setUploadedExcelFile] = useState<File | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);

  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);

  const [greetingText, setGreetingText] = useState<string>('');
  const [availablePlaceholders, setAvailablePlaceholders] = useState<{ label: string; value: string }[]>([]);
  const [selectedPlaceholderForGreeting, setSelectedPlaceholderForGreeting] = useState<{ label: string; value: string } | null>(null);

  // A single date field (not from Excel)
  const [selectedDate, setSelectedDate] = useState<string>(''); // store as yyyy-mm-dd

  const [isProcessing, setIsProcessing] = useState(false);
  const greetingInputRef = useRef<HTMLInputElement>(null);

  // Handle PDF Upload
  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return; 
    }
    setUploadedPDFFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64Pdf = arrayBufferToBase64(arrayBuffer);
      const basePdfData = `data:application/pdf;base64,${base64Pdf}`;

      const newTemplate: Template = {
        schemas: [
          {
            'Greeting': {
              position: { x: 25.4, y: 71.29 },
              width: 149.52,
              height: 13,
              fontSize: 12,
              lineHeight: 1,
              fontColor: '#000000',
              rotate: 0,
              type: 'text',
              alignment: 'left',
            },
            'Date': {
              position: { x: 159.58, y: 59.61 },
              width: 149.52,
              height: 13,
              fontSize: 12,
              lineHeight: 1,
              fontColor: '#000000',
              rotate: 0,
              type: 'text',
              alignment: 'left',
            }
          }
        ],
        basePdf: basePdfData,
      };

      setTemplate(newTemplate);
    } catch (error) {
      console.error('Error reading PDF file:', error);
      toast.error('An error occurred while reading the PDF file.');
    }
  };

  // Handle Excel Upload
  const handleExcelFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return; 
    }
    setUploadedExcelFile(file);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      if (workbook.SheetNames.length > 0) {
        setSheetNames(workbook.SheetNames);
        if (workbook.SheetNames.length === 1) {
          setSelectedSheet(workbook.SheetNames[0]);
          loadSheetData(workbook, workbook.SheetNames[0]);
        }
      } else {
        toast.error('No sheets found in the Excel file.');
      }
    } catch (error) {
      console.error('Error reading Excel file:', error);
      toast.error('An error occurred while reading the Excel file.');
    }
  };

  const loadSheetData = (workbook: XLSX.WorkBook, sheetName: string) => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' });
    if (jsonData.length > 0) {
      const hdrs = Object.keys(jsonData[0]);
      setHeaders(hdrs);
      setAvailablePlaceholders(hdrs.map((h) => ({ label: h, value: `[${h}]` })));
      setData(jsonData);
    } else {
      toast.error(`Selected sheet "${sheetName}" is empty.`);
    }
  };

  const handleSheetSelect = (option: any) => {
    if (!uploadedExcelFile) {
      return;
    }

    if (option) {
      setSelectedSheet(option.value);
      uploadedExcelFile.arrayBuffer().then((data) => {
        const workbook = XLSX.read(data);
        loadSheetData(workbook, option.value);
      });
    } else {
      setSelectedSheet(null);
      setHeaders([]);
      setData([]);
      setAvailablePlaceholders([]);
    }
  };

  const insertPlaceholderIntoGreeting = (placeholder: string) => {
    if (greetingInputRef.current) {
      const input = greetingInputRef.current;
      const start = input.selectionStart ?? greetingText.length;
      const end = input.selectionEnd ?? greetingText.length;
      const newText = greetingText.slice(0, start) + placeholder + greetingText.slice(end);
      setGreetingText(newText);
      setTimeout(() => {
        if (input) {
          input.selectionStart = input.selectionEnd = start + placeholder.length;
          input.focus();
        }
      }, 0);
    } else {
      setGreetingText((prev) => prev + placeholder);
    }
  };

  const handlePlaceholderChangeForGreeting = (option: any) => {
    if (option) {
      insertPlaceholderIntoGreeting(option.value);
      setSelectedPlaceholderForGreeting(null);
    }
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const formatSelectedDate = (rawDate: string): string => {
    if (!rawDate || rawDate.trim() === '') return '';
    const parsedDate = new Date(rawDate);
    if (isNaN(parsedDate.getTime())) {
      return '';
    }
    return format(parsedDate, 'MMMM d, yyyy');
  };

  const capitalizeFirstLetter = (input: any): string => {
    let str = String(input); // ensure we have a string
    str = str.trim();
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const handleGeneratePDFs = async () => {
    if (!template) {
      toast.error('Please upload a PDF file first.');
      return;
    }
    if (!uploadedExcelFile) {
      toast.error('Please upload an Excel file.');
      return;
    }
    if (!selectedSheet || data.length === 0) {
      toast.error('Please select a sheet with data.');
      return;
    }
    if (!greetingText) {
      toast.error('Please provide a greeting text.');
      return;
    }
    if (!selectedDate) {
      toast.error('Please select a date.');
      return;
    }

    setIsProcessing(true);

    try {
      const formattedDate = formatSelectedDate(selectedDate);

      const inputs = data.map((row: any) => {
        let finalGreeting = greetingText;
        headers.forEach((header) => {
          const placeholder = `[${header}]`;
          let value = row[header] || '';
          value = capitalizeFirstLetter(value);
          finalGreeting = finalGreeting.replaceAll(placeholder, value);
        });

        return {
          'Greeting': finalGreeting,
          'Date': formattedDate,
        };
      });

      const pdfByteArrays: Uint8Array[] = [];
      const zip = new JSZip();
      const pdfFolder = zip.folder('PDFs');

      for (let i = 0; i < inputs.length; i++) {
        const singleInput = [inputs[i]];
        const pdfUint8Array = await generate({ template, inputs: singleInput } as any);
        pdfByteArrays.push(pdfUint8Array);
        const pdfBlob = new Blob([pdfUint8Array], { type: 'application/pdf' });
        pdfFolder?.file(`CentralLetter_${i + 1}.pdf`, pdfBlob);
      }

      // Combine all PDFs
      const combinedPdf = await PDFDocument.create();
      for (let i = 0; i < pdfByteArrays.length; i++) {
        const pdfDoc = await PDFDocument.load(pdfByteArrays[i]);
        const copiedPages = await combinedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        copiedPages.forEach((page) => combinedPdf.addPage(page));
      }
      const combinedPdfBytes = await combinedPdf.save();
      const combinedPdfBlob = new Blob([combinedPdfBytes], { type: 'application/pdf' });
      pdfFolder?.file('CentralLetter_Combined.pdf', combinedPdfBlob);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'CentralLetters.zip');

      toast.success('PDFs generated and downloaded successfully.');
      handleClearAll();
    } catch (error) {
      console.error('Error generating PDFs:', error);
      toast.error('An error occurred while generating PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearAll = () => {
    setUploadedPDFFile(null);
    setUploadedExcelFile(null);
    setTemplate(null);
    setSheetNames([]);
    setSelectedSheet(null);
    setHeaders([]);
    setData([]);
    setAvailablePlaceholders([]);
    setGreetingText('');
    setSelectedDate('');
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-center text-[#0a0002] mb-6">Central Letter Generator</h2>
      <div className="text-center mb-6">
        <p className="text-gray-700">
          Upload a base PDF, then upload an Excel sheet with data. Set a greeting with placeholders and choose a date. Generate personalized letters as PDFs.
        </p>
      </div>

      {/* Upload PDF */}
      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-2">Upload Base PDF</label>
        <div className="flex justify-center items-center">
          <label className="flex flex-col items-center px-4 py-6 bg-white text-[#83b786] border border-[#83b786] rounded-lg shadow-md cursor-pointer hover:bg-[#83b786] hover:text-white transition-colors duration-200">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M16.88 9.94l-5-5A1 1 0 0010.5 5h-7a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-7a1 1 0 00-.12-.44zM11 9V5.41L15.59 10H12a1 1 0 01-1-1z" />
            </svg>
            <span className="mt-2 text-base leading-normal">
              {uploadedPDFFile ? uploadedPDFFile.name : 'Upload PDF File'}
            </span>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePDFUpload}
              className="hidden"
              disabled={isProcessing || uploadedPDFFile !== null}
            />
          </label>
        </div>
      </div>

      {/* Upload Excel */}
      {template && (
        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">Upload Excel File</label>
          <div className="flex justify-center items-center">
            <label className="flex flex-col items-center px-4 py-6 bg-white text-[#83b786] border border-[#83b786] rounded-lg shadow-md cursor-pointer hover:bg-[#83b786] hover:text-white transition-colors duration-200">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
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
        </div>
      )}

      {/* Select Sheet if multiple */}
      {template && uploadedExcelFile && sheetNames.length > 1 && (
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

      {template && uploadedExcelFile && selectedSheet && headers.length > 0 && (
        <>
          <h3 className="text-2xl font-semibold mb-4 text-[#0a0002]">Fields</h3>

          {/* Date Input */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-1">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            />
            <p className="text-gray-500 text-sm mt-2">This date will be the same for all letters and will be formatted as "December 9, 2024".</p>
          </div>

          {/* Greeting Field */}
          <h3 className="text-xl font-semibold mb-2 text-[#0a0002]">Greeting Field</h3>
          <label className="block text-gray-700 font-medium mb-2">Insert Placeholder:</label>
          <Select
            options={availablePlaceholders}
            value={selectedPlaceholderForGreeting}
            onChange={handlePlaceholderChangeForGreeting}
            isClearable
            placeholder="Select a placeholder to insert..."
          />
          <label className="block text-gray-700 font-medium mt-4 mb-2">
            Greeting Text:
          </label>
          <input
            type="text"
            ref={greetingInputRef}
            value={greetingText}
            onChange={(e) => setGreetingText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#83b786]"
            placeholder='e.g. "Dear [First Name],"'
          />
          <p className="text-gray-500 text-sm mt-2">
            Use placeholders like [First Name]. They will be replaced per row, capitalized.
          </p>

          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={handleGeneratePDFs}
              disabled={isProcessing}
              className="px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
            >
              {isProcessing ? 'Processing...' : 'Generate Letters'}
            </button>
            <button
              onClick={handleClearAll}
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

export default CentralLetter;
