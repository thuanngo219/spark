import { describe, expect, it } from "vitest";
import { linkifyText } from "@/lib/linkify";

describe("linkifyText", () => {
  it("keeps plain text unchanged", () => {
    expect(linkifyText("Không có liên kết")).toEqual([
      { type: "text", value: "Không có liên kết" },
    ]);
  });

  it("recognizes multiple http links while preserving whitespace", () => {
    expect(linkifyText("Xem https://spark.thuanngo.com\nvà http://example.com/path")).toEqual([
      { type: "text", value: "Xem " },
      {
        type: "link",
        value: "https://spark.thuanngo.com",
        href: "https://spark.thuanngo.com",
      },
      { type: "text", value: "\nvà " },
      {
        type: "link",
        value: "http://example.com/path",
        href: "http://example.com/path",
      },
    ]);
  });

  it("adds a safe protocol to www links", () => {
    expect(linkifyText("www.example.com")).toEqual([
      {
        type: "link",
        value: "www.example.com",
        href: "https://www.example.com",
      },
    ]);
  });

  it("does not include sentence punctuation or unmatched brackets in the link", () => {
    expect(linkifyText("(https://example.com/path). Xong!")).toEqual([
      { type: "text", value: "(" },
      {
        type: "link",
        value: "https://example.com/path",
        href: "https://example.com/path",
      },
      { type: "text", value: ")." },
      { type: "text", value: " Xong!" },
    ]);
  });

  it("does not turn unsupported protocols into links", () => {
    expect(linkifyText("javascript:alert(1)")).toEqual([
      { type: "text", value: "javascript:alert(1)" },
    ]);
  });
});
