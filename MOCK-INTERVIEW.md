# GapLens — Mock Interview feature spec

Reference alongside CLAUDE.md, DESIGN.md, and ACTION-PLAN.md. This
extends the same evidence-based, non-inflating philosophy to spoken/
typed interview answers instead of resume text.

## Purpose

Generate interview questions targeted specifically at the JD's
essential requirements — especially ones flagged unmet or weakly
evidenced in scoring — and score answers in real time using the same
"evidence over confidence" discipline as resume scoring. A confident,
fluent, well-structured answer that doesn't actually demonstrate the
skill must not score well, for the same reason a well-worded resume
bullet doesn't get credit without real evidence behind it.

## Non-negotiable constraint

This feature must not become a "sound more confident" coach. Confident
delivery, structure, and fluency are secondary signals at most — the
primary signal is always whether the answer contains a specific,
verifiable example (a real project, a real number, a real decision)
that demonstrates the requirement being tested. A vague but articulate
answer must score lower than a specific but plainly-worded one.

## Architecture

- **Primary model**: Claude, handles question generation, real-time 
  answer scoring, and the interview conversation flow. This is the 
  core path and should work standalone.
- **Optional secondary check (Perplexity or web search)**: only used 
  when an answer makes a checkable factual/current claim (e.g. "I used 
  the new AWS Bedrock agents feature released this year") where 
  verifying currency/plausibility adds real value. This is an 
  enhancement, not a dependency — do not block the core interview flow 
  on this. Scope it to a v2 addition unless the launch timeline 
  explicitly allows for it.
- Do not add a third model (e.g. Gemini) unless there's a specific, 
  named reason — avoid multi-model complexity for its own sake.

## Step-by-step logic

STEP 1 — Generate questions from the requirements checklist
Pull directly from the standard scoring result's requirements list, 
prioritized:
1. Essential requirements marked "not_met" or "partial" — these are 
   the highest-value questions, since they test exactly what the 
   resume couldn't confirm.
2. Essential requirements marked "met" but with thin/single-instance 
   evidence — worth probing deeper to confirm the claim holds up.
3. Desirable requirements — lowest priority, include only if time 
   allows.
Generate one behavioral/technical question per prioritized requirement, 
specific enough to require a concrete example in response (not a yes/no 
or definitional question).

STEP 2 — Present one question at a time, collect the answer
Track time per question if the user has a stated time budget for the 
mock interview session (e.g. "15 minutes" → roughly 3-4 questions).

STEP 3 — Score each answer in real time
For each answer, evaluate:
- **Specificity**: does the answer name a real project, system, 
  metric, or decision — or does it stay abstract/generic?
- **Direct relevance**: does the specific example actually demonstrate 
  the requirement being tested, or is it adjacent/tangential?
- **Depth on follow-up plausibility**: does the answer contain enough 
  concrete detail that a real follow-up question (which the system 
  may or may not actually ask) could be answered — a sign of genuine 
  experience vs. a rehearsed or invented example.
Do NOT score based on: confidence of tone, articulateness, answer 
length, or use of buzzwords matching the JD's language (same 
anti-gaming principle as resume scoring — JD-mirroring language 
without concrete backing is a negative signal, not positive).

STEP 4 — Aggregate into a session report
After all questions, produce a report showing per-question scores, 
which specific resume gaps got real evidence through the interview 
(potentially upgrading a "not_met" to "met" if the answer provides 
genuine evidence the resume lacked), and which gaps remain 
unaddressed even after the interview.

STEP 5 — Feed back into the overall scoring
If an interview answer provides genuine, specific evidence for a 
previously unmet requirement, that requirement's status may update to 
"met" for the purposes of an updated overall score — but ONLY if the 
answer meets the specificity/relevance bar in Step 3, not just because 
the user talked about the topic.

## LLM prompts

### Question generation prompt

