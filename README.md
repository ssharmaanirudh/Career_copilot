# Career Co-Pilot

Upload your resume, paste a job description, and get:

- A **tailored, ATS-friendly resume** rewritten to match the role
- A **tailored cover letter** for that specific job
- An **application score** (0-100) with a breakdown of skills match, experience
  match, keyword alignment, and presentation
- A **skill-gap plan**: the specific skills to learn next to stay competitive

Built with Next.js (App Router) and the Google Gemini API (Gemini 2.5
Flash, which has a free tier).

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure your API key. Get a free key at
   [Google AI Studio](https://aistudio.google.com/apikey) (no credit card
   required for the free tier):

   ```bash
   cp .env.example .env.local
   # then edit .env.local and set GEMINI_API_KEY
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000), upload a resume
   (PDF, DOCX, or TXT), paste a job description, and click **Tailor my
   application**.

## How it works

- `src/lib/parseResume.ts` extracts plain text from the uploaded resume
  (PDF via `unpdf`, DOCX via `mammoth`, or plain text).
- `src/app/api/analyze/route.ts` validates the upload and job description,
  then calls `src/lib/gemini.ts`.
- `src/lib/gemini.ts` prompts Gemini with a JSON response schema so the
  model always returns a structured result: the tailored resume, cover
  letter, score breakdown, list of changes made, and skill gaps.
- `src/app/api/download/route.ts` converts the tailored resume or cover
  letter into a downloadable `.docx` using the `docx` package.
- The UI (`src/app/page.tsx` and `src/components/*`) handles upload, shows
  a loading state, and renders the results in tabs with copy/download
  actions.

## Notes

- Nothing is persisted — each request is stateless; results only live in
  the browser until you copy or download them.
- The model is asked not to invent employers, titles, dates, or
  accomplishments — only to rephrase, reorder, and emphasize what's
  actually in the uploaded resume.
