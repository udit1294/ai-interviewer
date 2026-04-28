import { NextResponse } from "next/server";

export function StandardError(
  status: number, 
  message: string, 
  errorDetails?: any
) {
  // Mask 500 errors in production magically to protect infrastructure secrets
  const isProduction = process.env.NODE_ENV === "production";
  const safeMessage = (status === 500 && isProduction) 
    ? "An unexpected internal server error occurred." 
    : message;

  return NextResponse.json({
    success: false,
    error: {
      code: status,
      message: safeMessage,
      details: errorDetails || null,
    }
  }, { status });
}
