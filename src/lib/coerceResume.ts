import { str } from "./normalize";
import type { ResumeBullet, ResumeExperienceEntry, ResumeEducationEntry, TailoredResume } from "./types";

function coerceBullet(b: unknown): ResumeBullet {
  const obj = typeof b === "object" && b !== null ? (b as Record<string, unknown>) : {};
  return { label: str(obj.label), text: str(obj.text) };
}

function coerceBullets(arr: unknown): ResumeBullet[] {
  return Array.isArray(arr) ? arr.map(coerceBullet) : [];
}

/** Re-parses a TailoredResume that came back over the wire (client request body) into a trusted shape — shared by every route that accepts a resume object from the client (download, length-trim). */
export function coerceResume(input: unknown): TailoredResume | null {
  if (typeof input !== "object" || input === null) return null;
  const obj = input as Record<string, unknown>;
  const experience = Array.isArray(obj.experience) ? obj.experience : [];
  const education = Array.isArray(obj.education) ? obj.education : [];

  return {
    name: str(obj.name),
    title: str(obj.title),
    phone: str(obj.phone),
    email: str(obj.email),
    linkedin: str(obj.linkedin),
    location: str(obj.location),
    profile: str(obj.profile),
    objective: str(obj.objective),
    coreStrengths: coerceBullets(obj.coreStrengths),
    experience: experience.map((e): ResumeExperienceEntry => {
      const eo = typeof e === "object" && e !== null ? (e as Record<string, unknown>) : {};
      return {
        title: str(eo.title),
        company: str(eo.company),
        location: str(eo.location),
        dates: str(eo.dates),
        bullets: coerceBullets(eo.bullets),
      };
    }),
    education: education
      .filter((ed): ed is Record<string, unknown> => typeof ed === "object" && ed !== null)
      .map(
        (ed): ResumeEducationEntry => ({
          program: str(ed.program),
          institution: str(ed.institution),
          date: str(ed.date),
        }),
      ),
  };
}
