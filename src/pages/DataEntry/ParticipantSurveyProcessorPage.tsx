// src/pages/DataEntry/ParticipantSurveyProcessorPage.tsx
// FULL CODE

import React, { useState } from 'react';
import axios from 'axios';

interface ISurveyResult {
  // If your Lambda only returns Q1..Q6, keep it minimal:
  questionResponses: { [key: string]: string };
  error?: string;

  // Or if you still have name/birthdate etc. from the old code, that's optional:
  name?: string;
  birthdate?: string;
  school?: string;
  grade?: string;
  multipleChoiceResponses?: { [key: string]: string };
}

function ParticipantSurveyProcessorPage() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<ISurveyResult[]>([]);
  const [excelData, setExcelData] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(event.target.files);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select at least one file.');
      return;
    }

    setUploading(true);
    setErrorMessage('');
    setResults([]);
    setExcelData(null);

    try {
      // Convert each file to base64
      const filesBase64: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const base64 = await fileToBase64(file);
        filesBase64.push(base64);
      }

      // Replace with your actual AWS Lambda endpoint
      const API_ENDPOINT = 'https://u7ad5gtigkf4q4izsv4j674nda0ihzec.lambda-url.us-east-2.on.aws/';

      const response = await axios.post(API_ENDPOINT, {
        images: filesBase64,
      });

      if (response.data && response.data.data) {
        setResults(response.data.data);
      }
      if (response.data && response.data.excelBase64) {
        setExcelData(response.data.excelBase64);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setErrorMessage(error?.response?.data?.message || 'An error occurred during processing.');
    } finally {
      setUploading(false);
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove "data:application/pdf;base64," or "data:image/*;base64," prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleDownloadExcel = () => {
    if (!excelData) return;
    const byteCharacters = atob(excelData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'SurveyResults.xlsx';
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Participant Survey Processor</h2>
      <p>Select scanned survey files (PDF or images), then click &quot;Process Surveys&quot;.</p>

      <input type="file" multiple accept=".pdf,image/*" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Processing...' : 'Process Surveys'}
      </button>

      {errorMessage && <p style={{ color: 'red' }}>Error: {errorMessage}</p>}

      {results.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3>Survey Results</h3>
          <table border={1} cellPadding={5} style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {/* If you just have Q1..Q6 */}
                <th>Q1</th>
                <th>Q2</th>
                <th>Q3</th>
                <th>Q4</th>
                <th>Q5</th>
                <th>Q6</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res, idx) => (
                <tr key={idx}>
                  <td>{res.questionResponses?.['Q1'] || ''}</td>
                  <td>{res.questionResponses?.['Q2'] || ''}</td>
                  <td>{res.questionResponses?.['Q3'] || ''}</td>
                  <td>{res.questionResponses?.['Q4'] || ''}</td>
                  <td>{res.questionResponses?.['Q5'] || ''}</td>
                  <td>{res.questionResponses?.['Q6'] || ''}</td>
                  <td>{res.error || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {excelData && (
            <div style={{ marginTop: '1rem' }}>
              <button onClick={handleDownloadExcel}>Download Excel</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ParticipantSurveyProcessorPage;
