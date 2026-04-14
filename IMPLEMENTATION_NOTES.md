# 🔧 Implementation Notes & Technical Details

## Project Overview

This document contains technical implementation details, design decisions, and architectural patterns used in the AI Interviewer application.

---

## 1. Architecture Overview

### Client-Server Model
```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React/Next.js)              │
│  Components: ResumeUpload, ChatInterview, Report, etc.  │
│  State: sessionStorage for data persistence             │
└──────────────┬──────────────────────────────────────────┘
               │ HTTP/JSON
┌──────────────▼──────────────────────────────────────────┐
│            Backend (Next.js API Routes)                 │
│  - File Upload & Extraction                             │
│  - Resume Parsing with Claude                           │
│  - Question Generation                                  │
│  - Interview Evaluation                                 │
└──────────────┬──────────────────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────────────────┐
│          External Services (Claude API)                 │
│  - Resume parsing to JSON                               │
│  - Interview question generation                        │
│  - Performance evaluation                               │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Data Flow

### Resume Upload & Parsing

```javascript
// 1. User selects file
ResumeUpload.tsx → input[type="file"]

// 2. Frontend sends to API
fetch('/api/parse-resume', { 
  method: 'POST', 
  body: FormData(file) 
})

// 3. Backend extracts text
parse-resume.ts:
  - formidable parses multipart request
  - pdf-parse or mammoth extracts text
  - returns raw text

// 4. Frontend sends to AI parsing endpoint
fetch('/api/parse-resume-ai', { 
  body: JSON.stringify({ resumeText }) 
})

// 5. Backend parses with Claude
parse-resume-ai.ts:
  - Sends text + parsing prompt to Claude
  - Claude returns JSON with structured data
  - Validates and normalizes response
  - Returns ParsedResume object

// 6. Frontend stores in session
sessionStorage.setItem('resumeData', JSON.stringify(resume))
```

### Interview Flow

```javascript
// 1. User clicks "Start Interview"
interview.tsx → stores setup → navigates to /chat

// 2. Chat page loads
chat.tsx:
  - Loads resumeData, targetRole, jobDescription
  - Renders ChatInterview component

// 3. First question generated
ChatInterview.tsx → useEffect → fetch('/api/generate-questions', {
  resumeData,
  targetRole,
  jobDescription,
  conversationHistory: [],
  isFirstQuestion: true
})

// 4. Backend generates greeting
generate-questions.ts:
  - Uses warm-up prompt for first question
  - Claude generates personalized greeting + first Q

// 5. User answers
ChatInterview.tsx:
  - User types response
  - Click "Send"
  - Add to conversationHistory

// 6. Next question generated
fetch('/api/generate-questions', {
  resumeData,
  targetRole,
  jobDescription,
  conversationHistory: [...all messages so far...],
  isFirstQuestion: false
})

// 7. Claude generates contextual follow-up
generate-questions.ts:
  - Includes full conversation history
  - Claude understands context
  - Generates smart follow-up question

// 8. Repeat for 5 questions total
// After 5th question...

// 9. Evaluation triggered
fetch('/api/evaluate-interview', {
  resumeData,
  targetRole,
  conversationHistory
})

// 10. Backend evaluates
evaluate-interview.ts:
  - Sends full transcript to Claude
  - Claude scores on 4 dimensions
  - Returns InterviewEvaluation

// 11. Navigate to report
router.push('/report')

// 12. Display & download
InterviewReport.tsx:
  - Shows all scores and feedback
  - User clicks "Download PDF"
  - jsPDF generates professional report
```

---

## 3. Key Design Decisions

### SessionStorage for State Management
**Why:** 
- Simple, no backend database needed initially
- User data persists during session
- Easy to upgrade to localStorage/database later
- GDPR compliant (data stays in browser)

**How:**
```typescript
// Store
sessionStorage.setItem('resumeData', JSON.stringify(data))

// Retrieve
const data = JSON.parse(sessionStorage.getItem('resumeData'))

