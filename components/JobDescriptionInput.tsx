/**
 * JobDescriptionInput Component
 * Allows user to optionally paste job description
 */

'use client';

import React, { useState } from 'react';

interface JobDescriptionInputProps {
  onJobDescriptionSubmit: (jobDescription: string) => void;
  onSkip: () => void;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  onJobDescriptionSubmit,
  onSkip,
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim()) {
      onJobDescriptionSubmit(jobDescription);
      setIsSubmitted(true);
    }
  };

  const handleSkip = () => {
    setIsSubmitted(true);
    onSkip();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Job Description (Optional)</h2>
      <p className="text-gray-600 mb-6">
        Paste the job description to help tailor the interview questions. You can skip this step if you prefer.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here... (Optional)"
          className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!jobDescription.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Submit Job Description
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Skip This Step
          </button>
        </div>
      </form>

      {isSubmitted && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✓ Job description {jobDescription.trim() ? 'added' : 'skipped'}. Ready to start!
          </p>
        </div>
      )}
    </div>
  );
};

export default JobDescriptionInput;
