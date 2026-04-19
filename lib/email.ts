import { Resend } from 'resend';

// Only load natively natively safely if key physically exists 
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface EmailPayload {
  toEmail: string;
  candidateName: string;
  role: string;
  score: number;
  feedbackSummary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  dashboardLink: string;
}

export async function sendInterviewCompleteEmail(payload: EmailPayload) {
  if (!resend) {
    console.warn("⚠️ RESEND_API_KEY is missing from Environment Variables. Skipping isolated email module dispatch.");
    return;
  }

  const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
        </style>
      </head>
      <body>
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
             <h1 style="color: #111827; margin: 0;">AI Interviewer Results 🚀</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; padding-top: 20px;">Hi <strong>${payload.candidateName}</strong>,</p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Your AI Interview evaluation for the <strong><span style="color: #3b82f6;">${payload.role}</span></strong> position has successfully completed! Here is your strategic improvement plan:</p>
          
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
             <p style="margin: 0; color: #60a5fa; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Overall Score</p>
             <p style="font-size: 56px; font-weight: bold; color: #2563eb; margin: 10px 0;">${payload.score}/10</p>
          </div>

          <h3 style="color: #1f2937; margin-top: 30px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">🌟 Key Strengths</h3>
          <ul style="color: #4b5563; font-size: 15px; line-height: 1.7;">
            ${payload.strengths.map(s => `<li style="margin-bottom: 8px;">${s}</li>`).join('')}
          </ul>

          <h3 style="color: #1f2937; margin-top: 30px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">📈 Areas to Improve</h3>
          <ul style="color: #4b5563; font-size: 15px; line-height: 1.7;">
            ${payload.weaknesses.map(w => `<li style="margin-bottom: 8px;">${w}</li>`).join('')}
          </ul>

          <h3 style="color: #1f2937; margin-top: 30px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">🎯 Suggested Next Steps</h3>
          <ul style="color: #4b5563; font-size: 15px; line-height: 1.7; background: #f8fafc; padding: 20px 20px 20px 40px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            ${payload.recommendations.map(r => `<li style="margin-bottom: 8px;">${r}</li>`).join('')}
          </ul>

          <h3 style="color: #1f2937; margin-top: 30px; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">Executive Summary</h3>
          <p style="color: #4b5563; font-size: 15px; line-height: 1.7; background: #f3f4f6; padding: 20px; border-radius: 8px;">
             ${payload.feedbackSummary}
          </p>

          <div style="text-align: center; margin-top: 40px;">
             <a href="${payload.dashboardLink}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; transition: all 0.2s ease;">Review Full Dashboard Metrics</a>
          </div>
          
          <p style="text-align: center; color: #9ca3af; font-size: 13px; margin-top: 40px; font-style: italic;">Powered autonomously by your AI Interviewer.</p>
        </div>
      </body>
      </html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Interviewer <onboarding@resend.dev>',
      to: payload.toEmail,
      subject: `Your Interview Feedback + Improvement Plan 🚀`,
      html: htmlTemplate,
    });

    if (error) {
       console.error("Resend API rejected email natively: ", error);
       throw new Error(error.message);
    }
  } catch (error) {
     console.error("Critical Resend SDK integration error", error);
     throw error;
  }
}
