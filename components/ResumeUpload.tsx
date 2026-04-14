/**
 * ResumeUpload Component
 * Handles file upload and parsing of resume (PDF or DOCX)
 */

'use client';

import React, { useState } from 'react';
import { ParsedResume, ApiResponse } from '@/types/interview';
import Loader from './Loader';

interface ResumeUploadProps {
  onResumeLoaded: (resumeData: ParsedResume) => void;
  isLoading?: boolean;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onResumeLoaded, isLoading = false }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF or DOCX file');
      setFile(null);
      return;
    }

    // Validate file size (10MB max)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError('');
    setSuccess('');
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Step 1: Upload and extract text from resume
      const formData = new FormData();
      formData.append('file', file);

      const extractResponse = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData,
      });

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json();
        throw new Error(errorData.error || 'Failed to parse resume');
      }

      const extractData: ApiResponse<{ text: string }> = await extractResponse.json();
      if (!extractData.success || !extractData.data) {
        throw new Error('Invalid response from parse-resume');
      }

      const resumeText = extractData.data.text;

      // Step 2: Send resume text to AI for parsing
      const parseResponse = await fetch('/api/parse-resume-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });

      if (!parseResponse.ok) {
        const errorData = await parseResponse.json();
        throw new Error(errorData.error || 'Failed to parse resume data');
      }

      const parseData: ApiResponse<ParsedResume> = await parseResponse.json();
      if (!parseData.success || !parseData.data) {
        throw new Error('Invalid response from resume parsing');
      }

      setSuccess(`Resume loaded successfully! Welcome, ${parseData.data.name}!`);
      onResumeLoaded(parseData.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading || uploading) {
    return <Loader message="Processing your resume..." />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Upload Your Resume</h2>
      <p className="text-gray-600 mb-6">
        Upload your resume in PDF or DOCX format. We&apos;ll analyze it to prepare for your interview.
      </p>

      <form onSubmit={handleUpload} className="space-y-6">
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50 hover:bg-blue-100 transition">
          <label htmlFor="file-input" className="cursor-pointer">
            <svg
              className="mx-auto h-12 w-12 text-blue-500 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="text-lg font-semibold text-gray-700">
              {file ? file.name : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-gray-500">PDF or DOCX (Max 10MB)</p>
          </label>
          <input
            id="file-input"
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            ✓ {success}
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          {uploading ? 'Processing...' : 'Upload Resume'}
        </button>
      </form>
    </div>
  );
};

export default ResumeUpload;
