import React, { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

async function generateMultiPagePdf(doc: Document) {
  // 1) Render entire HTML to one big canvas
  const canvas = await html2canvas(doc.body, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
  });

  // 2) Create jsPDF with A4-px dimensions
  const pdf = new jsPDF({
    unit: "px",
    format: "a4",
    orientation: "portrait",
  });
  const pageWidth = pdf.internal.pageSize.getWidth(); // e.g. ≈595px
  const pageHeight = pdf.internal.pageSize.getHeight(); // e.g. ≈842px

  // 3) Calculate number of pages
  const totalHeight = (canvas.height * pageWidth) / canvas.width;
  const pageCount = Math.ceil(totalHeight / pageHeight);

  // 4) For each page, copy the correct slice into a temp canvas
  for (let pageIndex = 0; pageIndex < pageCount; pageIndex++) {
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    // compute slice height in original canvas pixels
    const sliceHeightPx = (canvas.width * pageHeight) / pageWidth;
    sliceCanvas.height = sliceHeightPx;

    const ctx = sliceCanvas.getContext("2d")!;
    // draw the slice from the big canvas
    ctx.drawImage(
      canvas,
      0,
      pageIndex * sliceHeightPx, // source Y
      canvas.width,
      sliceHeightPx,
      0,
      0,
      canvas.width,
      sliceHeightPx
    );

    // convert slice to image data
    const imgData = sliceCanvas.toDataURL("image/png");
    // add to PDF, scaled to full page width/height
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);

    // add a new page if not the last slice
    if (pageIndex < pageCount - 1) {
      pdf.addPage();
    }
  }

  return { blob: pdf.output("blob"), pageCount };
}

const HTMLToPDFViewer = ({ htmlString }: { htmlString: string }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);

  const html = `<!DOCTYPE html><html><head><style>
    body { font-family: Arial; font-size: 16px; padding: 30px; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid black; padding: 6px; text-align: left; }
    img { max-width: 100%; }
  </style></head><body>
    ${htmlString}
  </body></html>`;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(async () => {
      const { blob, pageCount } = await generateMultiPagePdf(doc);
      setPdfUrl(URL.createObjectURL(blob));
      setNumPages(pageCount);
    }, 500);
  }, [html, htmlString]);

  return (
    <div className="flex h-screen bg-gray-200">
      {/* offscreen iframe for PDF generation */}
      <iframe
        ref={iframeRef}
        title="hidden-html"
        style={{
          position: "absolute",
          left: -9999,
          top: 0,
          width: 1024,
          height: 2000,
        }}
      />

      {/* viewer area */}
      <div
        className="
          flex-1 
          overflow-y-auto 
          p-6 
          snap-y snap-mandatory 
          scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200
          bg-gray-100 
        "
      >
        <div className="flex flex-col items-center space-y-8">
          {pdfUrl ? (
            Array.from({ length: numPages }).map((_, i) => (
              <div
                key={i}
                className="
                    bg-white 
                    shadow-2xl 
                    rounded-lg 
                    snap-start 
                    overflow-hidden
                    border border-gray-300
                  "
                style={{ width: 595, height: 842 }} // A4 in px at 72dpi
              >
                <Document file={pdfUrl} loading="" noData="">
                  <Page
                    pageNumber={i + 1}
                    width={595}
                    className="select-none"
                  />
                </Document>
              </div>
            ))
          ) : (
            <p className="text-gray-600">Generating PDF…</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HTMLToPDFViewer;
