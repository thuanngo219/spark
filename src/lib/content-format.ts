import type { JSONContent } from "@tiptap/react";

export const CONTENT_LIMIT = 4000;
export type ContentRun = { text: string; bold?: true; italic?: true; underline?: true; list?: "bullet" | "ordered"; listStart?: number; softBreak?: true };
export type ItemContent = { description: string | null; descriptionFormat: ContentRun[] | null };

export function contentLength(text: string) {
  return Array.from(text).length;
}

function sameMarks(a: ContentRun, b: ContentRun) {
  return a.bold === b.bold && a.italic === b.italic && a.underline === b.underline && a.list === b.list && a.listStart === b.listStart && a.softBreak === b.softBreak;
}

export function mergeRuns(runs: ContentRun[]): ContentRun[] {
  const result: ContentRun[] = [];
  for (const run of runs) {
    if (!run.text) continue;
    const previous = result.at(-1);
    if (previous && !run.softBreak && sameMarks(previous, run)) previous.text += run.text;
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
    const list = entry.list === "bullet" || entry.list === "ordered" ? entry.list : undefined;
    runs.push({ text: entry.text, ...(entry.bold === true && { bold: true }), ...(entry.italic === true && { italic: true }), ...(entry.underline === true && { underline: true }), ...(list && { list }), ...(list === "ordered" && { listStart: Number.isSafeInteger(entry.listStart) && entry.listStart > 0 && entry.listStart <= 1000000 ? entry.listStart : 1 }), ...(entry.softBreak === true && entry.text === "\n" && { softBreak: true }) });
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
    descriptionFormat: runs.some((run) => run.bold || run.italic || run.underline || run.list || run.softBreak) ? mergeRuns(runs) : null,
  };
}

export function documentToContent(document: JSONContent): ItemContent {
  const runs: ContentRun[] = [];
  let paragraphCount = 0;
  const paragraphRuns = (paragraph: JSONContent, list?: "bullet" | "ordered", listStart?: number) => {
    const metadata = { ...(list && { list }), ...(list === "ordered" && { listStart }) };
    if (paragraphCount++) runs.push({ text: "\n", ...metadata });
    for (const node of paragraph.content ?? []) {
      if (node.type === "hardBreak") runs.push({ text: "\n", softBreak: true, ...metadata });
      if (node.type !== "text" || !node.text) continue;
      const marks = new Set(node.marks?.map((mark) => mark.type));
      runs.push({ text: node.text, ...metadata, ...(marks.has("bold") && { bold: true }), ...(marks.has("italic") && { italic: true }), ...(marks.has("underline") && { underline: true }) });
    }
  };
  for (const block of document.content ?? []) {
    if (block.type === "paragraph") paragraphRuns(block);
    if (block.type === "bulletList" || block.type === "orderedList") {
      const start = Number.isSafeInteger(block.attrs?.start) && block.attrs!.start > 0 ? block.attrs!.start : 1;
      for (const [index, item] of (block.content ?? []).entries()) {
        for (const paragraph of item.content ?? []) paragraphRuns(paragraph, block.type === "bulletList" ? "bullet" : "ordered", start + index);
      }
    }
  }
  const merged = mergeRuns(runs);
  return { description: merged.map((run) => run.text).join(""), descriptionFormat: merged };
}

export function contentToDocument(description: string | null, format?: unknown): JSONContent {
  const runs = contentRuns(description, format);
  const blocks: { paragraph: JSONContent; list?: "bullet" | "ordered"; start?: number }[] = [{ paragraph: { type: "paragraph", content: [] } }];
  for (const run of runs) {
    const marks = ["bold", "italic", "underline"].filter((mark) => run[mark as keyof ContentRun] === true).map((type) => ({ type }));
    if (run.softBreak) { blocks.at(-1)!.paragraph.content!.push({ type: "hardBreak" }); continue; }
    run.text.split("\n").forEach((text, index) => {
      if (index) blocks.push({ paragraph: { type: "paragraph", content: [] }, list: run.list, start: run.listStart });
      const block = blocks.at(-1)!;
      if (text) {
        block.list = run.list; block.start = run.listStart;
        block.paragraph.content!.push({ type: "text", text, marks });
      }
    });
  }
  const content: JSONContent[] = [];
  for (const block of blocks) {
    if (!block.list) { content.push(block.paragraph); continue; }
    const type = block.list === "bullet" ? "bulletList" : "orderedList";
    let list = content.at(-1);
    if (list?.type !== type || (type === "orderedList" && block.start !== (list.attrs?.start ?? 1) + (list.content?.length ?? 0))) {
      list = { type, ...(type === "orderedList" && { attrs: { start: block.start ?? 1 } }), content: [] };
      content.push(list);
    }
    list!.content!.push({ type: "listItem", content: [block.paragraph] });
  }
  return { type: "doc", content };
}
