import React from 'react';
import { saveAs } from 'file-saver';
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  Header,
  Footer,
  ImageRun,
} from 'docx';
import { NewHireFormData } from './NewHireForm';
import { headerImageBase64, footerImageBase64 } from '../imageData';

interface NewHireOutputProps {
  formData: NewHireFormData;
}

/** Convert points to half-points (used by the docx library). */
const ptToHalfPt = (pt: number) => pt * 2;

/**
 * Format date to "Mon DD, YYYY" ensuring a comma after the day if missing.
 */
const formatLetterDate = (rawDateStr: string): string => {
  const parsed = new Date(rawDateStr);
  if (isNaN(parsed.getTime())) return rawDateStr;

  let formatted = parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  if (!formatted.includes(',')) {
    const parts = formatted.split(' ');
    if (parts.length === 3) {
      formatted = `${parts[0]} ${parts[1]}, ${parts[2]}`;
    }
  }
  return formatted;
};

/** Sanitize a candidate name for safe file naming. */
const sanitizeFilename = (name: string): string => {
  return name.trim() === '' ? 'unknown' : name.replace(/[^a-z0-9]/gi, '_');
};

const NewHireOutput: React.FC<NewHireOutputProps> = ({ formData }) => {
  const generateDoc = async () => {
    // Format relevant dates
    const letterDateStr = formatLetterDate(formData.date);
    const responseDeadlineStr = formatLetterDate(formData.responseDeadline);

    // City, state, zip block
    const addressBlock = `${formData.city}, ${formData.state} ${formData.zip}`;

    // Build paragraphs for the letter
    const paragraphs = [
      // Empty line before date
      new Paragraph({}),

      // Offer date (right-aligned)
      new Paragraph({
        alignment: 'right',
        spacing: { after: ptToHalfPt(10) },
        children: [
          new TextRun({
            text: letterDateStr,
            font: 'PT Sans',
            size: ptToHalfPt(11),
          }),
        ],
      }),

      // Candidate info
      new Paragraph({
        children: [
          new TextRun({
            text: formData.candidateName,
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: formData.candidateAddress,
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: addressBlock,
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),

      // Gap
      new Paragraph({}),

      // Greeting
      new Paragraph({
        children: [
          new TextRun({
            text: `Dear ${formData.candidateName},`,
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),

      new Paragraph({}), // gap after greeting

      // Paragraph 1: Offer introduction
      new Paragraph({
        spacing: { after: ptToHalfPt(10) },
        children: [
          new TextRun({
            text:
              `We are excited to offer you the position of ${formData.jobTitle} at STEM Greenhouse! ` +
              `Your skills, experience, and dedication align with our mission, and we look forward ` +
              `to the impact you will make.`,
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),

      new Paragraph({}), // gap

      // Paragraph 2: Employment details
      new Paragraph({
        spacing: { after: ptToHalfPt(10) },
        children: [
          new TextRun({
            text:
              `This role is a ${formData.employmentType} position and reports to ${formData.supervisorName}, ` +
              `with a start date of ${formatLetterDate(formData.startDate)}. ` +
              `Your starting salary will be ${formData.salary} per ${formData.payPeriod} ` +
              `with an expectation of ${formData.weeklyHours} hours per week.`,
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),

      new Paragraph({}), // gap

      // Paragraph 3: Bold "equity, inclusion, and belonging"
      new Paragraph({
        spacing: { after: ptToHalfPt(10) },
        children: [
          new TextRun({
            text: 'At STEM Greenhouse, we are committed to ',
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
          new TextRun({
            text: 'equity, inclusion, and belonging',
            font: 'PT Sans',
            bold: true,
            size: ptToHalfPt(10),
          }),
          new TextRun({
            text:
              ' in every aspect of our work. We know that diverse experiences and perspectives strengthen our team ' +
              'and fuel meaningful change. You are joining a workplace where your contributions are valued and ' +
              'your well-being matters.',
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),

      new Paragraph({}), // gap

      // Paragraph 4: Offer contingencies
      new Paragraph({
        spacing: { after: ptToHalfPt(10) },
        children: [
          new TextRun({
            text:
              'This offer is contingent upon the successful completion of a background check and confirmation ' +
              'that you meet all legal requirements to work with children. Some roles may also require eligibility ' +
              'to volunteer within Grand Rapids Public Schools (GRPS). Additional pre-employment screenings may be ' +
              'required. If any concerns arise, we will discuss them with you before making a final determination.',
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),

      new Paragraph({}), // gap

      // Paragraph 5: At-will statement
      new Paragraph({
        spacing: { after: ptToHalfPt(10) },
        children: [
          new TextRun({
            text:
              'Additionally, employment at STEM Greenhouse is at-will, meaning either party may end the relationship ' +
              'at any time, in accordance with applicable laws.',
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),

      new Paragraph({}), // gap

      // Paragraph 6: Acceptance instructions
      new Paragraph({
        spacing: { after: ptToHalfPt(10) },
        children: [
          new TextRun({
            text: 'To accept this offer, please review and return the signed acceptance form by ',
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
          new TextRun({
            text: formatLetterDate(formData.responseDeadline),
            font: 'PT Sans',
            bold: true,
            size: ptToHalfPt(10),
          }),
          new TextRun({
            text: '. If you have any questions, please don’t hesitate to reach out at info@stemgreenhouse.org.',
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),

      new Paragraph({}), // gap

      // Paragraph 7: Welcoming statement
      new Paragraph({
        spacing: { after: ptToHalfPt(10) },
        children: [
          new TextRun({
            text: 'We can’t wait to welcome you to the team!',
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),

      new Paragraph({}), // gap
      new Paragraph({
        children: [
          new TextRun({
            text: 'Best,',
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),

      // Four gaps
      new Paragraph({}),
      new Paragraph({}),
      new Paragraph({}),
      new Paragraph({}),

      // Signature block
      new Paragraph({
        children: [
          new TextRun({
            text: 'Dr. Keli Christopher',
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Founder and CEO',
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'STEM Greenhouse',
            font: 'PT Sans',
            size: ptToHalfPt(10),
          }),
        ],
      }),
    ];

    // Build the DOCX with header/footer images.
    const doc = new DocxDocument({
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: headerImageBase64,
                      transformation: { width: 600, height: 150 },
                    } as any),
                  ],
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: footerImageBase64,
                      transformation: { width: 600, height: 150 },
                    } as any),
                  ],
                }),
              ],
            }),
          },
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

    // Convert the DOCX to a Blob
    const docxBlob = await Packer.toBlob(doc);

    // Sanitize the candidate's name to create a meaningful file name.
    const sanitizedCandidateName = sanitizeFilename(formData.candidateName);
    const fileName = `New_Hire_Offer_${sanitizedCandidateName}.docx`;

    // Download the DOCX directly.
    saveAs(docxBlob, fileName);
  };

  return (
    <div>
      <button
        onClick={generateDoc}
        className="px-6 py-2 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
      >
        Download Offer Letter
      </button>
    </div>
  );
};

export default NewHireOutput;
