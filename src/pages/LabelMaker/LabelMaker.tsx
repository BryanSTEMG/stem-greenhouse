// src/pages/LabelMaker/LabelMaker.tsx

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeightRule,
  BorderStyle,
} from 'docx';
import Select from 'react-select';

// Import toast from react-toastify
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import JSZip for zipping the PDF and DOCX together
import JSZip from 'jszip';

function LabelMaker(): JSX.Element {
  const [step, setStep] = useState<number>(1);
  const [headers, setHeaders] = useState<string[]>([]);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [template, setTemplate] = useState<string>('');
  const [availablePlaceholders, setAvailablePlaceholders] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<
    { label: string; value: string } | null
  >(null);

  // States to handle multiple sheets
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        setWorkbook(wb);
        setSheetNames(wb.SheetNames);

        // If only one sheet, parse immediately
        if (wb.SheetNames.length === 1) {
          parseSheetData(wb, wb.SheetNames[0]);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  // Parse data from a selected sheet
  const parseSheetData = (wb: XLSX.WorkBook, sheetName: string) => {
    try {
      const ws = wb.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(ws, {
        defval: '',
      });

      if (jsonData.length > 0) {
        const firstRow = jsonData[0];
        const headers = Object.keys(firstRow);
        setHeaders(headers);
        setAvailablePlaceholders(
          headers.map((header) => ({ label: header, value: `[${header}]` }))
        );
        setData(jsonData);
        setStep(2);
      } else {
        toast.error('No data found in the selected sheet.');
      }
    } catch (error) {
      toast.error('Error parsing the selected sheet.');
    }
  };

  // Handle user selecting a sheet (if multiple)
  const handleSheetSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const chosenSheet = e.target.value;
    setSelectedSheet(chosenSheet);
    if (workbook && chosenSheet) {
      parseSheetData(workbook, chosenSheet);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate(e.target.value);
  };

  const handlePlaceholderSelect = (selectedOption: any) => {
    if (selectedOption) {
      setTemplate((prev) => prev + selectedOption.value);
      setSelectedPlaceholder(null); // Reset
    }
  };

  const generateLabels = async () => {
    // Common label settings
    const labelsPerRow = 3;
    const labelsPerColumn = 10;
    const labelWidthInches = 2.625;
    const labelHeightInches = 1;

    // ---------------------------------
    // 1) Generate PDF
    // ---------------------------------
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const labelWidth = labelWidthInches * 72; // 72 pts = 1 in
    const labelHeight = labelHeightInches * 72;
    const marginLeft = 0.21975 * 72;
    const marginTop = 0.5 * 72;
    const horizontalSpacing = 0.125 * 72;
    const verticalSpacing = 0 * 72;
    const fontSize = 10;

    let labelIndex = 0;
    while (labelIndex < data.length) {
      const page = pdfDoc.addPage([612, 792]);
      let placedAtLeastOneLabel = false;

      for (let row = 0; row < labelsPerColumn; row++) {
        for (let col = 0; col < labelsPerRow; col++) {
          if (labelIndex >= data.length) break;
          placedAtLeastOneLabel = true;

          const x = marginLeft + col * (labelWidth + horizontalSpacing);
          const y = 792 - marginTop - row * (labelHeight + verticalSpacing);

          const rowData = data[labelIndex];
          let labelText = template;
          headers.forEach((header) => {
            const placeholder = `[${header}]`;
            const value = rowData[header] || '';
            labelText = labelText.replaceAll(placeholder, value);
          });

          const textLines = labelText.split('\n');
          let textY = y - 15; // Shift text down inside label
          for (const line of textLines) {
            page.drawText(line, {
              x: x + 5,
              y: textY,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
              maxWidth: labelWidth - 10,
            });
            textY -= fontSize + 2;
          }

          labelIndex++;
          if (labelIndex >= data.length) break;
        }
        if (labelIndex >= data.length) break;
      }

      if (!placedAtLeastOneLabel) {
        // If page was created but no labels placed, remove it
        pdfDoc.removePage(pdfDoc.getPageCount() - 1);
      }
    }

    // Save PDF as bytes
    const pdfBytes = await pdfDoc.save();

    // ---------------------------------
    // 2) Generate DOCX
    // ---------------------------------
    // Build the table row-by-row, each row holds up to 3 cells
    const tableRows: TableRow[] = [];

    // We'll accumulate cells in a local array first
    let currentRowCells: TableCell[] = [];

    for (let i = 0; i < data.length; i++) {
      // Whenever i % labelsPerRow === 0, we start a new row
      if (i % labelsPerRow === 0 && i !== 0) {
        // Push the completed row
        tableRows.push(
          new TableRow({
            children: currentRowCells,
            height: {
              value: labelHeightInches * 1440, // EXACT in twips
              rule: HeightRule.EXACT,
            },
          })
        );
        currentRowCells = []; // reset
      }

      const rowData = data[i];
      let labelText = template;
      headers.forEach((header) => {
        const placeholder = `[${header}]`;
        const value = rowData[header] || '';
        labelText = labelText.replaceAll(placeholder, value);
      });

      const labelParagraphs = labelText
        .split('\n')
        .map((line) => new Paragraph(line));

      // Create cell with no borders
      const cell = new TableCell({
        children: labelParagraphs,
        width: {
          size: labelWidthInches * 1440, 
          type: WidthType.DXA,
        },
        margins: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        },
      });

      currentRowCells.push(cell);
    }

    // If there's a partially filled row left
    if (currentRowCells.length > 0) {
      // Fill the row until it has exactly labelsPerRow cells
      while (currentRowCells.length < labelsPerRow) {
        currentRowCells.push(
          new TableCell({
            children: [],
            width: {
              size: labelWidthInches * 1440,
              type: WidthType.DXA,
            },
            margins: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
              right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            },
          })
        );
      }

      tableRows.push(
        new TableRow({
          children: currentRowCells,
          height: {
            value: labelHeightInches * 1440,
            rule: HeightRule.EXACT,
          },
        })
      );
    }

    // Build the table
    const table = new Table({
      rows: tableRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      margins: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      },
    });

    // One section with the table
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [table],
        },
      ],
    });

    // DOCX as Blob
    const docBlob = await Packer.toBlob(doc);

    // ---------------------------------
    // 3) Zip the PDF & DOCX together
    // ---------------------------------
    const zip = new JSZip();
    zip.file('labels.pdf', pdfBytes);
    zip.file('labels.docx', docBlob);

    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, 'labels.zip');
  };

  const handleNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setStep((prev) => prev - 1);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-4xl font-bold text-center text-[#0a0002] mb-6">Label Maker</h1>

        {step === 1 && (
          <div className="mb-8">
            <div className="flex justify-center items-center mb-6">
              <label className="flex flex-col items-center px-4 py-6 bg-white text-[#83b786] rounded-lg shadow-md tracking-wide uppercase border border-[#83b786] cursor-pointer hover:bg-[#83b786] hover:text-white transition-colors duration-200">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M16.88 9.94l-5-5A1 1 0 0010.5 5h-7a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1v-7a1 1 0 00-.12-.44zM11 9V5.41L15.59 10H12a1 1 0 01-1-1z" />
                </svg>
                <span className="mt-2 text-base leading-normal">Upload Excel File</span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Multiple sheets dropdown */}
            {sheetNames.length > 1 && (
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-2">
                  Select a Sheet:
                </label>
                <select
                  value={selectedSheet}
                  onChange={handleSheetSelection}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#83b786]"
                >
                  <option value="">-- Choose a Sheet --</option>
                  {sheetNames.map((sheetName) => (
                    <option key={sheetName} value={sheetName}>
                      {sheetName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {step === 2 && headers.length > 0 && (
          <>
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Add a Placeholder:
              </label>
              <Select
                options={availablePlaceholders}
                value={selectedPlaceholder}
                onChange={handlePlaceholderSelect}
                isClearable
                placeholder="Select a placeholder..."
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>

            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Label Template:
              </label>
              <textarea
                value={template}
                onChange={handleTemplateChange}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#83b786]"
                placeholder="Enter your label template using the placeholders above"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition-colors duration-200"
              >
                Back
              </button>
              <button
                onClick={generateLabels}
                className="px-6 py-3 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
              >
                Generate Labels
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LabelMaker;
