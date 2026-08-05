/**
 * Deterministic JD structure detection. Marks which parts of a job
 * description are inside a structured requirements/duties section vs.
 * narrative prose, so Step 1 of the scoring prompt doesn't have to infer
 * document structure itself on every call — the exact judgment that was
 * shown to be unstable even at temperature 0.
 *
 * Two real-world shapes are handled, since a naive bullet-character
 * scan misses the harder case:
 * - Explicit bullets (-, •, *, –, —, numbered, lettered): consume
 *   consecutive bullet-prefixed lines after a heading.
 * - No bullet characters at all, just short blank-line-separated
 *   sentences under a heading (common after docx/plain-text extraction
 *   strips real list formatting — this is exactly what the UN SDG Fund
 *   JD fixture looks like): consume consecutive short paragraphs until
 *   a heading, a closing-section heading, or a paragraph long enough to
 *   read as narrative prose rather than a duty line.
 */

const BULLET_LINE = /^\s*(?:[-•◦‣▪*–—]|\d+[.)]|\(\d+\)|[a-hA-H][.)])\s+\S/;

const REQUIREMENTS_HEADING =
  /^(essential\s+(?:requirements?|skills?|qualifications?)|required\s+(?:qualifications?|skills?|experience)|requirements?|qualifications?|minimum\s+qualifications?|must[\s-]?haves?|desirable|desired(?:\s+(?:skills?|qualifications?))?|nice[\s-]to[\s-]have|preferred(?:\s+(?:qualifications?|skills?))?)\s*:?\s*$/i;

const DUTIES_HEADING =
  /^(duties\s+and\s+responsibilit(?:y|ies)|(?:key|core|main|primary|role)?\s*responsibilit(?:y|ies)|duties|scope\s+of\s+work|what\s+you.?ll\s+do)\s*:?\s*$/i;

const CLOSING_HEADING =
  /^(about\s+(?:us|the\s+(?:organization|company|role|team))|how\s+to\s+apply|equal\s+opportunity|benefits|compensation|salary|application\s+(?:process|instructions)|next\s+steps)\s*:?\s*$/i;

const MAX_HEADING_LEN = 70;
const MAX_NONBULLETED_ITEM_LEN = 220;
const MIN_SECTION_CONTENT_CHARS = 20;

type SectionType = "structured_requirements_section" | "structured_duties_list";

interface Section {
  type: SectionType;
  startLine: number;
  endLine: number; // exclusive
}

function isHeadingCandidate(line: string): boolean {
  return line.length > 0 && line.length <= MAX_HEADING_LEN;
}

function detectSections(lines: string[]): Section[] {
  const sections: Section[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();
    let type: SectionType | null = null;
    if (isHeadingCandidate(trimmed)) {
      if (REQUIREMENTS_HEADING.test(trimmed)) type = "structured_requirements_section";
      else if (DUTIES_HEADING.test(trimmed)) type = "structured_duties_list";
    }

    if (!type) {
      i++;
      continue;
    }

    let j = i + 1;
    while (j < lines.length && lines[j].trim() === "") j++;
    const start = j;

    const bulletedMode = j < lines.length && BULLET_LINE.test(lines[j]);
    let contentChars = 0;

    if (bulletedMode) {
      while (j < lines.length) {
        const t = lines[j].trim();
        if (t === "") {
          j++;
          continue;
        }
        if (BULLET_LINE.test(lines[j])) {
          contentChars += t.length;
          j++;
          continue;
        }
        break;
      }
    } else {
      while (j < lines.length) {
        const t = lines[j].trim();
        if (t === "") {
          j++;
          continue;
        }
        if (
          isHeadingCandidate(t) &&
          (REQUIREMENTS_HEADING.test(t) || DUTIES_HEADING.test(t) || CLOSING_HEADING.test(t))
        ) {
          break;
        }
        if (t.length > MAX_NONBULLETED_ITEM_LEN) break;
        contentChars += t.length;
        j++;
      }
    }

    // Guard against bare section-title lines (e.g. a repeated document
    // divider like "Duties and Responsibilities" with no colon, sitting
    // above an unrelated subsection) matching the heading pattern but not
    // actually introducing real list content before the next break.
    const end = j;
    if (end > start && contentChars >= MIN_SECTION_CONTENT_CHARS) {
      sections.push({ type, startLine: start, endLine: end });
      i = end;
    } else {
      i++;
    }
  }

  return sections;
}

const MARKER_LABEL: Record<SectionType, string> = {
  structured_requirements_section: "STRUCTURED REQUIREMENTS SECTION",
  structured_duties_list: "STRUCTURED DUTIES LIST",
};

/**
 * Wraps detected structured sections with explicit, unambiguous markers.
 * Everything outside a marker is narrative by omission — the prompt is
 * told to treat unmarked content as narrative_mention.
 */
export function annotateJdStructure(jdText: string): string {
  const lines = jdText.split("\n");
  const sections = detectSections(lines);
  if (sections.length === 0) return jdText;

  const out: string[] = [];
  let cursor = 0;
  for (const s of sections) {
    out.push(...lines.slice(cursor, s.startLine));
    out.push(`[${MARKER_LABEL[s.type]} START — deterministically detected, authoritative]`);
    out.push(...lines.slice(s.startLine, s.endLine));
    out.push(`[${MARKER_LABEL[s.type]} END]`);
    cursor = s.endLine;
  }
  out.push(...lines.slice(cursor));

  return out.join("\n");
}
