# 🎯 AI Interviewer - Technical Documentation

An end-to-end AI-powered interview platform that helps candidates practice interviews with personalized feedback. Built with Next.js, Claude AI, and React.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

---

## ✨ Features

### Core Features
- ✅ **Resume Upload & Parsing**: Upload PDF or DOCX resumes for automatic text extraction
- ✅ **AI Resume Analysis**: Claude AI extracts structured resume data:
  - Candidate name, contact info
  - Skills and certifications
  - Work experience and projects
  - Education and years of experience
- ✅ **Role Selection**: Choose from 10+ common roles or enter a custom position
- ✅ **Job Description Input**: Optional job description for context-aware questions
- ✅ **Interactive Interview**: 5 sequential interview questions with AI-powered responses
- ✅ **Adaptive Questions**: AI adjusts follow-up questions based on candidate responses
- ✅ **Comprehensive Evaluation**: Auto-generated performance report including:
  - Overall score (0-10)
  - Technical skills assessment (0-10)
  - Communication skills score (0-10)
  - Problem-solving ability (0-10)
  - Role fit alignment (0-10)
  - Strengths and weaknesses analysis
  - Personalized recommendations
- ✅ **PDF Report Download**: Generate and download professional interview report
- ✅ **Session Management**: Store interview history in browser

### UX Features
- 📱 Responsive design with Tailwind CSS
- ⚡ Real-time chat interface with typing indicators
- 🔄 Progress tracking during interview
- 💾 Session persistence across page reloads
- 🎨 Clean, modern UI with smooth animations

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) 14+ (React 18)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) 3.3+
- **Language**: TypeScript 5
- **PDF Generation**: jsPDF 2.5+ with autotable

### Backend
- **Server**: Next.js API Routes
- **AI/LLM**: Claude 3.5 Sonnet via [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-python)
- **Resume Parsing**: 
  - `pdf-parse` 1.1+ (PDF files)
  - `mammoth` 1.6+ (DOCX files)
- **Form Handling**: formidable 2.4+ (multipart/form-data)

### DevTools
- **Package Manager**: npm or yarn
- **Linting**: ESLint
- **Type Checking**: TypeScript compiler
- **Deployment**: Vercel (recommended) or any Node.js host

---

## 📁 Project Structure

```
ai-interviewer/
├── components/                # React Components
│   ├── ResumeUpload.tsx      # File upload & extraction
│   ├── RoleSelection.tsx      # Job role picker
│   ├── JobDescriptionInput.tsx # Job description form
│   ├── ChatInterview.tsx      # Main interview interface
│   ├── InterviewReport.tsx    # Final evaluation display
│   └── Loader.tsx            # Loading spinner
│
├── pages/                      # Next.js Pages & API Routes
│   ├── index.tsx             # Home page
│   ├── interview.tsx         # Interview setup page
│   ├── chat.tsx              # Chat/interview page
│   ├── report.tsx            # Report page
│   └── api/
│       ├── parse-resume.ts          # File upload endpoint
│       ├── parse-resume-ai.ts       # AI resume parsing
│       ├── generate-questions.ts    # Interview Q&A
│       ├── evaluate-interview.ts    # Performance eval
│       └── generate-report.ts       # Report generation
│
├── lib/                       # Utility Functions
│   ├── aiClient.ts          # Claude API wrapper
│   ├── resumeParser.ts      # Resume extraction & validation
│   └── promptTemplates.ts   # AI prompt engineering
│
├── types/                     # TypeScript Definitions
│   └── interview.ts         # All app interfaces
│
├── styles/                    # CSS & Tailwind
│   └── globals.css          # Global styles
│
├── public/                    # Static Assets
│
├── package.json             # Dependencies & scripts
├── tsconfig.json           # TypeScript config
├── tailwind.config.js      # Tailwind setup
├── postcss.config.js       # PostCSS plugins
├── next.config.js          # Next.js config
├── .eslintrc.json          # ESLint rules
├── .env.local.example      # Template for env vars
└── README.md               # This file
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Anthropic API key (get from [console.anthropic.com](https://console.anthropic.com))

### Installation Steps

1. **Clone/Navigate to project**
   ```bash
   cd ai-interviewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   ```bash
   # Copy example file
   cp .env.local.example .env.local
   
   # Edit .env.local and add your API key
   # ANTHROPIC_API_KEY=your_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

### Build for Production
```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the project root:

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...your-api-key...

