"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";
import type { CmsImage as CmsImageData } from "@/lib/cms-types";
import CmsImage from "./CmsImage";
import PdfSpread from "./PdfSpread";
import { movePublication, publicationSpread } from "@/lib/publication-spread";

export default function PdfViewer({ url, title, cover }: { url: string; title: string; cover?: CmsImageData | null }) {
  const root = useRef<HTMLElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const pagesId = useId();
  const [pagesOpen, setPagesOpen] = useState(false);
  const pageStrip = useRef<HTMLElement>(null);
  const loadStarted = useRef(0);
  const firstRenderComplete = useRef(false);
  const trace = (stage: string) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[PDF] ${stage}: ${Math.round(performance.now() - loadStarted.current)}ms`);
    }
  };
  const [hasRendered, setHasRendered] = useState(false);
  const [mode, setMode] = useState<"reader" | "flipbook">("reader");
  const touch = useRef<{ x: number; y: number } | null>(null);
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
    loadStarted.current = performance.now();
    firstRenderComplete.current = false;
    let loading: ReturnType<typeof import("pdfjs-dist").getDocument> | undefined;
    void import("pdfjs-dist").then(async (pdfjs) => {
      if (disposed) return;
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      loading = pdfjs.getDocument({
        url: `/api/publications/pdf?${new URLSearchParams({ url })}`,
        // Self-hosted pdfjs-dist 5.6.205 decoders; refresh assets when upgrading PDF.js.
        wasmUrl: "/pdfjs/wasm/",
        // Request only needed ranges instead of downloading the entire booklet
        // in parallel with the first page. Non-range servers retain full loading.
        disableStream: true,
        disableAutoFetch: true,
        rangeChunkSize: 524288,
      });
      const document = await loading.promise;
      if (!disposed) {
        trace("document loaded");
        setPdf(document);
      }
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
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
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
    if (mode !== "reader" || !pdf || !width || !canvas.current) return;
    let disposed = false;
    let task: RenderTask | undefined;
    const element = canvas.current;
    setRendering(true);
    setError("");
    void pdf.getPage(pageNumber).then(async (page) => {
      if (disposed) return;
      if (!firstRenderComplete.current) trace("first page obtained");
      const original = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: Math.min(width / original.width, 1.5) * zoom });
      // Bound the backing canvas for mobile memory limits, including large PDFs.
      const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(8_000_000 / (viewport.width * viewport.height)));
      element.width = Math.floor(viewport.width * ratio);
      element.height = Math.floor(viewport.height * ratio);
      element.style.width = `${viewport.width}px`;
      element.style.height = `${viewport.height}px`;
      if (!firstRenderComplete.current) trace("first render start");
      task = page.render({ canvas: element, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
      await task.promise;
      if (!disposed) {
        if (!firstRenderComplete.current) trace("first render complete");
        firstRenderComplete.current = true;
        setHasRendered(true);
        setRendering(false);
      }
    }).catch((reason: unknown) => {
      if (!disposed && !(reason instanceof Error && reason.name === "RenderingCancelledException")) {
        setError("This page could not be displayed. Please open the original PDF.");
        setRendering(false);
      }
    });
    return () => { disposed = true; task?.cancel(); };
  }, [pdf, pageNumber, width, zoom, mode]);

  useEffect(() => {
    const strip = pageStrip.current;
    const selected = strip?.querySelector<HTMLButtonElement>('[aria-current="page"]');
    if (!strip || !selected) return;
    // Scroll only the filmstrip, never the surrounding document.
    if (selected.offsetLeft < strip.scrollLeft) strip.scrollLeft = selected.offsetLeft;
    else if (selected.offsetLeft + selected.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollLeft = selected.offsetLeft + selected.offsetWidth - strip.clientWidth;
    }
  }, [pageNumber, hasRendered, mode, pagesOpen]);

  const wide = mode === "flipbook" && width >= 900;
  const pages = publicationSpread(pageNumber, pdf?.numPages ?? 1, wide);
  const move = (direction: number) => setPageNumber((page) => movePublication(page, pdf?.numPages ?? 1, direction, wide));

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
        <button aria-pressed={mode === "reader"} onClick={() => setMode("reader")}>Reader</button>
        <button aria-pressed={mode === "flipbook"} onClick={() => setMode("flipbook")}>Book view</button>
        <button className="pdf-secondary-control" aria-label="Previous page" disabled={!pdf || pages[0] === 1} onClick={() => move(-1)}>←</button>
        <button disabled={!pdf || !hasRendered} aria-expanded={pagesOpen} aria-controls={pagesId}
          aria-label={pdf ? `Pages ${pages.join("–")} of ${pdf.numPages}. Show or hide page navigation` : "Loading PDF"}
          onClick={() => setPagesOpen(open => !open)}>
          <span aria-live="polite">{pdf ? `${pages.join("–")} / ${pdf.numPages}` : "Loading PDF…"}</span> <span aria-hidden="true">{pagesOpen ? "▴" : "▾"}</span>
        </button>
        <button className="pdf-secondary-control" aria-label="Next page" disabled={!pdf || pages[pages.length - 1] === pdf.numPages} onClick={() => move(1)}>→</button>
        <button disabled={!pdf || zoom <= 0.5} onClick={() => setZoom((value) => Math.max(0.5, value - 0.25))} aria-label="Zoom out">−</button>
        <button disabled={!pdf || zoom >= 3} onClick={() => setZoom((value) => Math.min(3, value + 0.25))} aria-label="Zoom in">+</button>
        <button className="pdf-secondary-control" disabled={!pdf} onClick={() => setZoom(1)}>Reset zoom</button>
        {canFullscreen && <button onClick={() => {
          const action = fullscreen ? document.exitFullscreen() : root.current?.requestFullscreen();
          void action?.catch(() => {});
        }}>{fullscreen ? "Exit fullscreen" : "Fullscreen"}</button>}
      </div>
      {error && <p role="alert">{error} <a href={url} target="_blank" rel="noopener noreferrer">Open original PDF ↗</a></p>}
      {pdf && hasRendered && <nav id={pagesId} hidden={!pagesOpen} ref={pageStrip} className="pdf-page-strip" aria-label="Publication pages">
        {Array.from({ length: pdf.numPages }, (_, index) => index + 1).map(number => (
          <button key={number} type="button" aria-label={`Go to page ${number}`} aria-current={pages.includes(number) ? "page" : undefined}
            onClick={() => setPageNumber(number)}>{number}</button>
        ))}
      </nav>}
      <div className="pdf-surface" ref={surface} aria-busy={mode === "reader" && rendering && !error}
        onTouchStart={(event) => {
          const point = event.touches[0];
          touch.current = event.touches.length === 1 ? { x: point.clientX, y: point.clientY } : null;
        }}
        onTouchEnd={(event) => {
          const start = touch.current;
          touch.current = null;
          if (!start || mode !== "flipbook" || zoom !== 1) return;
          const point = event.changedTouches[0];
          const dx = point.clientX - start.x;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(point.clientY - start.y) * 1.5) move(dx < 0 ? 1 : -1);
        }}>
        {!hasRendered && !error && cover && <div className="pdf-loading-cover">
          <CmsImage image={cover} loading="eager" sizes="(max-width: 700px) 85vw, 60vw" />
          <p role="status">Loading publication…</p>
        </div>}
        {mode === "flipbook" && pdf ? <PdfSpread pdf={pdf} page={pageNumber} width={width} zoom={zoom} wide={wide} title={title} url={url} onReady={setHasRendered} onError={setError} /> : <>

        {!error && rendering && !(cover && !hasRendered) && <p role="status">Loading page…</p>}
        <canvas ref={canvas} hidden={Boolean(error) || (!hasRendered && Boolean(cover))} role="img" aria-label={`${title}, page ${pageNumber}. Open the original PDF for selectable text.`} />
        </>}
      </div>
    </section>
  );
}
