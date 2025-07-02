"use client";

import { useRef, useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";

export default function DocumentEditor({
  initialData,
  onChange,
}: {
  initialData?: string;
  onChange?: (data: string) => void;
}) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    return () => setReady(false);
  }, []);

  return (
    <div className="editor-container">
      <div className="editor-toolbar" ref={toolbarRef} />
      {ready && (
        <CKEditor
          editor={DecoupledEditor as any}
          data={initialData}
          onReady={(editor) => {
            if (toolbarRef.current) {
              toolbarRef.current.appendChild(editor.ui.view.toolbar!.element!);
            }
          }}
          onChange={(_, editor) => {
            onChange?.(editor.getData());
          }}
        />
      )}
    </div>
  );
}
