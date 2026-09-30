"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

export default function PdfViewer({ url, title }: { url: string; title: string }) {
  const root = useRef<HTMLElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);
  const [error, setError] = useState("");
  const [rendering, setRendering] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => {
    let disposed = false;
    let loading: ReturnType<typeof import("pdfjs-dist").getDocument> | undefined;
    void import("pdfjs-dist").then(async (pdfjs) => {
      if (disposed) return;
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      loading = pdfjs.getDocument({ url });
      const document = await loading.promise;
      if (!disposed) setPdf(document);
    }).catch(() => {
      if (!disposed) setError("This PDF could not be loaded. Please open the original PDF.");
    });
    return () => {
      disposed = true;
      void loading?.destroy();
    };
  }, [url]);

  useEffect(() => {
    const element = surface.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    setCanFullscreen(Boolean(document.fullscreenEnabled));
    const changed = () => setFullscreen(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", changed);
    return () => {
      observer.disconnect();
      document.removeEventListener("fullscreenchange", changed);
    };
  }, []);

  useEffect(() => {
    if (!pdf || !width || !canvas.current) return;
    let disposed = false;
    let task: RenderTask | undefined;
    const element = canvas.current;
    setRendering(true);
    setError("");
    void pdf.getPage(pageNumber).then(async (page) => {
      if (disposed) return;
      const original = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(width / original.width, 1.5) * zoom });
      // Bound the backing canvas for mobile memory limits, including large PDFs.
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(8_000_000 / (viewport.width * viewport.height)));
      element.width = Math.floor(viewport.width * ratio);
      element.height = Math.floor(viewport.height * ratio);
      element.style.width = `${viewport.width}px`;
      element.style.height = `${viewport.height}px`;
      task = page.render({ canvas: element, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
      await task.promise;
      if (!disposed) setRendering(false);
    }).catch((reason: unknown) => {
      if (!disposed && !(reason instanceof Error && reason.name === "RenderingCancelledException")) {
        setError("This page could not be displayed. Please open the original PDF.");
        setRendering(false);
      }
    });
    return () => { disposed = true; task?.cancel(); };
  }, [pdf, pageNumber, width, zoom]);

  const move = (direction: number) => setPageNumber((page) => Math.max(1, Math.min(pdf?.numPages ?? 1, page + direction)));

  return (
    <section className="pdf-viewer" ref={root} aria-label={`${title} PDF reader`} tabIndex={0}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}>
      <div className="pdf-toolbar" role="group" aria-label="PDF controls">
        <button disabled={!pdf || pageNumber === 1} onClick={() => move(-1)}>Previous</button>
        <span aria-live="polite">{pdf ? `${pageNumber} / ${pdf.numPages}` : "Loading PDF…"}</span>
        <button disabled={!pdf || pageNumber === pdf.numPages} onClick={() => move(1)}>Next</button>
        <button disabled={!pdf || zoom <= 0.5} onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))} aria-label="Zoom out">−</button>
        <button disabled={!pdf || zoom >= 3} onClick={() => setZoom((value) => Math.min(3, value + 0.25))} aria-label="Zoom in">+</button>
        <button disabled={!pdf} onClick={() => setZoom(1)}>Reset zoom</button>
        {canFullscreen && <button onClick={() => {
          const action = fullscreen ? document.exitFullscreen() : root.current?.requestFullscreen();
          void action?.catch(() => {});
        }}>{fullscreen ? "Exit fullscreen" : "Fullscreen"}</button>}
      </div>
      {error && <p role="alert">{error} <a href={url} target="_blank" rel="noopener noreferrer">Open original PDF ↗</a></p>}
      <div className="pdf-surface" ref={surface} aria-busy={rendering && !error}>
        {!error && rendering && <p role="status">Loading page…</p>}
        <canvas ref={canvas} hidden={Boolean(error)} role="img" aria-label={`${title}, page ${pageNumber}. Open the original PDF for selectable text.`} />
      </div>
    </section>
  );
}
