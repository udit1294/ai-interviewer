import { inngest } from "./client";
import { prisma } from "../prisma";
import { initializeAIClient, sendMessage, parseJSONResponse } from "../aiClient";
import { getEvaluationPrompt } from "../promptTemplates";

// Idempotent background LLM orchestrator
export const evaluateInterviewWorker = inngest.createFunction(
  { id: "evaluate-interview", retries: 3, triggers: [{ event: "interview/evaluate" }] },
  async ({ event, step }) => {
    const { sessionId, resumeData, targetRole, conversationHistory } = event.data;

    // Step 1: Push inference seamlessly
    const evaluation = await step.run("call-llm", async () => {
      const model = initializeAIClient();
      const prompt = getEvaluationPrompt(targetRole, resumeData, conversationHistory);
      const response = await sendMessage(
        model,
        [{ role: 'user', content: prompt }],
        'You are an expert technical hiring manager. Provide evaluations in JSON format only.'
      );

      const parsed = parseJSONResponse(response) as any;

      return {
        technicalSkillsScore: parsed.technicalSkillsScore || 0,
        communicationScore: parsed.communicationScore || 0,
        problemSolvingScore: parsed.problemSolvingScore || 0,
        overallScore: parsed.overallScore || 0,
        roleAlignmentScore: parsed.roleAlignmentScore || 0,
        recommendation: parsed.recommendation || 'No Hire',
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        areasForImprovement: parsed.areasForImprovement || [],
        feedbackSummary: parsed.feedbackSummary || "",
        skillAssessments: parsed.skillAssessments || [],
        interviewerNotes: parsed.interviewerNotes || ""
      };
    });

    // Step 2: Push exact mathematical values into DB securely bypassing Frontend manipulation risks
    await step.run("save-db-evaluation", async () => {
      await prisma.$transaction([
        prisma.evaluationReport.create({
          data: {
            sessionId: sessionId,
            technicalScore: evaluation.technicalSkillsScore,
            communicationScore: evaluation.communicationScore,
            problemSolvingScore: evaluation.problemSolvingScore,
            confidenceScore: evaluation.roleAlignmentScore,
            overallScore: evaluation.overallScore,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            recommendations: evaluation.areasForImprovement,
            detailedFeedback: {
              summary: evaluation.feedbackSummary,
              assessments: evaluation.skillAssessments
            },
            interviewerComments: evaluation.interviewerNotes
          }
        }),
        prisma.interviewSession.update({
          where: { id: sessionId },
          data: {
            status: "COMPLETED",
            overallScore: evaluation.overallScore,
            feedbackSummary: evaluation.feedbackSummary
          }
        })
      ]);
    });

    // Step 3: Trigger strict email pipeline sequentially natively via idempotent hook
    await step.run("send-email-notification", async () => {
      const sessionWithUser = await prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: { user: true }
      });
      
      if (sessionWithUser && sessionWithUser.user.email) {
         const { sendInterviewCompleteEmail } = await import("@/lib/email");
         
         try {
           await sendInterviewCompleteEmail({
              toEmail: sessionWithUser.user.email,
              candidateName: sessionWithUser.user.name || "Candidate",
              role: targetRole,
              score: evaluation.overallScore,
              feedbackSummary: evaluation.feedbackSummary,
              strengths: evaluation.strengths || [],
              weaknesses: evaluation.weaknesses || [],
              recommendations: evaluation.areasForImprovement || [],
              dashboardLink: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/dashboard/session/${sessionId}`
           });
         } catch (e: any) {
           console.warn("Email Delivery Skipped natively (Free Tier Resend Restriction):", e.message);
         }
      }
    });

    return { success: true, evaluation };
  }
);
