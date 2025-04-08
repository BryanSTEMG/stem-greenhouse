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
  AlignmentType,
} from 'docx';
import { JobAcceptanceFormData } from './JobAcceptanceForm';
import { headerImageBase64, footerImageBase64, tableImageBase64 } from '../imageData';

interface JobAcceptLetterOutputProps {
  formData: JobAcceptanceFormData;
}

const JobAcceptLetterOutput: React.FC<JobAcceptLetterOutputProps> = ({ formData }) => {
  // docx uses half-points
  const ptToHalfPt = (pt: number) => pt * 2;

  // Minimal date formatting: "Mon DD, YYYY" (with comma)
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    let formatted = d.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    // Insert comma if missing
    if (!formatted.includes(',')) {
      const parts = formatted.split(' ');
      if (parts.length === 3) {
        formatted = `${parts[0]} ${parts[1]}, ${parts[2]}`;
      }
    }
    return formatted;
  };

  const generateDoc = () => {
    const startDateFormatted = formatDate(formData.startDate);

    // Title line
    const pTitle = new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: ptToHalfPt(12) },
      children: [
        new TextRun({
          text: 'STEM GREENHOUSE JOB OFFER ACCEPTANCE FORM',
          bold: true,
          font: 'Oswald',
          size: ptToHalfPt(12),
        }),
      ],
    });

    // Next lines
    const pName = new Paragraph({
      spacing: { after: ptToHalfPt(10) },
      children: [
        new TextRun({ text: 'Name: ', bold: true, font: 'PT Sans', size: ptToHalfPt(11) }),
        new TextRun({ text: formData.candidateName, font: 'PT Sans', size: ptToHalfPt(11) }),
      ],
    });

    const pPosition = new Paragraph({
      spacing: { after: ptToHalfPt(10) },
      children: [
        new TextRun({ text: 'Position: ', bold: true, font: 'PT Sans', size: ptToHalfPt(11) }),
        new TextRun({ text: formData.jobTitle, font: 'PT Sans', size: ptToHalfPt(11) }),
      ],
    });

    const pStartDate = new Paragraph({
      spacing: { after: ptToHalfPt(10) },
      children: [
        new TextRun({ text: 'Start Date: ', bold: true, font: 'PT Sans', size: ptToHalfPt(11) }),
        new TextRun({ text: startDateFormatted, font: 'PT Sans', size: ptToHalfPt(11) }),
      ],
    });

    const pSalary = new Paragraph({
      spacing: { after: ptToHalfPt(10) },
      children: [
        new TextRun({ text: 'Salary: ', bold: true, font: 'PT Sans', size: ptToHalfPt(11) }),
        new TextRun({
          text: `${formData.salary} per ${formData.payPeriod}`,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    });

    const pTerms = new Paragraph({
      spacing: { after: ptToHalfPt(10) },
      children: [
        new TextRun({
          text: 'Employment Terms: ',
          bold: true,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
        new TextRun({
          text: 'At-will employment, consistent with applicable laws.',
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    });

    const pAckHeader = new Paragraph({
      spacing: { after: ptToHalfPt(10) },
      children: [
        new TextRun({
          text: 'Acknowledgment & Acceptance',
          bold: true,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    });

    // Indent paragraphs options
    const fullIndentOptions = { left: 720 };

    const pParagraph1 = new Paragraph({
      indent: fullIndentOptions,
      children: [
        new TextRun({
          text:
            `By signing below, I acknowledge that I have read and understand the terms of this offer. ` +
            `I accept the position of ${formData.jobTitle} at STEM Greenhouse under the conditions outlined in my offer letter.`,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    });

    const pGap1 = new Paragraph({});
    const pGap2 = new Paragraph({});

    const pParagraph2 = new Paragraph({
      indent: fullIndentOptions,
      children: [
        new TextRun({
          text:
            `I acknowledge that my employment is contingent upon successfully completing all required pre-employment screenings, including a background check. ` +
            `I confirm that I meet all legal requirements to work with children and, if applicable, to volunteer within Grand Rapids Public Schools (GRPS).`,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    });

    const pGap3 = new Paragraph({});
    const pGap4 = new Paragraph({});

    const pParagraph3 = new Paragraph({
      indent: fullIndentOptions,
      children: [
        new TextRun({
          text:
            `I understand that my employment is at-will, meaning either I or STEM Greenhouse may end the employment relationship ` +
            `at any time, consistent with applicable laws.`,
          font: 'PT Sans',
          size: ptToHalfPt(11),
        }),
      ],
    });

    const pGap5 = new Paragraph({});
    const pGap6 = new Paragraph({});
    const pGap7 = new Paragraph({});

    // Insert the table image, sized at 6" wide x 1.5" tall, aligned right
    // docx uses raw pixel values, approximately 96px per inch => 576 wide, 144 tall
    const tableImageParagraph = new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new ImageRun({
          data: tableImageBase64,
          transformation: { width: 576, height: 144 },
        } as any),
      ],
    });

    const paragraphsArray = [
      pTitle,
      pName,
      pPosition,
      pStartDate,
      pSalary,
      pTerms,
      pAckHeader,
      pParagraph1,
      pGap1,
      pGap2,
      pParagraph2,
      pGap3,
      pGap4,
      pParagraph3,
      pGap5,
      pGap6,
      pGap7,
      tableImageParagraph,
    ];

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
          children: paragraphsArray,
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'job_acceptance_form.docx');
    });
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <button
        onClick={generateDoc}
        className="px-6 py-2 bg-[#83b786] text-white font-semibold rounded-md hover:bg-[#72a376] transition-colors duration-200"
      >
        Download Acceptance Form
      </button>
    </div>
  );
};

export default JobAcceptLetterOutput;
