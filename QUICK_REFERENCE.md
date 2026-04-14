# 🎯 AI Interviewer - Quick Reference Card

## ⚡ Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.local.example .env.local
# Edit .env.local and add your Anthropic API key

# 3. Run development server
npm run dev

# 4. Open in browser
# Visit http://localhost:3000
```

---

## 📁 Important Directories

```
ai-interviewer/
├── components/        ← React UI components
├── pages/            ← Next.js pages & API routes
├── lib/              ← Utility functions & AI prompts
├── types/            ← TypeScript interfaces
└── styles/           ← CSS & Tailwind styles
```

---

## 🔧 Key Commands

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm start            # Run production build
npm run lint         # Check code quality
npm run type-check   # Check TypeScript types
```

---

## 🚀 User Flow

```
1. Home (/)
   ↓ Upload resume
2. Interview Setup (/interview)
   ↓ Select role + JD
3. Chat Interview (/chat)
   ↓ Answer 5 questions
4. Report (/report)
   ↓ View scores & feedback
```

---

## 🧠 AI Interactions

```
1. Resume Upload
   → pdf-parse/mammoth extracts text
   → Claude parses to JSON structure

2. Interview Questions
   → Claude generates contextual questions
   → Adapts based on previous answers

3. Performance Evaluation
   → Claude scores on 4 dimensions
   → Provides feedback & recommendations
```

---

## 📊 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/parse-resume` | Extract text from file |
| POST | `/api/parse-resume-ai` | Parse with Claude |
| POST | `/api/generate-questions` | Generate interview Q |
| POST | `/api/evaluate-interview` | Evaluate responses |
| POST | `/api/generate-report` | Compile report data |

---

## 🎨 Key Components

| Component | Purpose | File |
|-----------|---------|------|
| ResumeUpload | Upload & extract resume | `components/ResumeUpload.tsx` |
| RoleSelection | Choose job role | `components/RoleSelection.tsx` |
| ChatInterview | Interview UI & logic | `components/ChatInterview.tsx` |
| InterviewReport | Show results & PDF | `components/InterviewReport.tsx` |

---

## 🔐 Environment Setup

Create `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

Get API key:
1. Visit https://console.anthropic.com
2. Create account
3. Generate API key
4. Paste into .env.local

---

## 🎯 Common Customizations

### Change number of interview questions
```typescript
// components/ChatInterview.tsx
const maxQuestions = 5  // Change this to X
```

### Add job roles
```typescript
// components/RoleSelection.tsx
const commonRoles = [
  'Your New Role',
  // ... existing roles
]
```

### Modify AI prompts
```typescript
// lib/promptTemplates.ts
export function getInterviewSystemPrompt() {
  // Edit the prompt here
}
```

### Change report styling
```typescript
// components/InterviewReport.tsx
// Edit the JSX and Tailwind classes
```

---

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| `ANTHROPIC_API_KEY is not set` | Check `.env.local` file |
| `Cannot find module 'react'` | Run `npm install` |
| `Port 3000 in use` | Use `npm run dev -- -p 3001` |
| Resume parsing fails | Try different PDF/DOCX file |
| PDF download fails | Try Chrome/Firefox |

---

## 📚 Documentation Reference

| Document | For | Length |
|----------|-----|--------|
| QUICKSTART.md | First-time setup | 5 min read |
| README.md | Complete reference | 30 min read |
| IMPLEMENTATION_NOTES.md | Technical details | 20 min read |
| PROJECT_SUMMARY.md | Overview | 10 min read |
| FILE_MANIFEST.md | File reference | 5 min read |

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repo to Vercel
3. Add `ANTHROPIC_API_KEY` env variable
4. Deploy (automatic on push)

### Other Platforms
- Railway, Heroku, Docker all supported
- See README.md for detailed guides

---

## 📞 Getting Help

1. **Setup issues** → Read QUICKSTART.md
2. **Feature questions** → Check README.md
3. **Code details** → See IMPLEMENTATION_NOTES.md
4. **File locations** → View FILE_MANIFEST.md
5. **Error messages** → Check browser console

---

## ✅ Testing Checklist

After setup:
- [ ] App loads at localhost:3000
- [ ] Resume upload works
- [ ] Role selection works
- [ ] Interview starts
- [ ] Can answer questions
- [ ] Report displays
- [ ] PDF downloads
- [ ] No console errors

---

## 💡 Pro Tips

✅ **Better interviews**: Use detailed, well-formatted resumes
✅ **Better feedback**: Provide comprehensive answers
✅ **Better results**: Include real job descriptions
✅ **Save reports**: Download PDF for records
✅ **Test often**: Practice with different roles

---

## 📦 Tech Stack Summary

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude API
- **Files**: pdf-parse, mammoth
- **PDF**: jsPDF
- **Forms**: Formidable

---

## 🎓 File Quick Links

**Must Read:**
- README.md - Start here for full reference
- QUICKSTART.md - Quick 5-min setup guide

**For Development:**
- lib/promptTemplates.ts - All AI prompts
- components/ChatInterview.tsx - Main logic
- pages/api/ - Backend endpoints

**For Customization:**
- components/ - UI components
- styles/globals.css - Styling
- next.config.js - Configuration

---

## 📈 Project Stats

- **36+ files** created
- **3000+ lines** of code
- **15+ types** defined
- **5 API** endpoints
- **6 components** built
- **4 pages** created
- **5000+ words** documentation

---

## 🎉 Ready to Go!

Your AI Interviewer is ready to use:

```bash
# 1. Ensure Node 18+ installed
node --version

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.local.example .env.local
# Edit .env.local with your API key

# 4. Start coding
npm run dev

# 5. Visit localhost:3000
```

**Happy Interviewing!** 🚀

---

**Version:** 1.0.0 | **Status:** Production Ready | **Date:** April 2024
