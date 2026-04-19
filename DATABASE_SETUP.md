# Database Setup Guide for AI Interviewer

## Overview

This project uses **Prisma ORM** with **PostgreSQL** as the database. Prisma provides a type-safe database client and automated migrations.

## Prerequisites

- Node.js 16+ installed
- PostgreSQL 12+ installed and running
- npm or yarn package manager

## Installation & Setup

### 1. Install Dependencies

```bash
npm install @prisma/client prisma
```

### 2. Configure Environment Variables

Create or update `.env.local` with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ai_interviewer?schema=public"
```

**Example for local development:**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_interviewer?schema=public"
```

### 3. Create the Database

```bash
# Using PostgreSQL CLI
createdb ai_interviewer

# Or using Prisma
npx prisma db push
```

### 4. Run Migrations

```bash
# Create initial migration (one-time setup)
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

This is usually done automatically after migrations.

## Database Models

### User
- Stores user information and credentials
- Relations: Multiple resumes and interview sessions

### Resume
- Stores uploaded resume files and parsed data
- Relations: Belongs to User, used in Interview Sessions

### InterviewSession
- Main interview record with all metadata
- Tracks status, difficulty, and scores
- Relations: Contains question responses, recording, and evaluation report

### QuestionResponse
- Individual question-answer pairs during interview
- Tracks timing and scores
- Relations: Belongs to interview session

### Recording
- Video/audio recording files from interviews
- Relations: One-to-one with interview session

### EvaluationReport
- Detailed evaluation and feedback
- Contains scores across multiple dimensions
- Relations: One-to-one with interview session

## Common Operations

### Create a New Interview Session

```typescript
import { prisma } from '@/lib/prisma';

const session = await prisma.interviewSession.create({
  data: {
    userId: 'user-id',
    resumeId: 'resume-id',
    role: 'Senior Backend Engineer',
    company: 'Tech Company',
    jobDescription: '...',
    difficultyLevel: 'SENIOR',
  },
});
```

### Save Question Response

```typescript
await prisma.questionResponse.create({
  data: {
    sessionId: 'session-id',
    questionNumber: 1,
    question: 'Tell me about your experience...',
    answer: 'User response...',
    responseTime: 120, // seconds
    score: 85,
    feedback: 'Good explanation...',
  },
});
```

### Complete Interview and Create Report

```typescript
// Complete session
await prisma.interviewSession.update({
  where: { id: 'session-id' },
  data: {
    status: 'COMPLETED',
    endedAt: new Date(),
    totalDuration: 1800, // seconds
    overallScore: 87,
  },
});

// Create evaluation report
await prisma.evaluationReport.create({
  data: {
    sessionId: 'session-id',
    technicalScore: 88,
    communicationScore: 85,
    problemSolvingScore: 90,
    confidenceScore: 82,
    overallScore: 86,
    strengths: ['Good understanding', 'Clear communication'],
    weaknesses: ['Need more depth in systems design'],
    recommendations: ['Study distributed systems'],
  },
});
```

### Get User Statistics

```typescript
import { getUserStatistics } from '@/lib/db';

const stats = await getUserStatistics('user-id');
// Returns: totalInterviews, completedInterviews, averageScore, bestScore
```

## Helper Functions

The `lib/db.ts` file provides pre-built helper functions:

- `getOrCreateUser(email, name?)` - Get or create user
- `createInterviewSession(data)` - Create new interview
- `saveQuestionResponse(data)` - Save question-answer pair
- `completeInterviewSession(sessionId, data)` - Mark interview complete
- `saveRecording(data)` - Save recording file
- `createEvaluationReport(data)` - Create evaluation report
- `getUserInterviewHistory(userId)` - Get all interviews for user
- `getInterviewDetails(sessionId)` - Get full interview with all data
- `getUserByEmail(email)` - Find user by email
- `saveResume(data)` - Upload resume
- `getUserResumes(userId)` - Get user's resumes
- `deleteInterviewSession(sessionId)` - Delete interview and related data
- `getUserStatistics(userId)` - Get user's statistics

## Useful Commands

### View Database Studio

Interactive database explorer in browser:
```bash
npx prisma studio
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Format Schema

```bash
npx prisma format
```

### Check Database Health

```bash
npx prisma db execute --stdin < script.sql
```

### Reset Database (Development Only)

⚠️ **Warning: This deletes all data!**
```bash
npx prisma migrate reset
```

## Migration Workflow

### Creating New Migrations

1. Update `schema.prisma`
2. Run:
```bash
npx prisma migrate dev --name add_new_field
```
3. Prisma will:
   - Check schema for changes
   - Create SQL migration file
   - Apply migration to development database
   - Regenerate Prisma client

### Applying Migrations in Production

```bash
npx prisma migrate deploy
```

This applies all pending migrations without automatic data reset.

## Best Practices

### 1. Use TypeScript with Prisma

```typescript
import { Prisma } from '@prisma/client';

// Get type hints for creation data
type InterviewSessionCreateInput = Prisma.InterviewSessionCreateInput;

async function createSession(data: InterviewSessionCreateInput) {
  return await prisma.interviewSession.create({ data });
}
```

### 2. Use Transactions for Multiple Operations

```typescript
const result = await prisma.$transaction(async (tx) => {
  const session = await tx.interviewSession.create({ data: {...} });
  const response = await tx.questionResponse.create({ data: {...} });
  return { session, response };
});
```

### 3. Handle Errors Properly

```typescript
import { Prisma } from '@prisma/client';

try {
  await prisma.user.create({ data: {...} });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      // Unique constraint failed
    }
  }
}
```

### 4. Optimize Queries

```typescript
// Good: Only fetch needed fields
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true },
});

// Good: Use include for relations
const session = await prisma.interviewSession.findUnique({
  where: { id: 'session-id' },
  include: { questionResponses: true, evaluationReport: true },
});
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `NODE_ENV` | Environment (development/production) | `development` |

## Troubleshooting

### Connection Issues

```bash
# Check PostgreSQL is running
psql -U postgres -h localhost

# Test connection
npx prisma db execute --stdin
```

### Migration Conflicts

```bash
# Resolve conflicts manually, then:
npx prisma migrate resolve --rolled-back <migration-name>
```

### Reset Schema

```bash
# Development only!
npx prisma migrate reset
npx prisma migrate dev --name init
```

## Database Diagram

```
User (1) ─────────── (M) Resume
  │
  └─────────── (M) InterviewSession
                      │
                      ├─ (M) QuestionResponse
                      ├─ (1) Recording
                      └─ (1) EvaluationReport
```

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
