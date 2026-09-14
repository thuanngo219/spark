import type { JSONContent } from "@tiptap/react";

export const CONTENT_LIMIT = 4000;
export type ContentRun = { text: string; bold?: true; italic?: true; underline?: true };
export type ItemContent = { description: string | null; descriptionFormat: ContentRun[] | null };

export function contentLength(text: string) {
  return Array.from(text).length;
}

function sameMarks(a: ContentRun, b: ContentRun) {
  return a.bold === b.bold && a.italic === b.italic && a.underline === b.underline;
}

export function mergeRuns(runs: ContentRun[]): ContentRun[] {
  const result: ContentRun[] = [];
  for (const run of runs) {
    if (!run.text) continue;
    const previous = result.at(-1);
    if (previous && sameMarks(previous, run)) previous.text += run.text;
    else result.push({ ...run });
  }
  return result;
}

// Unknown JSON never becomes HTML. Ignore stale formatting from an older client
// that changed description without updating its accompanying formatting.
export function contentRuns(description: string | null, format: unknown): ContentRun[] {
  const text = description ?? "";
  if (!Array.isArray(format) || format.length > CONTENT_LIMIT * 2) return [{ text }];
  const runs: ContentRun[] = [];
  for (const entry of format) {
    if (!entry || typeof entry !== "object" || typeof entry.text !== "string") return [{ text }];
    runs.push({ text: entry.text, ...(entry.bold === true && { bold: true }), ...(entry.italic === true && { italic: true }), ...(entry.underline === true && { underline: true }) });
  }
  return runs.map((run) => run.text).join("") === text ? mergeRuns(runs) : [{ text }];
}

export function sliceRuns(runs: ContentRun[], start: number, end: number): ContentRun[] {
  let offset = 0;
  return runs.flatMap((run) => {
    const from = Math.max(0, start - offset);
    const to = Math.min(run.text.length, end - offset);
    offset += run.text.length;
    return to > from ? [{ ...run, text: run.text.slice(from, to) }] : [];
  });
}

export function normalizeContent(description: string | null, format?: unknown): ItemContent {
  const raw = description ?? "";
  const text = raw.trim();
  const start = raw.length - raw.trimStart().length;
  const runs = sliceRuns(contentRuns(raw, format), start, start + text.length);
  return {
    description: text || null,
    descriptionFormat: runs.some((run) => run.bold || run.italic || run.underline) ? mergeRuns(runs) : null,
  };
}

export function documentToContent(document: JSONContent): ItemContent {
  const runs: ContentRun[] = [];
  for (const [index, paragraph] of (document.content ?? []).entries()) {
    if (index) runs.push({ text: "\n" });
    for (const node of paragraph.content ?? []) {
      if (node.type === "hardBreak") runs.push({ text: "\n" });
      if (node.type !== "text" || !node.text) continue;
      const marks = new Set(node.marks?.map((mark) => mark.type));
      runs.push({ text: node.text, ...(marks.has("bold") && { bold: true }), ...(marks.has("italic") && { italic: true }), ...(marks.has("underline") && { underline: true }) });
    }
  }
  const merged = mergeRuns(runs);
  return { description: merged.map((run) => run.text).join(""), descriptionFormat: merged };
}

export function contentToDocument(description: string | null, format?: unknown): JSONContent {
  const runs = contentRuns(description, format);
  const paragraphs: JSONContent[] = [{ type: "paragraph", content: [] }];
  for (const run of runs) {
    const marks = ["bold", "italic", "underline"].filter((mark) => run[mark as keyof ContentRun] === true).map((type) => ({ type }));
    run.text.split("\n").forEach((text, index) => {
      if (index) paragraphs.push({ type: "paragraph", content: [] });
      if (text) paragraphs.at(-1)!.content!.push({ type: "text", text, marks });
    });
  }
  return { type: "doc", content: paragraphs };
}
