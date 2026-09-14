import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FormattedContent } from "@/components/FormattedContent";
import { contentLength, contentRuns, contentToDocument, documentToContent, normalizeContent } from "./content-format";

describe("basic content formatting", () => {
  it("removes legacy list formatting while preserving text, marks and line breaks", () => {
    const description = "Một\nHai\nBa";
    const format = [{ text: "Một", list: "bullet", bold: true }, { text: "\nHai", list: "bullet" }, { text: "\nBa", list: "ordered", listStart: 3, italic: true }];
    const content = normalizeContent(description, format);
    expect(content.description).toBe(description);
    expect(content.descriptionFormat).toEqual([{ text: "Một", bold: true }, { text: "\nHai" }, { text: "\nBa", italic: true }]);
    expect(contentToDocument(description, format).content?.every(node => node.type === "paragraph")).toBe(true);
    const html = renderToStaticMarkup(createElement(FormattedContent, { value: description, format: content.descriptionFormat }));
    expect(html).toContain("<strong>Một</strong>");
    expect(html).not.toMatch(/<(ul|ol|li)[ >]/);
    expect(documentToContent(contentToDocument(description, format)).description).toBe(description);
  });
  it("keeps list text at the 4000-character boundary and drops stale list metadata", () => {
    const description = "🙂".repeat(3998) + "\nB";
    const runs = [{ text: description, list: "bullet" as const }];
    expect(contentLength(documentToContent(contentToDocument(description, runs)).description!)).toBe(4000);
    expect(contentToDocument("Edited", runs).content?.[0].type).toBe("paragraph");
  });
  it("round-trips overlapping formats, Vietnamese, emoji and blank lines", () => {
    const runs = [{ text: "Chào ", bold: true as const }, { text: "Thuận", bold: true as const, italic: true as const, underline: true as const }, { text: "\n\n🙂 Kết thúc" }];
    const description = runs.map((run) => run.text).join("");
    expect(documentToContent(contentToDocument(description, runs))).toEqual({ description, descriptionFormat: runs });
  });
  it("keeps old plain text, including literal HTML, as text", () => {
    const text = "<b>Không phải HTML</b>\n<script>alert(1)</script>";
    expect(documentToContent(contentToDocument(text)).description).toBe(text);
    const html = renderToStaticMarkup(createElement(FormattedContent, { value: text }));
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
  it("trims text and matching marks together without mutating the input", () => {
    const runs = [{ text: "  A", bold: true as const }, { text: "B  ", underline: true as const }];
    expect(normalizeContent("  AB  ", runs)).toEqual({ description: "AB", descriptionFormat: [{ text: "A", bold: true }, { text: "B", underline: true }] });
    expect(runs[0].text).toBe("  A");
    expect(normalizeContent(" \n ", runs)).toEqual({ description: null, descriptionFormat: null });
  });
  it("ignores malformed, unapproved and stale formatting", () => {
    expect(contentRuns("AB", [{ text: "Old", bold: true }])).toEqual([{ text: "AB" }]);
    expect(contentRuns("AB", [{ text: 123 }])).toEqual([{ text: "AB" }]);
    expect(contentRuns("AB", [{ text: "AB", bold: "yes", href: "javascript:alert(1)", style: "color:red" }])).toEqual([{ text: "AB" }]);
  });
  it("keeps a URL whole when formatting changes halfway through", () => {
    const value = "https://example.com";
    const html = renderToStaticMarkup(createElement(FormattedContent, { value, format: [{ text: "https://", bold: true }, { text: "example.com", italic: true }] }));
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain("<strong>https://</strong><em>example.com</em>");
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it("counts code points like Postgres, including line breaks", () => {
    expect(contentLength("🙂".repeat(4000))).toBe(4000);
    expect(contentLength("a\nb")).toBe(3);
    expect(documentToContent({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "A" }, { type: "hardBreak" }, { type: "text", text: "B" }] }] }).description).toBe("A\nB");
  });
});
