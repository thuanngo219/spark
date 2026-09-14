import { Fragment, type ReactNode } from "react";
import { contentRuns, contentToDocument, documentToContent, sliceRuns, type ContentRun } from "@/lib/content-format";
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
  if (runs.some((run) => run.list)) {
    const document = contentToDocument(value, runs);
    const paragraph = (node: NonNullable<typeof document.content>[number]) => {
      const content = documentToContent({ type: "doc", content: [node] });
      return <p>{content.description ? renderLinkedRuns(content.description, content.descriptionFormat ?? []) : <br />}</p>;
    };
    return document.content?.map((node, index) => {
      if (node.type === "paragraph") return <Fragment key={index}>{paragraph(node)}</Fragment>;
      const items = node.content?.map((item, itemIndex) => <li key={itemIndex}>{item.content?.map((p, pIndex) => <Fragment key={pIndex}>{paragraph(p)}</Fragment>)}</li>);
      return node.type === "orderedList" ? <ol key={index} start={node.attrs?.start ?? 1}>{items}</ol> : <ul key={index}>{items}</ul>;
    });
  }
  return renderLinkedRuns(value, runs);
}

function renderLinkedRuns(value: string, runs: ContentRun[]) {
  let offset = 0;
  return linkifyText(value).map((segment, index) => {
    const children = renderRuns(sliceRuns(runs, offset, offset + segment.value.length));
    offset += segment.value.length;
    return segment.type === "link"
      ? <a key={index} href={segment.href} target="_blank" rel="noopener noreferrer">{children}</a>
      : <Fragment key={index}>{children}</Fragment>;
  });
}
