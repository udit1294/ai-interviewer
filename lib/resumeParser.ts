/**
 * Resume Parser Utilities
 * Handles parsing PDF and DOCX files, and extracting text
 */

import { ParsedResume } from '@/types/interview';

/**
 * Extract text from a file (PDF or DOCX)
 * For PDF: uses pdf-parse library
 * For DOCX: uses mammoth library
 * 
 * This function is called from the API route which handles the file upload
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    return await extractTextFromPDF(file);
  } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
    return await extractTextFromDOCX(file);
  } else {
    throw new Error('Unsupported file format. Please upload PDF or DOCX files.');
  }
}

/**
 * Extract text from PDF file
 * Uses the pdf-parse library in Node.js environment
 */
async function extractTextFromPDF(file: File): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('PDF parsing must be done on the server');
  }

  try {
    const buffer = await file.arrayBuffer();
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

/**
 * Extract text from DOCX file
 * Uses the mammoth library
 */
async function extractTextFromDOCX(file: File): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('DOCX parsing must be done on the server');
  }

  try {
    const buffer = await file.arrayBuffer();
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

/**
 * Validate parsed resume structure
 * Ensures all required fields are present and properly typed
 */
export function validateParsedResume(resume: any): resume is ParsedResume {
  return (
    typeof resume === 'object' &&
    resume !== null &&
    typeof resume.name === 'string' &&
    Array.isArray(resume.skills) &&
    Array.isArray(resume.workExperience) &&
    Array.isArray(resume.projects) &&
    Array.isArray(resume.education) &&
    typeof resume.yearsOfExperience === 'number'
  );
}

/**
 * Sanitize and normalize parsed resume data
 */
export function normalizeParsedResume(resume: any): ParsedResume {
  return {
    name: String(resume.name || 'Unknown').trim(),
    email: resume.email ? String(resume.email).trim() : undefined,
    phone: resume.phone ? String(resume.phone).trim() : undefined,
    location: resume.location ? String(resume.location).trim() : undefined,
    skills: Array.isArray(resume.skills)
      ? resume.skills.map((s: any) => String(s).trim()).filter((s: string) => s)
      : [],
    yearsOfExperience: Math.max(0, Number(resume.yearsOfExperience) || 0),
    workExperience: Array.isArray(resume.workExperience)
      ? resume.workExperience.map((w: any) => ({
          company: String(w.company || '').trim(),
          role: String(w.role || '').trim(),
          duration: String(w.duration || '').trim(),
          responsibilities: Array.isArray(w.responsibilities)
            ? w.responsibilities.map((r: any) => String(r).trim()).filter((r: string) => r)
            : [],
        }))
      : [],
    projects: Array.isArray(resume.projects)
      ? resume.projects.map((p: any) => ({
          name: String(p.name || '').trim(),
          description: String(p.description || '').trim(),
          technologies: Array.isArray(p.technologies)
            ? p.technologies.map((t: any) => String(t).trim()).filter((t: string) => t)
            : [],
        }))
      : [],
    education: Array.isArray(resume.education)
      ? resume.education.map((e: any) => ({
          institution: String(e.institution || '').trim(),
          degree: String(e.degree || '').trim(),
          field: String(e.field || '').trim(),
          graduationYear: e.graduationYear ? String(e.graduationYear).trim() : undefined,
        }))
      : [],
    certifications: Array.isArray(resume.certifications)
      ? resume.certifications.map((c: any) => String(c).trim()).filter((c: string) => c)
      : [],
  };
}

export default {
  extractTextFromFile,
  validateParsedResume,
  normalizeParsedResume,
};