# Optional
NEXT_PUBLIC_APP_NAME=AI Interviewer
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Getting your Anthropic API Key:**
1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create an account or log in
3. Navigate to "API Keys" section
4. Create a new API key
5. Copy and paste it into `.env.local`

---

## 🔌 API Endpoints

### POST `/api/parse-resume`
Extracts text from uploaded resume file.

**Request:**
```
Content-Type: multipart/form-data
Body: file (PDF or DOCX, max 10MB)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "extracted resume text..."
  }
}
```

---

### POST `/api/parse-resume-ai`
Parses resume text using Claude AI.

**Request:**
```json
{
  "resumeText": "full resume text here..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "skills": ["JavaScript", "React", "Node.js"],
    "yearsOfExperience": 5,
    "workExperience": [...],
    "education": [...],
    "projects": [...],
    "certifications": [...]
  }
}
```

---

### POST `/api/generate-questions`
Generates the next interview question.

**Request:**
```json
{
  "resumeData": { /* ParsedResume */ },
  "targetRole": "Software Engineer",
  "jobDescription": "optional job description",
  "conversationHistory": [ /* messages */ ],
  "isFirstQuestion": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "question": "Tell me about a time you...",
    "questionId": "q_1234567890"
  }
}
```

---

### POST `/api/evaluate-interview`
Evaluates interview performance.

**Request:**
```json
{
  "resumeData": { /* ParsedResume */ },
  "targetRole": "Software Engineer",
  "conversationHistory": [ /* all messages */ ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "technicalSkillsScore": 8,
    "communicationScore": 7,
    "problemSolvingScore": 8,
    "roleAlignmentScore": 9,
    "overallScore": 8,
    "recommendation": "Hire",
    "strengths": ["Strong technical foundation", ...],
    "weaknesses": ["Could improve soft skills", ...],
    "feedbackSummary": "Overall strong candidate...",
    "skillAssessments": [...],
    "areasForImprovement": [...]
  }
}
```

---

### POST `/api/generate-report`
Generates report data for PDF download.

**Request:**
```json
{
  "evaluation": { /* InterviewEvaluation */ },
  "sessionData": { /* InterviewSession */ }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportData": { /* formatted report */ }
  }
}
```

---

## 🔄 How It Works

### User Journey

```
1. Home Page
   └─→ Upload Resume (PDF/DOCX)
       └─→ AI extracts & parses resume

2. Interview Setup
   └─→ Select Target Role
   └─→ (Optional) Add Job Description
   └─→ Review Settings

3. Interview Chat
   └─→ AI asks 5 sequential questions
   └─→ User responds to each question
   └─→ AI evaluates responses in real-time

4. Performance Report
   └─→ Display comprehensive evaluation
   └─→ Download PDF report
   └─→ Option to start new interview
```

### AI Flow

**Resume Parsing:**
1. User uploads resume file
2. System extracts text using pdf-parse or mammoth
3. Extracted text sent to Claude with parsing prompt
4. Claude returns structured JSON with:
   - Contact information
   - Skills
   - Work experience
   - Projects
   - Education
   - Certifications
   - Years of experience

**Question Generation:**
1. System maintains conversation history
2. For first question: use warm-up prompt
3. For subsequent questions: include full conversation context
4. Claude generates contextual follow-up questions
5. Questions reference resume details and previous responses

