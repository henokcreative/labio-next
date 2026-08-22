"use client";

import { use, useCallback, useEffect, useState } from "react";
import PortalShell from "@/app/components/PortalShell";
import { apiFetch } from "@/lib/api";
import {
  projectFileIdFromValue,
  projectFileTargetId,
} from "@/lib/portal-navigation";
import type { PortalMessage, Project, ProjectFile } from "@/lib/portal-types";

type FileAccess = { url: string };

function formatMessageDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ProjectDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ file?: string | string[] }>;
}) {
  const { id } = use(params);
  const query = use(searchParams);
  const requestedFileId = projectFileIdFromValue(query.file);
  const [project, setProject] = useState<Project>();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [messages, setMessages] = useState<PortalMessage[]>([]);
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [nextProject, nextFiles, nextMessages] = await Promise.all([
        apiFetch<Project>(`/api/projects/${id}/`),
        apiFetch<ProjectFile[]>(`/api/projects/${id}/files/`),
        apiFetch<PortalMessage[]>(`/api/messages/?project=${id}`),
      ]);
      setProject(nextProject);
      setFiles(nextFiles);
      setMessages(nextMessages);
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!files.length) return;
    if (!requestedFileId || !files.some((file) => file.id === requestedFileId)) {
      return;
    }
    const target = document.getElementById(projectFileTargetId(requestedFileId));
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: "center" });
  }, [files, requestedFileId]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const message = content.trim();
    if (!message || sending) return;

    setSending(true);
    try {
      await apiFetch<PortalMessage>("/api/messages/", {
        method: "POST",
        body: JSON.stringify({ project: id, content: message }),
      });
      setContent("");
      await load();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function respondToApproval(
    fileId: number,
    status: "approved" | "changes_requested",
  ) {
    try {
      await apiFetch(`/api/projects/${id}/approve/`, {
        method: "POST",
        body: JSON.stringify({ file_id: fileId, status, comment }),
      });
      setComment("");
      await load();
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  async function previewProtectedFile(endpoint: string) {
    try {
      const { url } = await apiFetch<FileAccess>(endpoint);
      window.location.assign(url);
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  async function downloadProtectedFile(endpoint: string) {
    try {
      const { url } = await apiFetch<FileAccess>(endpoint);
      window.location.assign(url);
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  return (
    <PortalShell>
      <section className="portal-content project-detail-content">
        {error && <p className="portal-error">{error}</p>}
        {!project ? (
          <p className="portal-loading">Loading project…</p>
        ) : (
          <>
            <p className="portal-eyebrow">{project.project_type || "PROJECT"}</p>
            <h1>{project.title}</h1>
            <p className="portal-muted">{project.description}</p>

            <div className="status-panel">
              <span className="status-pill">{project.status}</span>
              <div className="progress"><i style={{ width: `${project.progress}%` }} /></div>
              <strong>{project.progress}% complete</strong>
            </div>

            <div className="portal-grid project-detail-grid">
              <section className="portal-section project-files-section">
                <h2>Files</h2>
                {files.length ? (
                  <div className="project-file-list">
                    {files.map((file) => (
                      <div
                        className={`file-row${
                          file.id === requestedFileId ? " is-targeted" : ""
                        }`}
                        id={projectFileTargetId(file.id)}
                        key={file.id}
                        tabIndex={-1}
                      >
                        <span className="file-details">
                          <strong>{file.display_name || file.filename}</strong>
                          <small>{file.category.replaceAll("_", " ")}</small>
                          {file.category === "approval" && file.pending_approval && (
                            <small className="file-review-status">Review requested</small>
                          )}
                          {(file.category === "preview" || file.category === "approval")
                            && !file.preview_supported && (
                              <small>
                                This file cannot be previewed in the browser. Download it instead.
                              </small>
                            )}
                        </span>
                        <div className="file-actions">
                          <div className="file-access-actions">
                            {file.preview_supported && file.preview_url && (
                              <button
                                type="button"
                                className="portal-action portal-action-secondary"
                                onClick={() => void previewProtectedFile(file.preview_url!)}
                              >
                                Preview
                              </button>
                            )}
                            <button
                              type="button"
                              className="portal-action portal-action-secondary"
                              onClick={() => void downloadProtectedFile(file.download_url)}
                            >
                              Download
                            </button>
                          </div>
                          {file.category === "approval" && file.pending_approval && (
                            <div className="file-approval-actions">
                              <strong>Approval required</strong>
                              <div className="file-approval-buttons">
                                <button
                                  type="button"
                                  className="portal-action portal-action-primary"
                                  onClick={() => void respondToApproval(file.id, "approved")}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="portal-action portal-action-secondary"
                                  onClick={() => void respondToApproval(file.id, "changes_requested")}
                                >
                                  Request changes
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="portal-empty-state">No files have been shared yet.</p>
                )}
                {files.some((file) => file.category === "approval" && file.pending_approval) && (
                  <textarea
                    className="approval-note"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Optional approval or change note"
                    aria-label="Optional approval or change note"
                  />
                )}
              </section>

              <section className="portal-section project-messages-section">
                <div className="project-section-heading">
                  <h2>Messages</h2>
                  {messages.length > 0 && <span>{messages.length} in this project</span>}
                </div>
                <div className="project-message-list" aria-live="polite">
                  {messages.length ? (
                    messages.map((message) => {
                      const date = formatMessageDate(message.created_at);
                      return (
                        <article
                          className={`project-message project-message-${message.sender_role}`}
                          key={message.id}
                        >
                          <header>
                            <strong>{message.sender_name || message.sender_username}</strong>
                            {date && <time dateTime={message.created_at}>{date}</time>}
                          </header>
                          <p>{message.content || message.body}</p>
                        </article>
                      );
                    })
                  ) : (
                    <p className="portal-empty-state">No project messages yet.</p>
                  )}
                </div>
                <form className="message-form project-message-form" onSubmit={send}>
                  <label htmlFor="project-message">Send a message</label>
                  <textarea
                    id="project-message"
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Write a message"
                    maxLength={10000}
                    rows={5}
                    required
                  />
                  <button
                    className="portal-action portal-action-primary"
                    disabled={sending || content.trim().length === 0}
                  >
                    {sending ? "Sending…" : "Send message"}
                  </button>
                </form>
              </section>
            </div>
          </>
        )}
      </section>
    </PortalShell>
  );
}
