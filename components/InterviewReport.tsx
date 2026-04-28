/**
 * InterviewReport Component
 * Displays the final interview evaluation and report
 */

'use client';
import { logger } from "@/lib/logger";

import React, { useState } from 'react';
import { InterviewEvaluation } from '@/types/interview';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getLocalAudio } from '@/lib/storage';

interface InterviewReportProps {
  candidateName: string;
  targetRole: string;
  evaluation: InterviewEvaluation;
  onRestart?: () => void;
  recordedChunks?: Blob[];
}

const InterviewReport: React.FC<InterviewReportProps> = ({
  candidateName,
  targetRole,
  evaluation,
  onRestart,
  recordedChunks,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadRecording = async () => {
    try {
      setIsDownloading(true);
      const audioData = await getLocalAudio();
      
      if (!audioData) {
        alert('No audio recording found');
        setIsDownloading(false);
        return;
      }

      // Convert data URL to blob
      const arr = audioData.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'audio/webm';
      const bstr = atob(arr[1]);
      const n = bstr.length;
      const u8arr = new Uint8Array(n);
      
      for (let i = 0; i < n; i++) {
        u8arr[i] = bstr.charCodeAt(i);
      }
      
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-recording-${candidateName.replace(/\s+/g, '-')}-${new Date().getTime()}.webm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsDownloading(false);
    } catch (error) {
      logger.error('Error downloading recording:', error);
      alert('Failed to download recording');
      setIsDownloading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      setIsDownloading(true);

      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let yPosition = margin;

      // Helper function to add text with line wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 12) => {
        doc.setFontSize(fontSize);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + lines.length * 7;
      };

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Interview Report', margin, yPosition);
      yPosition += 15;

      // Candidate Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Candidate: ${candidateName}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Position: ${targetRole}`, margin, yPosition);
      yPosition += 7;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 15;

      // Overall Score
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Overall Score', margin, yPosition);
      yPosition += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(24);
      doc.setTextColor(evaluation.overallScore >= 7 ? 0 : evaluation.overallScore >= 5 ? 150 : 200, 0, 0);
      doc.text(`${evaluation.overallScore}/10`, margin, yPosition);
      yPosition += 15;
      doc.setTextColor(0, 0, 0);

      // Recommendation
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Recommendation: ${evaluation.recommendation}`, margin, yPosition);
      yPosition += 15;

      // Skill Scores
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Assessment Scores', margin, yPosition);
      yPosition += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      const scores = [
        { label: 'Technical Skills', score: evaluation.technicalSkillsScore },
        { label: 'Communication', score: evaluation.communicationScore },
        { label: 'Problem Solving', score: evaluation.problemSolvingScore },
        { label: 'Role Alignment', score: evaluation.roleAlignmentScore },
      ];

      scores.forEach((item) => {
        doc.text(`${item.label}: ${item.score}/10`, margin + 5, yPosition);
        yPosition += 6;
      });

      yPosition += 5;

      // Strengths
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Strengths', margin, yPosition);
      yPosition += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      evaluation.strengths.forEach((strength) => {
        yPosition = addWrappedText(`• ${strength}`, margin + 5, yPosition, pageWidth - 2 * margin - 5);
      });

      yPosition += 5;

      // Weaknesses
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Areas for Improvement', margin, yPosition);
      yPosition += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      evaluation.weaknesses.forEach((weakness) => {
        yPosition = addWrappedText(`• ${weakness}`, margin + 5, yPosition, pageWidth - 2 * margin - 5);
      });

      yPosition += 5;

      // Feedback Summary
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Feedback Summary', margin, yPosition);
      yPosition += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      yPosition = addWrappedText(evaluation.feedbackSummary, margin, yPosition, pageWidth - 2 * margin);

      // Download PDF structurally uniquely
      doc.save(`interview-report-${candidateName.replace(/\s+/g, '-')}-${Date.now()}.pdf`);
    } catch (error) {
      logger.error('Error generating PDF:', error);
      alert('Failed to download PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Interview Report</h1>
        <p className="text-gray-600">
          {candidateName} | {targetRole}
        </p>
      </div>

      {/* Overall Score Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-8 mb-8 text-center">
        <p className="text-lg font-semibold mb-2">Overall Score</p>
        <p className="text-6xl font-bold mb-2">{evaluation.overallScore}/10</p>
        <p className={`text-2xl font-bold ${evaluation.recommendation === 'Strong Hire' ? 'text-green-300' : evaluation.recommendation === 'Hire' ? 'text-yellow-300' : 'text-red-300'}`}>
          {evaluation.recommendation}
        </p>
      </div>

      {/* Assessment Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Technical Skills', score: evaluation.technicalSkillsScore },
          { label: 'Communication', score: evaluation.communicationScore },
          { label: 'Problem Solving', score: evaluation.problemSolvingScore },
          { label: 'Role Alignment', score: evaluation.roleAlignmentScore },
        ].map((item) => (
          <div key={item.label} className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
            <p className="text-gray-600 text-sm font-semibold mb-2">{item.label}</p>
            <p className={`text-3xl font-bold ${getScoreColor(item.score)}`}>{item.score}</p>
          </div>
        ))}
      </div>

      {/* Strengths */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="inline-block w-1 h-8 bg-green-600 mr-3 rounded"></span>
          Strengths
        </h2>
        <ul className="space-y-3">
          {evaluation.strengths.map((strength, index) => (
            <li key={index} className="flex items-start p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-green-600 font-bold mr-3">✓</span>
              <span className="text-gray-700">{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Weaknesses */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="inline-block w-1 h-8 bg-yellow-600 mr-3 rounded"></span>
          Areas for Improvement
        </h2>
        <ul className="space-y-3">
          {evaluation.weaknesses.map((weakness, index) => (
            <li key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-yellow-600 font-bold mr-3">⚠</span>
              <span className="text-gray-700">{weakness}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Feedback Summary */}
      <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Feedback Summary</h2>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{evaluation.feedbackSummary}</p>
      </div>

      {/* Skill Assessments */}
      {evaluation.skillAssessments && evaluation.skillAssessments.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Detailed Skill Assessment</h2>
          <div className="space-y-4">
            {evaluation.skillAssessments.map((assessment, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{assessment.category}</h3>
                  <span className={`text-lg font-bold ${getScoreColor(assessment.score)}`}>
                    {assessment.score}/10
                  </span>
                </div>
                <p className="text-gray-700 text-sm">{assessment.comments}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {evaluation.areasForImprovement && evaluation.areasForImprovement.length > 0 && (
        <div className="mb-8 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommended Next Steps</h2>
          <ol className="space-y-2 list-decimal list-inside">
            {evaluation.areasForImprovement.map((item, index) => (
              <li key={index} className="text-gray-700">
                {item}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-center flex-wrap">
        <button
          onClick={downloadPDF}
          disabled={isDownloading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition"
        >
          {isDownloading ? 'Generating PDF...' : '⬇ Download PDF Report'}
        </button>
        <button
          onClick={downloadRecording}
          disabled={isDownloading}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition"
          title="Download interview audio recording"
        >
          {isDownloading ? 'Downloading...' : '🎙️ Download Audio Recording'}
        </button>
        <button
          onClick={onRestart || (() => window.location.href = '/')}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-lg transition"
        >
          Start New Interview
        </button>
      </div>
    </div>
  );
};

export default InterviewReport;
