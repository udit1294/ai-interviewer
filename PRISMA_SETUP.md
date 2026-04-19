# Database Layer Setup Summary

## ✅ Completed Setup

### 1. **Prisma Installation**
- ✅ Installed `@prisma/client@5.8.0` and `prisma@5.8.0`
- ✅ Created `prisma/schema.prisma` with all models
- ✅ Formatted schema according to Prisma standards

### 2. **Database Models Created**

#### **User**
- Stores user authentication data
- Fields: id, email (unique), name, password, createdAt, updatedAt
- Relations: 1-to-M Resume, 1-to-M InterviewSession

#### **Resume**
- Stores parsed resume data
- Fields: id, userId, fileUrl, parsedData (JSON), createdAt
- Relations: M-to-1 User, 1-to-M InterviewSession

#### **InterviewSession**
- Core interview record with metadata
- Fields: id, userId, resumeId, role, company, jobDescription, difficultyLevel, status, startedAt, endedAt, totalDuration, overallScore, feedbackSummary, maxQuestions
- Status: IN_PROGRESS, COMPLETED, ABANDONED
- Difficulty: ENTRY, MID, SENIOR
- Relations: M-to-1 User, M-to-1 Resume, 1-to-M QuestionResponse, 1-to-1 Recording, 1-to-1 EvaluationReport

#### **QuestionResponse**
- Individual Q&A from interview
- Fields: id, sessionId, questionNumber, question, answer, score, feedback, responseTime, createdAt
- Relations: M-to-1 InterviewSession

#### **Recording**
- Video/audio recording file
- Fields: id, sessionId (unique), fileUrl, duration, format, fileSize, createdAt
- Format: WEBM, MP3, WAV
- Relations: 1-to-1 InterviewSession

#### **EvaluationReport**
- Interview evaluation results
- Fields: id, sessionId (unique), technicalScore, communicationScore, problemSolvingScore, confidenceScore, overallScore, strengths[], weaknesses[], recommendations[], detailedFeedback (JSON), interviewerComments, createdAt, updatedAt
- Relations: 1-to-1 InterviewSession

### 3. **Utility Files Created**

#### **`lib/prisma.ts`**
- Singleton Prisma client instance
- Prevents connection pool exhaustion in development
- Safe hot-reloading support
- Usage: `import { prisma } from '@/lib/prisma'`

#### **`lib/db.ts`**
- 12 pre-built helper functions for common operations
- Functions include:
  - `getOrCreateUser(email, name?)`
  - `createInterviewSession(data)`
  - `saveQuestionResponse(data)`
  - `completeInterviewSession(sessionId, data)`
  - `saveRecording(data)`
  - `createEvaluationReport(data)`
  - `getUserInterviewHistory(userId)`
  - `getInterviewDetails(sessionId)`
  - `getUserByEmail(email)`
  - `saveResume(data)`
  - `getUserResumes(userId)`
  - `deleteInterviewSession(sessionId)`
  - `getUserStatistics(userId)`

### 4. **Configuration Files**
- ✅ `.env.local` - Contains DATABASE_URL (update with your PostgreSQL connection)
- ✅ `.env.example` - Template for environment variables

### 5. **Documentation**
- ✅ `DATABASE_SETUP.md` - Comprehensive guide with:
  - Setup instructions
  - Migration workflow
  - Common operations with examples
  - Helper function reference
  - Best practices
  - Troubleshooting guide

---

## 🚀 Next Steps

### Step 1: Set Up PostgreSQL Database

**Option A: Using PostgreSQL locally**
```bash
# Create database
createdb ai_interviewer

# Or use psql
psql -U postgres -c "CREATE DATABASE ai_interviewer;"
```

**Option B: Using Docker**
```bash
docker run --name postgres-ai \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_interviewer \
  -p 5432:5432 \
  -d postgres:15
```

### Step 2: Update `.env.local` Connection String

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_interviewer?schema=public"
```

### Step 3: Run Initial Migration

```bash
npx prisma migrate dev --name init
```

This will:
- Create all tables in PostgreSQL
- Generate Prisma client types
- Create migration history

### Step 4: Verify Setup

```bash
# Open Prisma Studio (interactive DB explorer)
npx prisma studio
```

Visit `http://localhost:5555` in your browser to see database explorer.

### Step 5: Generate Prisma Client (if needed)

```bash
npx prisma generate
```

---

## 📊 Database Diagram