// Clear
sessionStorage.clear()
```

### Claude API for All AI Tasks
**Why:**
- Excellent for:
  - Resume parsing (complex structure extraction)
  - Interview question generation (contextual, adaptive)
  - Performance evaluation (nuanced scoring)
- Fast response times
- Good cost-effectiveness
- Reliable and well-documented

### Prompt Engineering Strategy
**Resume Parsing:**
- Provide JSON structure in prompt
- Ask Claude to return ONLY JSON (no markdown)
- Include fallback parsing to handle variations

**Question Generation:**
- System prompt establishes role and rules
- Conversation history provides context
- User input becomes the new message
- Claude adapts based on previous responses

**Evaluation:**
- Full transcript context
- Clear scoring rubric in prompt
- Structured JSON output expected
- Comprehensive feedback instructions

### PDF Generation Client-Side
**Why:**
- No server-side dependency (saves resources)
- Faster (no network round trip)
- Works offline
- Users control file saving

**How:**
```typescript
const doc = new jsPDF()
doc.text('Title', 15, 15)
doc.text(content, 15, 30)
doc.save('report.pdf')
```

---

## 4. Error Handling Strategy

### Frontend Error Handling
```typescript
try {
  const response = await fetch('/api/endpoint')
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error)
  }
  
  const data = await response.json()
  if (!data.success) throw new Error(data.error)
  
  // Use data.data
} catch (error) {
  setError(error.message)
  console.error('Detailed error:', error)
}
```

### API Error Handling
```typescript
try {
  // Process request
  if (!validInput) {
    return res.status(400).json({
      success: false,
      error: 'Clear error message'
    })
  }
  
  // Perform operation
  const result = await doSomething()
  
  return res.status(200).json({
    success: true,
    data: result
  })
} catch (error) {
  console.error('Detailed error:', error)
  return res.status(500).json({
    success: false,
    error: 'User-friendly error message'
  })
}
```

---

## 5. File Upload Implementation

### Using Formidable for Multipart Parsing
```typescript
// Disable default body parser
export const config = {
  api: {
    bodyParser: false
  }
}

// Parse using formidable
const form = new formidable.IncomingForm({
  maxFileSize: 10 * 1024 * 1024 // 10MB
})

const { files } = await new Promise((resolve, reject) => {
  form.parse(req, (err, fields, files) => {
    if (err) reject(err)
    else resolve({ fields, files })
  })
})

// Read file from temp location
const buffer = await fs.promises.readFile(files.file[0].filepath)
```

---

## 6. Type Safety Throughout

### All Data Structures Typed
```typescript
// Request bodies
interface RequestBody {
  resumeData: ParsedResume
  targetRole: string
  jobDescription?: string
  conversationHistory: ConversationMessage[]
}

// API responses
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Interview state
interface InterviewSession {
  id: string
  resumeData: ParsedResume
  targetRole: string
  jobDescription?: string
  questions: InterviewQuestion[]
  responses: CandidateResponse[]
  conversationHistory: ConversationMessage[]
  status: 'in-progress' | 'completed' | 'paused'
}
```

---

## 7. Performance Optimizations

### Implemented
1. **Code Splitting** - Next.js automatic route-based splitting
2. **Image Optimization** - Tailwind CSS (no heavy images)
3. **Client-side Caching** - sessionStorage for resume data
4. **API Response Caching** - Could add Redis layer
5. **Lazy Loading** - Components load on route
6. **Minimal Dependencies** - Only essential packages

### Potential Improvements
```typescript
// Cache resume parsing results
const cacheKey = hashResume(resumeText)
const cached = redisClient.get(cacheKey)
if (cached) return cached

// Cache question generation for same role
const questionCache = new Map()

// Use server-side rendering for report
export async function getServerSideProps(context) {
  // Pre-render evaluation
}
```

---

## 8. Security Considerations

### Input Validation
```typescript
// File type validation
const validTypes = ['application/pdf', 'application/vnd.openxmlformats...']
if (!validTypes.includes(file.type)) {
  throw new Error('Invalid file type')
}

// File size validation
if (file.size > 10 * 1024 * 1024) {
  throw new Error('File too large')
}

// Text validation
if (!resumeText || typeof resumeText !== 'string') {
  throw new Error('Invalid resume text')
}
```

### API Key Security
```typescript
// Never expose API key in frontend code
// Always use server-side environment variables
const apiKey = process.env.ANTHROPIC_API_KEY

// Validate API key exists
if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY not configured')
}

