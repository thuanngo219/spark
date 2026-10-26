"use client";

import { useId, useImperativeHandle, useState, type Ref } from "react";
import { EditorContent, Extension, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Plugin } from "@tiptap/pm/state";
import { CONTENT_LIMIT, contentLength, contentToDocument, documentToContent, type ContentRun, type ItemContent } from "@/lib/content-format";

export type ContentEditorHandle = { focusEnd: () => void };

export default function ContentEditor({ value, format, onChange, focusHandle, label, onCancel }: {
  value: string;
  format?: ContentRun[] | null;
  onChange: (content: ItemContent) => void;
  focusHandle?: Ref<ContentEditorHandle>;
  label: string;
  onCancel?: () => void;
}) {
  const counterId = useId();
  const [limitReached, setLimitReached] = useState(false);
  const editor = useEditor({
    // Both callers mount this editor only after user interaction, never during SSR.
    immediatelyRender: true,
    autofocus: false,
    enableInputRules: false,
    enablePasteRules: false,
    extensions: [
      StarterKit.configure({ blockquote: false, bulletList: false, code: false, codeBlock: false, heading: false, horizontalRule: false, link: false, listItem: false, listKeymap: false, orderedList: false, strike: false, trailingNode: false }),
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
  useImperativeHandle(focusHandle, () => ({
    focusEnd() {
      if (!editor || editor.isDestroyed) return;
      editor.commands.setTextSelection(editor.state.doc.content.size - 1);
      // Keep focus inside the originating tap: delayed autofocus cannot reliably
      // open the iOS keyboard. Scroll only the editor, never the document.
      editor.view.dom.focus({ preventScroll: true });
      editor.view.focus();
      editor.view.dom.scrollTop = editor.view.dom.scrollHeight;
    },
  }), [editor]);
  const state = useEditorState({ editor, selector: ({ editor }) => ({ bold: editor?.isActive("bold") ?? false, italic: editor?.isActive("italic") ?? false, underline: editor?.isActive("underline") ?? false }) });

  return (
    <div className="content-editor">
      <div className="content-toolbar" role="group" aria-label="Định dạng Nội dung">
        <button type="button" aria-label="In đậm" title="In đậm (⌘/Ctrl+B)" aria-pressed={state?.bold ?? false} disabled={!editor} onMouseDown={(event) => event.preventDefault()} onClick={() => editor?.chain().focus().toggleBold().run()}><strong>B</strong></button>
        <button type="button" aria-label="In nghiêng" title="In nghiêng (⌘/Ctrl+I)" aria-pressed={state?.italic ?? false} disabled={!editor} onMouseDown={(event) => event.preventDefault()} onClick={() => editor?.chain().focus().toggleItalic().run()}><em>I</em></button>
        <button type="button" aria-label="Gạch chân" title="Gạch chân (⌘/Ctrl+U)" aria-pressed={state?.underline ?? false} disabled={!editor} onMouseDown={(event) => event.preventDefault()} onClick={() => editor?.chain().focus().toggleUnderline().run()}><u>U</u></button>
        <span className="content-counter" id={counterId}>{contentLength(value).toLocaleString("vi-VN")} / 4.000</span>
      </div>
      <EditorContent editor={editor} className="content-editor-body" />
      {limitReached && <p className="form-error" role="status">Nội dung tối đa 4.000 ký tự. Hãy rút ngắn phần nhập hoặc dán.</p>}
    </div>
  );
}