```
┌─────────┐
│  User   │
└────┬────┘
     │
     ├─── (1:M) ──────┬──────────┐
     │                │          │
     ▼                ▼          ▼
┌──────────┐  ┌──────────────────┐
│ Resume   │  │ InterviewSession │
└──────────┘  └────────┬──────────┘
                       │
              ┌────────┼────────┬─────────┐
              │        │        │         │
              ▼        ▼        ▼         ▼
         ┌─────────┐ ┌────────┐ ┌────────────┐
         │Recording│ │Question │ │Evaluation  │
         │         │ │Response │ │Report      │
         └─────────┘ └────────┘ └────────────┘
```

---

## 📝 Usage Examples

### Create New Interview

```typescript
import { createInterviewSession } from '@/lib/db';

const session = await createInterviewSession({
  userId: 'user-123',
  resumeId: 'resume-456',
  role: 'Senior Backend Engineer',
  company: 'TechCorp',
  jobDescription: 'Lead backend architecture...',
  difficultyLevel: 'SENIOR',
  maxQuestions: 5,
});
```

### Save Question Response

```typescript
import { saveQuestionResponse } from '@/lib/db';

await saveQuestionResponse({
  sessionId: session.id,
  questionNumber: 1,
  question: 'Tell me about your system design experience?',
  answer: 'I have 5+ years designing scalable systems...',
  responseTime: 120,
  score: 88,
  feedback: 'Excellent explanation of trade-offs',
});
```

### Complete Interview & Create Report

```typescript
import { completeInterviewSession, createEvaluationReport } from '@/lib/db';

// Mark as complete
await completeInterviewSession(session.id, {
  totalDuration: 1800,
  overallScore: 86,
  feedbackSummary: 'Strong technical knowledge, good communication',
});

// Create evaluation
await createEvaluationReport({
  sessionId: session.id,
  technicalScore: 88,
  communicationScore: 85,
  problemSolvingScore: 90,
  confidenceScore: 82,
  overallScore: 86,
  strengths: ['Systems thinking', 'Clear communication'],
  weaknesses: ['Limited distributed systems experience'],
  recommendations: ['Study CAP theorem', 'Practice architecture interviews'],
});
```

### Get User Statistics

```typescript
import { getUserStatistics } from '@/lib/db';

const stats = await getUserStatistics('user-123');
// Returns: {
//   totalInterviews: 5,
//   completedInterviews: 4,
//   averageScore: 82.5,
//   bestScore: 92,
//   recentInterviews: [...]
// }
```

---

## 🔧 Common Commands

```bash
# View database in browser
npx prisma studio

# Create new migration after schema changes
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Format schema
npx prisma format

# Generate Prisma client
npx prisma generate

# Reset database (dev only - destructive!)
npx prisma migrate reset

# Debug queries
set DEBUG=prisma:*
npm run dev
```

---

## ✨ Key Features

✅ **Type-Safe Database Operations**
- Full TypeScript support with Prisma
- Autocomplete for all queries
- Build-time type checking

✅ **Automatic Migrations**
- Version control for schema changes
- Rollback capability
- Migration history tracking

✅ **Cascading Deletes**
- Delete user → Automatically deletes all related data
- Delete session → Cleans up all responses, recordings, reports

✅ **Relationship Support**
- One-to-One (User ↔ Recording)
- One-to-Many (User → Multiple Sessions)
- Foreign Keys with constraints

✅ **JSON Storage**
- Resume parsed data as JSON
- Detailed feedback as JSON
- Flexible schema for complex data

✅ **Enums**
- Interview status tracking
- Difficulty levels
- Recording formats

---

## 📋 Checklist Before Running Migrations

- [ ] PostgreSQL is installed and running
- [ ] Database `ai_interviewer` is created
- [ ] `.env.local` has correct `DATABASE_URL`
- [ ] Prisma is installed (`npm install` completed)
- [ ] Schema file is properly formatted
- [ ] No syntax errors in `prisma/schema.prisma`

Run:
```bash
npx prisma validate
```

---

## 🆘 Troubleshooting

**Issue: "Can't reach database server"**
```bash
# Check PostgreSQL is running
psql -U postgres -h localhost

# Verify connection string in .env.local
echo $DATABASE_URL
```

**Issue: "Column/Table already exists"**
```bash
# Check migration status
npx prisma migrate status

# Resolve conflict
npx prisma migrate resolve --rolled-back <migration-name>
```

**Issue: Type errors in code**
```bash
# Regenerate Prisma client
npx prisma generate
```

---

## 📚 Further Reading

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**Database setup is complete! Ready to start development. 🚀**
