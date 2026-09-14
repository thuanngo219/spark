"use client";

import { useId, useState } from "react";
import { EditorContent, Extension, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ListItem } from "@tiptap/extension-list";
import { Plugin } from "@tiptap/pm/state";
import { Icon } from "@/components/ui/Icon";
import { CONTENT_LIMIT, contentLength, contentToDocument, documentToContent, type ContentRun, type ItemContent } from "@/lib/content-format";

export default function ContentEditor({ value, format, onChange, autoFocus = false, label, onCancel }: {
  value: string;
  format?: ContentRun[] | null;
  onChange: (content: ItemContent) => void;
  autoFocus?: boolean;
  label: string;
  onCancel?: () => void;
}) {
  const counterId = useId();
  const [limitReached, setLimitReached] = useState(false);
  const editor = useEditor({
    immediatelyRender: false,
    autofocus: autoFocus ? "end" : false,
    enableInputRules: false,
    enablePasteRules: false,
    extensions: [
      StarterKit.configure({ blockquote: false, code: false, codeBlock: false, heading: false, horizontalRule: false, link: false, listItem: false, strike: false, trailingNode: false }),
      // Basic, single-level lists. Keep each item a paragraph so the persisted
      // text runs can round-trip without hidden nested structures.
      ListItem.extend({ content: "paragraph" }),
      Extension.create({
        name: "sparkContentLimit",
        addProseMirrorPlugins() {
          return [new Plugin({
            filterTransaction(transaction, state) {
              if (!transaction.docChanged) return true;
              const next = contentLength(documentToContent(transaction.doc.toJSON()).description ?? "");
              const previous = contentLength(documentToContent(state.doc.toJSON()).description ?? "");
              const allowed = next <= CONTENT_LIMIT || next <= previous;
              setLimitReached(!allowed);
              return allowed;
            },
          })];
        },
      }),
    ],
    content: contentToDocument(value, format),
    editorProps: {
      attributes: { class: "content-editor-input", role: "textbox", "aria-label": label, "aria-multiline": "true", "aria-describedby": counterId },
      handleKeyDown: (_view, event) => {
        if (event.key === "Escape" && onCancel) {
          event.preventDefault();
          event.stopPropagation();
          onCancel();
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => onChange(documentToContent(editor.getJSON())),
  });
  const state = useEditorState({ editor, selector: ({ editor }) => ({ bold: editor?.isActive("bold") ?? false, italic: editor?.isActive("italic") ?? false, underline: editor?.isActive("underline") ?? false, bullet: editor?.isActive("bulletList") ?? false, ordered: editor?.isActive("orderedList") ?? false }) });

  return (
    <div className="content-editor">
      <div className="content-toolbar" role="group" aria-label="Định dạng Nội dung">
        <button type="button" aria-label="In đậm" title="In đậm (⌘/Ctrl+B)" aria-pressed={state?.bold ?? false} disabled={!editor} onMouseDown={(event) => event.preventDefault()} onClick={() => editor?.chain().focus().toggleBold().run()}><strong>B</strong></button>
        <button type="button" aria-label="In nghiêng" title="In nghiêng (⌘/Ctrl+I)" aria-pressed={state?.italic ?? false} disabled={!editor} onMouseDown={(event) => event.preventDefault()} onClick={() => editor?.chain().focus().toggleItalic().run()}><em>I</em></button>
        <button type="button" aria-label="Gạch chân" title="Gạch chân (⌘/Ctrl+U)" aria-pressed={state?.underline ?? false} disabled={!editor} onMouseDown={(event) => event.preventDefault()} onClick={() => editor?.chain().focus().toggleUnderline().run()}><u>U</u></button>
        <button type="button" aria-label="Danh sách dấu đầu dòng" title="Danh sách dấu đầu dòng" aria-pressed={state?.bullet ?? false} disabled={!editor} onMouseDown={(event) => event.preventDefault()} onClick={() => editor?.chain().focus().toggleBulletList().run()}><Icon name="list" size={18} /></button>
        <button type="button" aria-label="Danh sách đánh số" title="Danh sách đánh số" aria-pressed={state?.ordered ?? false} disabled={!editor} onMouseDown={(event) => event.preventDefault()} onClick={() => editor?.chain().focus().toggleOrderedList().run()}><Icon name="list-ordered" size={18} /></button>
        <span className="content-counter" id={counterId}>{contentLength(value).toLocaleString("vi-VN")} / 4.000</span>
      </div>
      <EditorContent editor={editor} className="content-editor-body" />
      {limitReached && <p className="form-error" role="status">Nội dung tối đa 4.000 ký tự. Hãy rút ngắn phần nhập hoặc dán.</p>}
    </div>
  );
}
