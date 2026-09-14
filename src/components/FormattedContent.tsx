import { Fragment, type ReactNode } from "react";
import { contentRuns, sliceRuns, type ContentRun } from "@/lib/content-format";
import { linkifyText } from "@/lib/linkify";

function renderRuns(runs: ContentRun[]) {
  return runs.map((run, index) => {
    let text: ReactNode = run.text;
    if (run.bold) text = <strong>{text}</strong>;
    if (run.italic) text = <em>{text}</em>;
    if (run.underline) text = <u>{text}</u>;
    return <Fragment key={index}>{text}</Fragment>;
  });
}

export function FormattedContent({ value, format }: { value: string; format?: ContentRun[] | null }) {
  const runs = contentRuns(value, format);
  let offset = 0;
  return linkifyText(value).map((segment, index) => {
    const children = renderRuns(sliceRuns(runs, offset, offset + segment.value.length));
    offset += segment.value.length;
    return segment.type === "link"
      ? <a key={index} href={segment.href} target="_blank" rel="noopener noreferrer">{children}</a>
      : <Fragment key={index}>{children}</Fragment>;
  });
}