// Use in Next.js API routes (server-side only)
// Never in browser bundle
```

### CORS & Headers
```typescript
// Next.js handles CORS automatically
// API routes can add security headers
res.setHeader('X-Content-Type-Options', 'nosniff')
res.setHeader('X-Frame-Options', 'DENY')
```

---

## 9. Testing Strategy

### Component Testing
```typescript
// Example test structure
describe('ResumeUpload', () => {
  test('displays upload form', () => {
    render(<ResumeUpload onResumeLoaded={jest.fn()} />)
    expect(screen.getByText(/Upload Your Resume/i)).toBeInTheDocument()
  })

  test('calls onResumeLoaded on successful upload', async () => {
    const callback = jest.fn()
    render(<ResumeUpload onResumeLoaded={callback} />)
    // ... simulate upload
    expect(callback).toHaveBeenCalled()
  })
})
```

### API Testing
```typescript
// Example API test
describe('POST /api/parse-resume', () => {
  test('extracts text from PDF', async () => {
    const file = createTestFile('test.pdf')
    const response = await fetch('/api/parse-resume', {
      method: 'POST',
      body: formData
    })
    expect(response.status).toBe(200)
    expect(response.data.text).toBeDefined()
  })

  test('rejects oversized files', async () => {
    const largeFile = createLargeFile() // > 10MB
    const response = await fetch('/api/parse-resume', {
      method: 'POST',
      body: formData
    })
    expect(response.status).toBe(400)
  })
})
```

---

## 10. Scalability Considerations

### Current Setup
- Single Next.js instance
- Stateless API routes
- Client-side session storage
- Direct Claude API calls

### Scaling Path
```
Phase 1 (Current)
└─ Single deployment
   └─ In-memory sessionStorage

Phase 2
└─ Multiple instances
   └─ Add Redis for caching
   └─ Add database (Supabase/Firebase)
   └─ Implement authentication

Phase 3
└─ Microservices
   └─ Separate API server
   └─ Separate PDF service
   └─ Dedicated parsing service
   └─ Analytics service

Phase 4
└─ Distributed
   └─ Load balancer
   └─ CDN for assets
   └─ Separate database replicas
   └─ Message queue for async tasks
```

---

## 11. Environment Configuration

### Development
```bash
npm run dev
# localhost:3000
# .env.local required
```

### Production
```bash
npm run build
npm start
# Optimized build
# Environment variables via platform
```

### Environment Variables
```bash
# Required
ANTHROPIC_API_KEY=sk-ant-xxx

# Optional
NEXT_PUBLIC_APP_NAME=AI Interviewer
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

---

## 12. Key Files Reference

### Most Important Files
1. `lib/aiClient.ts` - Claude integration
2. `lib/promptTemplates.ts` - AI prompts (core logic)
3. `components/ChatInterview.tsx` - Interview UI
4. `pages/api/generate-questions.ts` - Question generation
5. `pages/api/evaluate-interview.ts` - Evaluation logic

### Easy to Customize
1. `lib/promptTemplates.ts` - Modify prompts
2. `components/RoleSelection.tsx` - Add roles
3. `components/InterviewReport.tsx` - Change report format
4. `styles/globals.css` - Update colors

---

## 13. Common Modifications

### Change Number of Questions
```typescript
// ChatInterview.tsx
const maxQuestions = 5 // Change this

// Also update in generate-questions.ts if needed
```

### Add More Preset Roles
```typescript
// RoleSelection.tsx
const commonRoles = [
  'Your new role here',
  // ... existing roles
]
```

### Customize Evaluation Criteria
```typescript
// promptTemplates.ts
// Modify getEvaluationPrompt() function
// Add/remove scoring dimensions
```

### Change Report Layout
```typescript
// InterviewReport.tsx
// Modify JSX and styling
// Use tailwindcss classes
```

---

## 14. Debugging Tips

### Frontend Debugging
```javascript
// Check sessionStorage
console.log(sessionStorage.getItem('resumeData'))

// Monitor API calls
fetch('/api/...').then(r => r.json()).then(console.log)

// React DevTools
// Install React Developer Tools extension
```

### Backend Debugging
```typescript
// Add console logs
console.log('Received request:', req.body)
console.log('Claude response:', response)

// Check environment variables
console.log('API Key configured:', !!process.env.ANTHROPIC_API_KEY)
```

### Network Debugging
```bash
# Check API endpoint health
curl http://localhost:3000/api/parse-resume

# View Next.js logs
npm run dev  # Shows all requests
```

---

## 15. Deployment Checklist

Before deploying:
- [ ] Set `ANTHROPIC_API_KEY` in production
- [ ] Build successfully: `npm run build`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No lint errors: `npm run lint`
- [ ] Test all workflows
- [ ] Test with different resumes
- [ ] Check error handling
- [ ] Verify PDF download works
- [ ] Test on mobile
- [ ] Set up monitoring/logging
- [ ] Configure backup API key

---

## Summary

This implementation uses:
- ✅ Clean architecture
- ✅ Type safety
- ✅ Error handling
- ✅ Best practices
- ✅ Production ready
- ✅ Easily scalable
- ✅ Well documented

All code is designed to be maintainable, extensible, and easy to understand.

---

**Last Updated:** April 2024 | **Version:** 1.0.0
