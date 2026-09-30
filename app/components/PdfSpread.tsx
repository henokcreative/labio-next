"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, PDFPageProxy, RenderTask } from "pdfjs-dist";
import { publicationSpread } from "@/lib/publication-spread";

type Props = {
  pdf: PDFDocumentProxy;
  page: number;
  width: number;
  zoom: number;
  wide: boolean;
  title: string;
  url: string;
  onReady?: (ready: boolean) => void;
  onError?: (message: string) => void;
};

export default function PdfSpread({ pdf, page, width, zoom, wide, title, url, onReady, onError }: Props) {
  const book = useRef<HTMLDivElement>(null);
  const left = useRef<HTMLCanvasElement>(null);
  const right = useRef<HTMLCanvasElement>(null);
  const previous = useRef<number | null>(null);
  const [status, setStatus] = useState("Loading spread…");
  const [failed, setFailed] = useState(false);
  const pages = publicationSpread(page, pdf.numPages, wide);
  const first = pages[0];
  const last = pages[pages.length - 1];

  useEffect(() => {
    if (!width || !book.current || !left.current || !right.current) return;
    const host = book.current;
    const canvases = [left.current, right.current];
    const tasks: RenderTask[] = [];
    const loaded: PDFPageProxy[] = [];
    const buffers: HTMLCanvasElement[] = [];
    const animations: Animation[] = [];
    let leaf: HTMLCanvasElement | undefined;
    let disposed = false;
    setStatus("Loading spread…");
    setFailed(false);

    async function render() {
      const numbers = first === last ? [first] : [first, last];
      const pageWidth = Math.max(1, (width - (wide ? 2 : 0)) / (wide ? 2 : 1));
      for (const number of numbers) {
        const pdfPage = await pdf.getPage(number);
        if (disposed) return;
        loaded.push(pdfPage);
        const original = pdfPage.getViewport({ scale: 1 });
        const viewport = pdfPage.getViewport({ scale: Math.min(pageWidth / original.width, 1.5) * zoom });
        const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3_000_000 / (viewport.width * viewport.height)));
        const buffer = document.createElement("canvas");
        buffers.push(buffer);
        buffer.width = Math.max(1, Math.floor(viewport.width * ratio));
        buffer.height = Math.max(1, Math.floor(viewport.height * ratio));
        buffer.style.width = `${viewport.width}px`;
        buffer.style.height = `${viewport.height}px`;
        const task = pdfPage.render({ canvas: buffer, viewport, transform: [ratio, 0, 0, ratio, 0, 0] });
        tasks.push(task);
        await task.promise;
        if (disposed) return;
      }

      const forward = previous.current === null || first > previous.current;
      const animate = previous.current !== null && previous.current !== first
        && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (animate) {
        const source = forward && !canvases[1].hidden ? canvases[1] : canvases[0];
        leaf = document.createElement("canvas");
        leaf.className = "pdf-turn-leaf";
        leaf.setAttribute("aria-hidden", "true");
        leaf.width = source.width;
        leaf.height = source.height;
        leaf.style.width = source.style.width;
        leaf.style.height = source.style.height;
        leaf.style.left = `${source.offsetLeft}px`;
        leaf.style.top = `${source.offsetTop}px`;
        leaf.style.transformOrigin = forward ? "left center" : "right center";
        leaf.getContext("2d")?.drawImage(source, 0, 0);
        host.appendChild(leaf);
        const turn = leaf.animate([
          { transform: "rotateY(0deg)" },
          { transform: `rotateY(${forward ? -88 : 88}deg)` },
        ], { duration: 180, easing: "ease-in", fill: "forwards" });
        animations.push(turn);
        await turn.finished;
        if (disposed) return;
      }

      canvases.forEach((canvas, index) => {
        const buffer = buffers[index];
        canvas.hidden = !buffer;
        if (!buffer) { canvas.width = canvas.height = 0; return; }
        canvas.width = buffer.width;
        canvas.height = buffer.height;
        canvas.style.width = buffer.style.width;
        canvas.style.height = buffer.style.height;
        canvas.getContext("2d")?.drawImage(buffer, 0, 0);
        canvas.setAttribute("aria-label", `${title}, page ${numbers[index]}`);
      });
      leaf?.remove();
      if (leaf) leaf.width = leaf.height = 0;
      if (animate) {
        const arriving = forward ? canvases[0] : canvases[buffers.length - 1];
        arriving.style.transformOrigin = forward ? "right center" : "left center";
        const turn = arriving.animate([
          { transform: `rotateY(${forward ? 88 : -88}deg)` },
          { transform: "rotateY(0deg)" },
        ], { duration: 180, easing: "ease-out" });
        animations.push(turn);
        await turn.finished;
        if (disposed) return;
      }
      previous.current = first;
      setStatus("");
      onReady?.(true);
    }

    void render().catch(() => {
      if (!disposed) {
        setFailed(true);
        setStatus("Unable to display this spread. Open the original PDF below.");
        onError?.("This spread could not be displayed. Please open the original PDF.");
      }
    }).finally(() => {
      buffers.forEach((buffer) => { buffer.width = buffer.height = 0; });
      loaded.forEach((pdfPage) => pdfPage.cleanup());
    });
    return () => {
      disposed = true;
      tasks.forEach((task) => task.cancel());
      animations.forEach((animation) => animation.cancel());
      leaf?.remove();
      if (leaf) leaf.width = leaf.height = 0;
    };
  }, [pdf, first, last, width, zoom, wide, title, onReady, onError]);

  return (
    <>
      <p className="pdf-spread-status" role={failed ? "alert" : "status"}>{status || `Pages ${first}${last !== first ? `–${last}` : ""}`}</p>
      <div className="pdf-book" ref={book} aria-busy={Boolean(status) && !failed}>
        <canvas ref={left} role="img" aria-label={`${title}, page ${first}`} />
        <canvas ref={right} role="img" hidden aria-label={`${title}, page ${last}`} />
      </div>
      <a className="pdf-original" href={url} target="_blank" rel="noopener noreferrer">Open original PDF ↗</a>
    </>
  );
}
