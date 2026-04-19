import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { evaluateInterviewWorker } from "@/lib/inngest/functions";

// Configure Next.js Application Route seamlessly to Inngest SDK
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [evaluateInterviewWorker],
});
