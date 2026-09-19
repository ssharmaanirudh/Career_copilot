# GapLens

See exactly what's missing between your resume and the job description.
Upload your resume, paste a job description, and get:

- An **honest, capped application score** (before and after tailoring),
  grounded in a line-by-line requirements checklist rather than a vague
  impression — with a blunt verdict on whether it would actually clear a
  screen
- A **tailored, ATS-friendly resume** rewritten to match the role, rendered
  with proper resume formatting (bold section headers, bulleted
  achievements, an education table) and exportable as `.docx` or `.pdf`
- A **tailored cover letter** for that specific job, also exportable as
  `.docx` or `.pdf`
- A **gap plan** that separates wording fixes (real evidence that was just
  buried) from genuine gaps (things to actually go learn, with concrete
  free resources), plus clarifying questions when the resume and the JD
  barely overlap at all

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
  model always returns a structured result, including the tailored resume
  as **structured data** (name, contact info, profile, core strengths,
  per-job bullet points, education) rather than a flat text blob — that's
  what lets it render with real resume formatting instead of a plain
  paragraph dump.
- `src/components/TailoredResumeView.tsx` renders that structured resume
  with proper typography. `src/lib/buildResumeDocx.ts` and
  `src/lib/buildResumePdf.ts` render the same structured data as a styled
  `.docx` (via the `docx` package) and `.pdf` (via `pdfmake`, with its
  fonts embedded directly in code rather than read from disk, since
  serverless bundlers can silently drop on-disk assets they can't trace).
- `src/app/api/download/route.ts` dispatches to whichever builder matches
  the requested kind (`resume` / `cover-letter`) and format (`docx` /
  `pdf`).
- The UI (`src/app/page.tsx` and `src/components/*`) handles upload, shows
  a loading state, and renders the results in tabs with copy/download
  actions.

## Deploys and database migrations

Accounts and usage tracking (LICENSING.md) added the first real database
this app has ever had. Since there's no paid shell/console access on the
current hosting tier, migrations aren't a manual step — they run
automatically as part of `npm start` (see the `"start"` script in
`package.json`): `scripts/migrate.ts` applies any pending Drizzle
migrations and then independently re-queries the live schema to confirm
every expected table actually exists, before `next start` runs. If
either step fails, the process exits non-zero and the deploy fails
loudly in the platform's own logs — the app is never allowed to come up
against an unmigrated or partially-migrated database.

**Do not remove `tsx scripts/migrate.ts &&` from the start script**
without replacing it with an equivalent migration step — this is the
only place migrations run.

## Notes

- Resume text, job description text, and analysis results are never
  persisted — each analysis request is stateless; results only live in
  the browser until you copy or download them. Accounts and usage
  counts (email, plan, how many analyses this month) are the only
  things stored in the database — never resume/JD content itself.
- The model is asked not to invent employers, titles, dates, or
  accomplishments — only to rephrase, reorder, and emphasize what's
  actually in the uploaded resume.