**Performance Evaluation:**
1. System sends full conversation transcript to Claude
2. Evaluation prompt includes resume and role context
3. Claude scores on 4 dimensions (0-10):
   - Technical Skills
   - Communication
   - Problem Solving
   - Role Alignment
4. Claude provides:
   - Strengths (3-5 items)
   - Weaknesses (2-4 items)
   - Detailed feedback summary
   - Personalized recommendations
   - Overall score & recommendation

---

## 🌐 Deployment

### Deploy on Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/ai-interviewer.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `ANTHROPIC_API_KEY`: Your API key
   - Click "Deploy"

3. **Configure Domain (Optional)**
   - In Vercel dashboard, go to Settings > Domains
   - Add your custom domain

### Deploy on Other Platforms

**Using Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Using Railway:**
- Connect GitHub repo to Railway
- Add `ANTHROPIC_API_KEY` environment variable
- Deploy

**Using Heroku:**
```bash
heroku create your-app-name
heroku config:set ANTHROPIC_API_KEY=your_key
git push heroku main
```

---

## 🐛 Troubleshooting

### Common Issues

**"Cannot find module 'react'"**
- Run `npm install` to install all dependencies

**"ANTHROPIC_API_KEY is not set"**
- Check `.env.local` file exists
- Verify key is set correctly
- Restart dev server after updating env vars

**"Resume parsing fails"**
- Ensure file is actual PDF or DOCX (not renamed file)
- Check file size < 10MB
- Try a different resume file

**"Interview questions are generic"**
- Ensure resume was parsed correctly
- Check conversation history is being sent with API calls
- Verify Claude API key has sufficient quota

**"PDF download fails"**
- Check browser console for errors
- Ensure jsPDF is installed: `npm install jspdf`
- Try a different browser

**Port 3000 already in use**
```bash
# Use different port
npm run dev -- -p 3001
```

---

## 🚀 Performance Optimizations

### Already Implemented
- ✅ Code splitting via Next.js automatic
- ✅ Image optimization (Tailwind CSS)
- ✅ API route caching
- ✅ Client-side session storage
- ✅ Lazy loading components

### Future Improvements
- [ ] Add caching layer for resume parsing results
- [ ] Implement request rate limiting
- [ ] Add Redis cache for repeated questions
- [ ] Optimize PDF generation with worker threads
- [ ] Add CDN for static assets

---

## 📊 Features Roadmap

### Phase 2 (Coming Soon)
- [ ] User authentication (Supabase)
- [ ] Interview history & analytics
- [ ] Voice-based interview support
- [ ] Multiple interview modes (behavioral, technical, etc.)
- [ ] Interview scoring benchmarks
- [ ] Feedback email delivery

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration for mock interviews
- [ ] Interview scheduling with mentors
- [ ] Skill-based interview templates
- [ ] Video interview recording

---

## 📚 API Reference

### Resume Types

```typescript
interface ParsedResume {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  skills: string[];
  yearsOfExperience: number;
  workExperience: Array<{
    company: string;
    role: string;
    duration: string;
    responsibilities: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationYear?: string;
  }>;
  certifications: string[];
}
```

### Evaluation Types

```typescript
interface InterviewEvaluation {
  technicalSkillsScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  roleAlignmentScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: 'Strong Hire' | 'Hire' | 'Maybe' | 'No Hire';
  feedbackSummary: string;
  areasForImprovement: string[];
  skillAssessments: Array<{
    category: string;
    score: number;
    comments: string;
  }>;
}
```

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Resume parsing: [pdf-parse](https://github.com/modesty/pdf-parse), [mammoth.js](https://github.com/mwilkinson106/mammoth.js)

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@aiinterviewer.com
- Discord: [Join our community](#)

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev)

---

**Last Updated**: April 2024 | **Version**: 1.0.0
#   a i - i n t e r v i e w e r  
 #   a i - i n t e r v i e w e r  
 