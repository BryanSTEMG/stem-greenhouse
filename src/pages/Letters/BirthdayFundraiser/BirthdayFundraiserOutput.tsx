// src/pages/Letters/BirthdayFundraiser/BirthdayFundraiserOutput.tsx

import React from 'react';
import { saveAs } from 'file-saver';
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  LineRuleType,
  UnderlineType,
  convertInchesToTwip,
} from 'docx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
// IMPORTANT: Use the same FormData interface from your BirthdayFundraiserForm
import { FormData } from './BirthdayFundraiserForm';

// Set up pdfmake fonts
const maybePdfMakeObj = (pdfFonts as any).pdfMake;
const maybeVfsObj = (pdfFonts as any).vfs;
const actualVfs = maybePdfMakeObj?.vfs || maybeVfsObj;
(pdfMake as any).vfs = actualVfs || {};

interface BirthdayFundraiserOutputProps {
  formData: FormData;
}

const BirthdayFundraiserOutput: React.FC<BirthdayFundraiserOutputProps> = ({ formData }) => {
  const {
    letterDate,
    donorFullName,
    donorEmail,
    donorAddress,
    donorFirstName,
    donationAmount,
    donationHonor,
    receiptDate,
    receiptAmount,
  } = formData;

  // Helper to convert pt to half-points (docx uses half-points)
  const ptToHalfPoints = (pt: number) => pt * 2;

  // --------------- Generate DOCX Document ---------------
  const generateWordDoc = () => {
    // Create paragraphs that match your known-good template
    const paragraphs = [
      // [DATE] (Font 11)
      new Paragraph({
        spacing: {
          after: ptToHalfPoints(10), // 10pt after
        },
        children: [
          new TextRun({
            text: letterDate,
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
        ],
      }),

      // Three empty paragraphs (gaps) after the date
      new Paragraph({ children: [] }),
      new Paragraph({ children: [] }),
      new Paragraph({ children: [] }),

      // [DONOR FULL NAME] (Font 11)
      new Paragraph({
        children: [
          new TextRun({
            text: donorFullName,
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
        ],
      }),

      // [DONOR EMAIL] (Font 11)
      new Paragraph({
        children: [
          new TextRun({
            text: donorEmail,
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
        ],
      }),

      // [DONOR ADDRESS] (Font 11)
      new Paragraph({
        children: [
          new TextRun({
            text: donorAddress,
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
        ],
      }),

      // Four empty paragraphs (gaps) after the donor address
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),

      // "Dear [DONOR FIRST NAME]," (Font 11)
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [
          new TextRun({
            text: 'Dear ',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
          new TextRun({
            text: donorFirstName,
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
          new TextRun({
            text: ',',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
        ],
      }),

      // Extra gap after "Dear ..." paragraph
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),

      // First content paragraph (Font 11)
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [
          new TextRun({
            text: 'On behalf of STEM Greenhouse, thank you for your generous donation of $',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
          new TextRun({
            text: donationAmount,
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
          new TextRun({
            text: ' in honor of ',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
          new TextRun({
            text: donationHonor,
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
          new TextRun({
            text: '. Your support through this special birthday fundraiser helps us expand access to quality STEM education and prepare youth in our community–especially those historically excluded from opportunity–for careers in science, technology, engineering, and math. ',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
        ],
      }),

      // Extra gap after first content paragraph
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),

      // Second content paragraph (Font 11)
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [
          new TextRun({
            text: 'Contributions like yours make a meaningful difference, strengthening our ability to grow programs, reach more students, and ',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
          new TextRun({
            text: 'create',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
          new TextRun({
            text: ' lasting opportunities. To follow the impact of your gift, we invite you to join our email list at stemgreenhouse.org. If you have any questions or would like to learn more about our work, we’d love to connect.',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
        ],
      }),

      // Extra gap after second content paragraph
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),

      // Third content paragraph (Font 11)
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [
          new TextRun({
            text: 'Thank you again for celebrating',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
          new TextRun({
            text: donationHonor,
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
          new TextRun({
            text: ' in such a meaningful way that uplifts education. We are truly grateful for your support.',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
        ],
      }),

      // Three gaps after third content paragraph
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),

      // "With appreciation," (Font 11)
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [
          new TextRun({
            text: 'With appreciation,',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
        ],
      }),

      // Three gaps after "With appreciation,"
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),
      new Paragraph({
        spacing: {
          before: ptToHalfPoints(12),
          after: ptToHalfPoints(12),
        },
        children: [],
      }),

      // Keli Christopher, Ph.D. (Font 11, single line spacing)
      new Paragraph({
        spacing: {
          line: 240,
        },
        children: [
          new TextRun({
            text: 'Keli Christopher, Ph.D.',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
        ],
      }),

      // Founder and Chief Executive Officer (Font 11)
      new Paragraph({
        spacing: {
          line: 240,
        },
        children: [
          new TextRun({
            text: 'Founder and Chief Executive Officer',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
        ],
      }),

      // STEM Greenhouse (Font 11)
      new Paragraph({
        spacing: {
          line: 240,
        },
        children: [
          new TextRun({
            text: 'STEM Greenhouse ',
            font: 'PT Sans',
            size: ptToHalfPoints(11),
          }),
        ],
      }),

      // Four empty paragraphs before Receipt section
      new Paragraph({ spacing: { line: 240 }, children: [] }),
      new Paragraph({ spacing: { line: 240 }, children: [] }),
      new Paragraph({ spacing: { line: 240 }, children: [] }),
      new Paragraph({ spacing: { line: 240 }, children: [] }),

      // Receipt Information for Tax Purposes (Font 9)
      new Paragraph({
        spacing: { line: 240 },
        children: [
          new TextRun({
            text: 'Receipt Information for Tax Purposes',
            font: 'PT Sans',
            size: ptToHalfPoints(9),
            underline: {},
          }),
        ],
      }),

      // 501(c)(3) statement (Font 9)
      new Paragraph({
        spacing: { line: 240 },
        children: [
          new TextRun({
            text: 'STEM Greenhouse is a recognized 501(c)(3) nonprofit organization.',
            font: 'PT Sans',
            size: ptToHalfPoints(9),
          }),
        ],
      }),

      // EIN (Font 9)
      new Paragraph({
        spacing: { line: 240 },
        children: [
          new TextRun({
            text: 'EIN: 32-0454196',
            font: 'PT Sans',
            size: ptToHalfPoints(9),
          }),
        ],
      }),

      // Tax deductible statement (Font 9)
      new Paragraph({
        spacing: { line: 240 },
        children: [
          new TextRun({
            text: 'Your contribution is tax-deductible to the extent allowed by law. No goods or services were provided in exchange for your donation. Please retain this letter as your receipt for tax purposes.',
            font: 'PT Sans',
            size: ptToHalfPoints(9),
          }),
        ],
      }),

      // Date of Donation (Font 9)
      new Paragraph({
        spacing: { line: 240 },
        children: [
          new TextRun({
            text: 'Date of Donation: ',
            font: 'PT Sans',
            size: ptToHalfPoints(9),
            bold: true,
          }),
          new TextRun({
            text: receiptDate,
            font: 'PT Sans',
            size: ptToHalfPoints(9),
          }),
        ],
      }),

      // Donation Amount (Font 9)
      new Paragraph({
        spacing: { line: 240 },
        children: [
          new TextRun({
            text: 'Donation Amount: ',
            font: 'PT Sans',
            size: ptToHalfPoints(9),
            bold: true,
          }),
          new TextRun({
            text: receiptAmount,
            font: 'PT Sans',
            size: ptToHalfPoints(9),
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
                width: convertInchesToTwip(8.5),
                height: convertInchesToTwip(11),
              },
              margin: {
                left: convertInchesToTwip(1),
                right: convertInchesToTwip(1),
                top: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1),
              },
            },
          },
          children: paragraphs,
        },
      ],
    });

    // Build and save the docx
    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'donation_letter.docx');
    });
  };

  // --------------- Generate PDF Document ---------------
  const generatePdf = () => {
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'LETTER',
      pageMargins: [72, 72, 72, 72], // 1 inch margins
      content: [
        // [DATE]
        {
          text: letterDate,
          font: 'PT Sans',
          fontSize: 11,
          margin: [0, 0, 0, 10],
        },
        // Empty space
        { text: '', margin: [0, 0, 0, 0] },

        // Donor info
        {
          text: donorFullName,
          font: 'PT Sans',
          fontSize: 11,
        },
        {
          text: donorEmail,
          font: 'PT Sans',
          fontSize: 11,
        },
        {
          text: donorAddress,
          font: 'PT Sans',
          fontSize: 11,
          margin: [0, 0, 0, 12],
        },

        // Dear [DONOR FIRST NAME],
        {
          text: [
            { text: 'Dear ', font: 'PT Sans' },
            { text: donorFirstName, font: 'PT Sans' },
            { text: ',', font: 'PT Sans' },
          ],
          font: 'PT Sans',
          fontSize: 11,
          margin: [0, 12, 0, 12],
        },

        // Extra gap after "Dear ..." paragraph
        { text: '', margin: [0, 12, 0, 12] },

        // First content paragraph
        {
          text: [
            { text: 'On behalf of STEM Greenhouse, thank you for your generous donation of $', font: 'PT Sans' },
            { text: donationAmount, font: 'PT Sans' },
            { text: ' in honor of ', font: 'PT Sans' },
            { text: donationHonor, font: 'PT Sans' },
            { text: '. Your support through this special birthday fundraiser helps us expand access to quality STEM education and prepare youth in our community–especially those historically excluded from opportunity–for careers in science, technology, engineering, and math. ', font: 'PT Sans' },
          ],
          fontSize: 11,
          margin: [0, 12, 0, 12],
        },

        // Extra gap after first content paragraph
        { text: '', margin: [0, 12, 0, 12] },

        // Second content paragraph
        {
          text: [
            { text: 'Contributions like yours make a meaningful difference, strengthening our ability to grow programs, reach more students, and ', font: 'PT Sans' },
            { text: 'create', font: 'PT Sans' },
            { text: ' lasting opportunities. To follow the impact of your gift, we invite you to join our email list at stemgreenhouse.org. If you have any questions or would like to learn more about our work, we’d love to connect.', font: 'PT Sans' },
          ],
          fontSize: 11,
          margin: [0, 12, 0, 12],
        },

        // Extra gap after second content paragraph
        { text: '', margin: [0, 12, 0, 12] },

        // Third content paragraph
        {
          text: [
            { text: 'Thank you again for celebrating ', font: 'PT Sans' },
            { text: donationHonor, font: 'PT Sans' },
            { text: ' in such a meaningful way that uplifts education. We are truly grateful for your support.', font: 'PT Sans' },
          ],
          fontSize: 11,
          margin: [0, 12, 0, 12],
        },

        // Three gaps after third content paragraph
        { text: '', margin: [0, 12, 0, 12] },
        { text: '', margin: [0, 12, 0, 12] },
        { text: '', margin: [0, 12, 0, 12] },

        // With appreciation,
        {
          text: 'With appreciation,',
          font: 'PT Sans',
          fontSize: 11,
          margin: [0, 12, 0, 12],
        },

        // Three gaps after "With appreciation,"
        { text: '', margin: [0, 12, 0, 12] },
        { text: '', margin: [0, 12, 0, 12] },
        { text: '', margin: [0, 12, 0, 12] },

        // Signature block
        {
          text: 'Keli Christopher, Ph.D.',
          font: 'PT Sans',
          fontSize: 11,
          lineHeight: 1,
        },
        {
          text: 'Founder and Chief Executive Officer',
          font: 'PT Sans',
          fontSize: 11,
          lineHeight: 1,
        },
        {
          text: 'STEM Greenhouse',
          font: 'PT Sans',
          fontSize: 11,
          lineHeight: 1,
          margin: [0, 0, 0, 48],
        },

        // Receipt section (Font 9)
        {
          text: 'Receipt Information for Tax Purposes',
          font: 'PT Sans',
          fontSize: 9,
          decoration: 'underline',
          margin: [0, 0, 0, 5],
        },
        {
          text: [
            'STEM Greenhouse is a recognized 501(c)(3) nonprofit organization.\n',
            'EIN: 32-0454196\n',
            'Your contribution is tax-deductible to the extent allowed by law. No goods or services were provided in exchange for your donation. Please retain this letter as your receipt for tax purposes.',
          ],
          font: 'PT Sans',
          fontSize: 9,
          margin: [0, 0, 0, 10],
        },
        {
          text: [
            { text: 'Date of Donation: ', bold: true },
            { text: receiptDate },
          ],
          fontSize: 9,
          margin: [0, 0, 0, 5],
        },
        {
          text: [
            { text: 'Donation Amount: ', bold: true },
            { text: receiptAmount },
          ],
          fontSize: 9,
        },
      ],
      defaultStyle: {
        font: 'PT Sans',
      },
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);
    pdfDocGenerator.download('donation_letter.pdf');
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <button
        onClick={generateWordDoc}
        style={{ marginRight: '10px', padding: '8px 16px' }}
      >
        Download Word Document
      </button>
      <button onClick={generatePdf} style={{ padding: '8px 16px' }}>
        Download PDF
      </button>
    </div>
  );
};

export default BirthdayFundraiserOutput;
