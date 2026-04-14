# 🚀 AI Interviewer - Quick Start Guide

Welcome to AI Interviewer! This guide will get you up and running in minutes.

## ⚡ 5-Minute Setup

### Step 1: Get Anthropic API Key
1. Visit: https://console.anthropic.com
2. Sign up or log in
3. Go to "API Keys" section
4. Create new API key
5. Copy the key

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment
```bash
# Copy example file
cp .env.local.example .env.local

# Edit .env.local and paste your API key
# ANTHROPIC_API_KEY=sk-ant-your-key-here...
```

### Step 4: Run the App
```bash
npm run dev
```

### Step 5: Open in Browser
```
http://localhost:3000
```

Done! 🎉

---

## 📝 First Time Using the App?

### The Interview Flow:

1. **Upload Resume**
   - Click "Upload Resume" button
   - Select your PDF or DOCX file
   - System will extract and analyze your resume

2. **Select Role**
   - Choose from suggested roles (Software Engineer, Data Scientist, etc.)
   - Or type in a custom role

3. **Add Job Description (Optional)**
   - Paste the job description if you have one
   - Or skip to proceed directly

4. **Take Interview**
   - AI will ask 5 questions
   - Answer thoughtfully - try to be detailed
   - AI will ask follow-ups based on your responses

5. **Get Report**
   - View your performance scores
   - Read detailed feedback
   - Download PDF report

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Start dev server on :3000
npm run build           # Build for production
npm start               # Run production build
npm run lint            # Check code quality
npm run type-check      # TypeScript type checking

# Debugging
# Check .env.local is configured
cat .env.local

# Check dependencies
npm list

# Clear cache
rm -rf .next node_modules
npm install
```

---

## 🎯 Project Files Overview

```
Important Files to Know:

pages/
  index.tsx              → Home page (resume upload)
  interview.tsx          → Setup page (role selection)
  chat.tsx               → Interview chat interface
  report.tsx             → Final evaluation display
  api/                   → All backend endpoints

components/
  ResumeUpload.tsx       → File upload component
  ChatInterview.tsx      → Main chat interface
  InterviewReport.tsx    → Report display & PDF download

lib/
  aiClient.ts            → Claude API wrapper
  promptTemplates.ts     → All AI prompts
  resumeParser.ts        → Resume parsing logic

types/
  interview.ts           → TypeScript interfaces
```

---

## ✅ Testing Checklist

After setup, verify everything works:

- [ ] App loads at localhost:3000
- [ ] Resume upload form appears
- [ ] Can select PDF/DOCX file
- [ ] Role selection page works
- [ ] Interview chat starts
- [ ] AI generates questions
- [ ] Can submit responses
- [ ] Report page displays
- [ ] Can download PDF

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| API key error | Check .env.local has `ANTHROPIC_API_KEY=sk-ant-...` |
| Port 3000 in use | Run `npm run dev -- -p 3001` |
| Module not found | Run `npm install` again |
| Resume parsing fails | Try different PDF/DOCX file |
| Interview won't start | Check browser console for errors |
| PDF download fails | Try Chrome/Firefox browser |

---

## 📖 Next Steps

After getting familiar with the app:

1. **Customize Prompts** → Edit `/lib/promptTemplates.ts`
2. **Add Features** → Create new components in `/components`
3. **Deploy** → Follow deployment guide in README.md
4. **Contribute** → Submit pull requests with improvements

---

## 💡 Pro Tips

- **Better Results**: Upload a detailed, well-formatted resume
- **Realistic Practice**: Use actual job descriptions you're applying for
- **Detailed Responses**: Provide comprehensive answers to get better feedback
- **Review Reports**: Download and save PDF reports to track improvement
- **Try Multiple Roles**: Practice for different positions to see differences

---

## 📚 Learn More

- [Full README](./README.md) - Comprehensive documentation
- [Next.js Docs](https://nextjs.org/docs) - Framework guide
- [Anthropic API](https://docs.anthropic.com/) - Claude AI documentation
- [TypeScript](https://www.typescriptlang.org/docs/) - Language reference

---

**Need Help?**
- Check the README.md for detailed troubleshooting
- Review the code comments in the source files
- Check browser console for error messages

Happy interviewing! 🚀
