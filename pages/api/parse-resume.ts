/**
 * API Route: Parse Resume
 * Handles resume file upload and extraction of text
 * POST /api/parse-resume
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types/interview';

const formidable = require('formidable');
const { extractTextFromFile } = require('@/lib/resumeParser');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ text: string }>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const form = new formidable.IncomingForm({
      maxFileSize: 10 * 1024 * 1024, // 10MB max
    });

    const { files } = await new Promise<{ files: any }>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        else resolve({ files });
      });
    });

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
      });
    }

    // Read file from disk
    const fs = require('fs').promises;
    const fileBuffer = await fs.readFile(file.filepath);
    const mimeType = file.mimetype;
    const fileName = file.originalFilename;

    // Create File-like object for processing
    const resumeFile = new File([fileBuffer], fileName, { type: mimeType });

    // Extract text from file
    const text = await extractTextFromFile(resumeFile);

    return res.status(200).json({
      success: true,
      data: { text },
    });
  } catch (error) {
    console.error('Error parsing resume:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse resume',
    });
  }
}
