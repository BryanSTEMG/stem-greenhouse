import React from 'react';
import { saveAs } from 'file-saver';
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { DonorLetterFormData } from './DonorLetterForm';

interface DonorLetterOutputProps {
  formData: DonorLetterFormData;
}

const DonorLetterOutput: React.FC<DonorLetterOutputProps> = ({ formData }) => {
  // Convert normal points to half-points (docx uses half-points).
  const ptToHalfPt = (pt: number) => pt * 2;

  // Format a date string into "Mon DD, YYYY"
  const formatLetterDate = (rawDateStr: string): string => {
    const parsed = new Date(rawDateStr);
    if (isNaN(parsed.getTime())) return rawDateStr;
    return parsed.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const generateWordDoc = () => {
    const letterDateStr = formatLetterDate(formData.letterDate);
    const donationDateStr = formatLetterDate(formData.donationDate);
    const addressBlock = `${formData.city}, ${formData.state} ${formData.zip}`;

    const paragraphs = [
      // 5 gaps before the date
      new Paragraph({}),
      new Paragraph({}),
      new Paragraph({}),
      new Paragraph({}),
      new Paragraph({}),

      // Date paragraph
      new Paragraph({
        spacing: { after: ptToHalfPt(10) },
        children: [
          new TextRun({
            text: letterDateStr,
            font: 'PT Sans',
            size: ptToHalfPt(11),
          }),
        ],
      }),

      // 3 gaps after the date
      new Paragraph({}),
      new Paragraph({}),
      new Paragraph({}),

      // Donor Name(s)
      new Paragraph({
        children: [
          new TextRun({
            text: formData.donorName,
            font: 'PT Sans',
            size: ptToHalfPt(11),
          }),
        ],
      }),

      // Street Address
      new Paragraph({
        children: [
          new TextRun({
            text: formData.address,
            font: 'PT Sans',
            size: ptToHalfPt(11),
          }),
        ],
      }),

      // City, State, ZIP
      new Paragraph({
        children: [
          new TextRun({
            text: addressBlock,
            font: 'PT Sans',
            size: ptToHalfPt(11),
          }),
        ],
      }),

      // 3 gaps
      new Paragraph({}),
      new Paragraph({}),
      new Paragraph({}),

      // Greeting
      new Paragraph({
        children: [
          new TextRun({
            text: `Dear ${formData.donorName},`,
            font: 'PT Sans',
            size: ptToHalfPt(11),
          }),
        ],
      }),

      // 1 gap
      new Paragraph({}),

      // Main content paragraph
      new Paragraph({
        spacing: { after: ptToHalfPt(10) },
        children: [
          new TextRun({
            text:
              `The STEM Greenhouse thanks you for your generous gift of $${formData.donationAmount} ` +
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

      // 3 gaps
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

      // 6 gaps after "Sincerely,"
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

      // 5 gaps after the signature block
      new Paragraph({}),
      new Paragraph({}),
      new Paragraph({}),
      new Paragraph({}),
      new Paragraph({}),

      // Receipt info (Font 9)
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

      // Donation Date
      new Paragraph({
        children: [
          new TextRun({
            text: `Date: ${formData.donationDate}`,
            font: 'PT Sans',
            size: ptToHalfPt(9),
            color: '222222',
          }),
        ],
      }),

      // Donation Amount
      new Paragraph({
        children: [
          new TextRun({
            text: `Amount: $${formData.donationAmount}`,
            font: 'PT Sans',
            size: ptToHalfPt(9),
            color: '222222',
          }),
        ],
      }),
    ];

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

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'donation_letter.docx');
    });
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <button onClick={generateWordDoc}>
        Download Word Document
      </button>
    </div>
  );
};

export default DonorLetterOutput;
