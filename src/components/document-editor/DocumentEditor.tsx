"use client";

import { useRef, useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import { pdfjs } from "react-pdf";
import { Document, Page } from "react-pdf";
//@ts-expect-error it's ok to import this mjs file required for reat-pdf
import pdfWorkerScript from "./pdf.worker.min.mjs";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import HTMLToPDFViewer from "../html-to-pdf-viewer/HtmlToPdfViewer";

// import worker - https://github.com/wojtekmaj/react-pdf#import-worker-recommended
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  pdfWorkerScript,
  window.location.origin
).toString();

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
    <div className="h-screen flex">
      {/* Left Column */}
      <div className="w-1/2 overflow-y-scroll h-full bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Document PDF Preview</h2>

        {initialData && <HTMLToPDFViewer htmlString={initialData} />}
      </div>

      {/* Right Column */}
      <div className="w-1/2 overflow-y-scroll h-full bg-gray-200 p-4">
        <h2 className="text-xl font-bold mb-4">Edit Document</h2>
        <div className="editor-container">
          <div className="editor-toolbar" ref={toolbarRef} />
          {ready && (
            <CKEditor
              editor={DecoupledEditor as any}
              data={initialData}
              onReady={(editor) => {
                if (toolbarRef.current) {
                  toolbarRef.current.appendChild(
                    editor.ui.view.toolbar!.element!
                  );
                }
              }}
              onChange={(_, editor) => {
                onChange?.(editor.getData());
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
