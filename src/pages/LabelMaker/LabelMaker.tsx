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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        // Check if there is more than one sheet
        if (wb.SheetNames.length > 1) {
          alert(
            'Error: The Excel file contains multiple sheets. Please upload a file with only one sheet.'
          );
          return;
        }

        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Specify the type parameter here
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
          setStep(2); // Proceed to next step
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTemplate(e.target.value);
  };

  const handlePlaceholderSelect = (selectedOption: any) => {
    if (selectedOption) {
      setTemplate((prev) => prev + selectedOption.value);
      setSelectedPlaceholder(null); // Reset the selected placeholder
    }
  };

  const generateLabels = async () => {
    // Common variables
    const labelsPerRow = 3;
    const labelsPerColumn = 10;
    const labelWidthInches = 2.625;
    const labelHeightInches = 1;

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const labelWidth = labelWidthInches * 72; // 1 inch = 72 points
    const labelHeight = labelHeightInches * 72;
    const marginLeft = 0.21975 * 72; // Left margin
    const marginTop = 0.5 * 72; // Top margin
    const horizontalSpacing = 0.125 * 72; // Space between labels horizontally
    const verticalSpacing = 0 * 72; // Space between labels vertically
    const fontSize = 10;

    let labelIndex = 0;

    while (labelIndex < data.length) {
      const page = pdfDoc.addPage([612, 792]); // Standard Letter size in points

      for (let row = 0; row < labelsPerColumn; row++) {
        for (let col = 0; col < labelsPerRow; col++) {
          const x = marginLeft + col * (labelWidth + horizontalSpacing);
          const y = 792 - marginTop - row * (labelHeight + verticalSpacing);

          if (labelIndex >= data.length) {
            break;
          }

          const rowData = data[labelIndex];
          let labelText = template;

          headers.forEach((header) => {
            const placeholder = `[${header}]`;
            const value = rowData[header] || '';
            labelText = labelText.replaceAll(placeholder, value);
          });

          const textLines = labelText.split('\n');

          let textY = y - 15; // Adjust text position within the label

          textLines.forEach((line) => {
            page.drawText(line, {
              x: x + 5,
              y: textY,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
              maxWidth: labelWidth - 10,
            });
            textY -= fontSize + 2;
          });

          labelIndex++;

          if (labelIndex >= data.length) {
            break;
          }
        }

        if (labelIndex >= data.length) {
          break;
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    saveAs(pdfBlob, 'labels.pdf');

    // Generate DOCX
    const sections = [];
    const labelWidthTwips = labelWidthInches * 1440; // 1 inch = 1440 twips
    const labelHeightTwips = labelHeightInches * 1440;

    let labelCount = 0;

    while (labelCount < data.length) {
      const tableRows: TableRow[] = [];

      for (let row = 0; row < labelsPerColumn; row++) {
        const tableCells: TableCell[] = [];
        for (let col = 0; col < labelsPerRow; col++) {
          if (labelCount >= data.length) {
            break;
          }

          const rowData = data[labelCount];
          let labelText = template;

          headers.forEach((header) => {
            const placeholder = `[${header}]`;
            const value = rowData[header] || '';
            labelText = labelText.replaceAll(placeholder, value);
          });

          const labelParagraphs = labelText
            .split('\n')
            .map((line) => new Paragraph(line));

          const cell = new TableCell({
            children: labelParagraphs,
            width: {
              size: labelWidthTwips,
              type: WidthType.DXA,
            },
            margins: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
          });

          tableCells.push(cell);

          labelCount++;

          if (labelCount >= data.length) {
            break;
          }
        }

        // Fill empty cells if necessary
        while (tableCells.length < labelsPerRow) {
          const emptyCell = new TableCell({
            children: [],
            width: {
              size: labelWidthTwips,
              type: WidthType.DXA,
            },
            margins: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
            },
          });
          tableCells.push(emptyCell);
        }

        const tableRow = new TableRow({
          children: tableCells,
          height: {
            value: labelHeightTwips,
            rule: HeightRule.EXACT,
          },
        });

        tableRows.push(tableRow);

        if (labelCount >= data.length) {
          break;
        }
      }

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
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
      });

      // Add this table as a section
      sections.push({
        properties: {},
        children: [table],
      });
    }

    const doc = new Document({
      sections: sections,
    });

    const docBlob = await Packer.toBlob(doc);
    saveAs(docBlob, 'labels.docx');
  };

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-10">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-8">
        <h1 className="text-4xl font-bold text-center text-[#0a0002] mb-6">Label Maker</h1>

        {step === 1 && (
          <div className="mb-8">
            <div className="flex justify-center items-center">
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
                  Upload Excel File
                </span>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
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
              ></textarea>
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