```
You are generating mock interview questions from a GapLens scoring 
result. Generate questions that specifically test the requirements 
that scoring couldn't confirm from the resume alone.

INPUT
SCORING_RESULT: <full JSON checklist>
SESSION_TIME_BUDGET: <e.g. "15 minutes">

RULES
1. Prioritize requirements in this order: essential+not_met, 
   essential+partial, essential+met-with-thin-evidence, desirable.
2. Generate one specific, example-eliciting question per prioritized 
   requirement. Bad: "Are you familiar with AWS?" Good: "Tell me about 
   a specific time you used AWS services in a production system — what 
   did you build and what problems came up?"
3. Limit the number of questions to fit SESSION_TIME_BUDGET (assume 
   roughly 3-4 minutes per question including the answer and scoring).
4. Never generate a question for a requirement with no realistic path 
   to a meaningful answer (e.g. don't ask a detailed technical 
   follow-up on a skill the resume shows zero evidence of at all — 
   ask a foundational question instead to see if any real experience 
   surfaces).

OUTPUT (valid JSON only)
{
  "questions": [
    {
      "id": "string",
      "requirement_tested": "string",
      "question": "string",
      "why_this_question": "one sentence — what this is trying to verify"
    }
  ]
}
```

### Real-time answer scoring prompt

```
You are scoring a mock interview answer against a specific job 
requirement. Your default assumption is that a fluent, confident 
answer without a concrete example does NOT demonstrate the skill. 
Score the substance, not the delivery.

INPUT
REQUIREMENT_TESTED: <string>
QUESTION_ASKED: <string>
CANDIDATE_ANSWER: <string>

RULES
1. Identify whether the answer contains a specific, named example 
   (a real project, system, metric, or decision) — not a general 
   description of skills or a hypothetical.
2. If there's a specific example, assess whether it actually 
   demonstrates REQUIREMENT_TESTED directly, or is merely adjacent/
   tangential to it.
3. Flag if the answer mirrors the question's or requirement's exact 
   language without adding independent, verifiable detail — treat 
   this as a negative signal, same as JD-mirroring in resume scoring.
4. Do not reward confidence, structure, length, or fluency on their 
   own. A short, plainly-worded answer with a real specific example 
   should outscore a long, polished, generic one.
5. If the answer provides genuine new evidence beyond what the resume 
   showed, note that this could upgrade the underlying requirement's 
   status.

OUTPUT (valid JSON only)
{
  "has_specific_example": boolean,
  "example_summary": "string, or null",
  "directly_relevant": boolean,
  "mirrors_question_language_without_substance": boolean,
  "score": integer (0-100, substance-based only),
  "requirement_status_update": "upgrade_to_met" | "no_change",
  "feedback": "one or two direct sentences — what was strong, what was 
    missing, and if applicable, what a stronger answer would have 
    included"
}
```

### Session report prompt

```
You are summarizing a completed mock interview session for a 
candidate. Compile the per-question scores into an honest overall 
report. Do not inflate the summary tone beyond what the individual 
answers actually showed.

INPUT
QUESTION_RESULTS: <array of question + scoring results from the session>
ORIGINAL_SCORING_RESULT: <the resume scoring checklist this session was 
  based on>

OUTPUT (valid JSON only)
{
  "requirements_confirmed_by_interview": ["string"],
  "requirements_still_unconfirmed": ["string"],
  "updated_score_estimate": integer,
  "strongest_answer": {"question": "string", "why": "string"},
  "weakest_answer": {"question": "string", "why": "string"},
  "honest_summary": "plain-language summary of how the interview went 
    and what it changed, if anything, about the candidate's readiness 
    for this specific role"
}
```

## UI/UX notes

- Present one question at a time, not the full list up front — this 
  keeps it feeling like a real interview, not a form.
- Show a simple timer if a time budget is set.
- Do NOT show the per-answer score live in a way that feels like a 
  game/quiz (no point-tally graphics) — keep the tone closer to a real 
  interview debrief. Feedback appears after the full session, not 
  mid-interview, unless the user explicitly asks to see it question by 
  question.
- The final report should visually connect back to the original 
  requirements checklist (DESIGN.md's requirement-row pattern) so a 
  user can see directly which unmet requirements got real evidence 
  and which are still open.
