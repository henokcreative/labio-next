"use client";

import { use, useCallback, useEffect, useState } from "react";
import PortalShell from "@/app/components/PortalShell";
import { apiFetch } from "@/lib/api";
import type { PortalMessage, Project, ProjectFile } from "@/lib/portal-types";

type FileAccess = { url: string };

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project>();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [nextProject, nextFiles, nextMessages] = await Promise.all([
        apiFetch<Project>(`/api/projects/${id}/`),
        apiFetch<ProjectFile[]>(`/api/projects/${id}/files/`),
        apiFetch<PortalMessage[]>(`/api/messages/?project=${id}`),
      ]);
      setProject(nextProject); setFiles(nextFiles); setMessages(nextMessages);
    } catch (nextError) { setError((nextError as Error).message); }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    try { await apiFetch<PortalMessage>("/api/messages/", { method: "POST", body: JSON.stringify({ project: id, content }) }); setContent(""); await load(); }
    catch (nextError) { setError((nextError as Error).message); }
  }

  async function respondToApproval(fileId: number, status: "approved" | "changes_requested") {
    try { await apiFetch(`/api/projects/${id}/approve/`, { method: "POST", body: JSON.stringify({ file_id: fileId, status, comment }) }); setComment(""); await load(); }
    catch (nextError) { setError((nextError as Error).message); }
  }

  async function previewProtectedFile(endpoint: string) {
    try {
      const { url } = await apiFetch<FileAccess>(endpoint);
      window.location.assign(url);
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  async function downloadProtectedFile(endpoint: string, filename: string) {
    try {
      const { url } = await apiFetch<FileAccess>(endpoint);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_self";
      link.rel = "noopener noreferrer";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  return <PortalShell><section className="portal-content">
    {error && <p className="portal-error">{error}</p>}
    {!project ? <p className="portal-loading">Loading project…</p> : <>
      <p className="portal-eyebrow">{project.project_type || "PROJECT"}</p><h1>{project.title}</h1><p className="portal-muted">{project.description}</p>
      <div className="status-panel"><span className="status-pill">{project.status}</span><div className="progress"><i style={{ width: `${project.progress}%` }} /></div><strong>{project.progress}% complete</strong></div>
      <div className="portal-grid"><section className="portal-section"><h2>Files</h2>{files.length ? files.map((file) => <div className="file-row" key={file.id}><span><strong>{file.filename}</strong><small>{file.category.replaceAll("_", " ")}</small></span><div><button onClick={() => void downloadProtectedFile(file.download_url, file.filename)}>Download</button>{file.preview_url && <button onClick={() => { if (file.preview_url) void previewProtectedFile(file.preview_url); }}>Preview</button>}{file.category === "approval" && file.pending_approval && <><button onClick={() => void respondToApproval(file.id, "approved")}>Approve</button><button onClick={() => void respondToApproval(file.id, "changes_requested")}>Request changes</button></>}</div></div>) : <p className="portal-muted">No files have been shared yet.</p>}{files.some((file) => file.category === "approval" && file.pending_approval) && <textarea className="approval-note" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Optional approval or change note" />}</section>
      <section className="portal-section"><h2>Messages</h2><div className="message-list">{messages.length ? messages.map((message) => <p key={message.id}><strong>{message.sender_username}</strong><br />{message.content}</p>) : <p className="portal-muted">No project messages yet.</p>}</div><form className="message-form" onSubmit={send}><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a message" maxLength={10000} required /><button>Send message</button></form></section></div>
    </>}
  </section></PortalShell>;
}
