"use client";

import DocumentEditor from "@/components/document-editor/DocumentEditor";
// import ClientSideDocumentEditor from "@/components/document-editor/ClientSideDocumentEditor";
import { useState } from "react";

export default function Home() {
  const [html, setHtml] = useState<string>();
  const [loading, setLoading] = useState(false);
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setLoading(true);
      if (!event.target.files || event.target.files.length === 0) {
        return; // User canceled file selection
      }

      const file = event.target.files[0];

      const response = await fetch("/api/file", {
        method: "POST",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      const { html } = await response.json();
      setHtml(html);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article
      style={{
        marginTop: "3rem",
        width: "100%",
      }}
    >
      <div
        style={{
          paddingTop: "3rem",
          paddingBottom: "3rem",
          display: "flex",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <input
          style={{
            border: "1px solid #ccc",
          }}
          type="file"
          onChange={handleFileUpload}
        />
      </div>
      {loading && <p>Loading...please wait</p>}
      <DocumentEditor initialData={html} onChange={(html) => setHtml(html)} />
    </article>
  );
}
