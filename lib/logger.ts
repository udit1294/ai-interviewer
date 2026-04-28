// /lib/logger.ts
export const logger = {
  error: (context: string, error?: any) => {
    // 1. Always console.error for local Dev organically
    console.error(`[${context}]`, error);
    
    // 2. In Production, dispatch implicitly cleanly to Sentry/Axiom efficiently
    if (process.env.NODE_ENV === "production") {
      // Sentry.captureException(error, { extra: { context } })
    }
  },
  info: (context: string, message: string) => {
    console.log(`[INFO][${context}]`, message);
  }
};
