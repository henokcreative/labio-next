"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Conversation, MessagingClient } from "@/lib/portal-types";

type StaffFilter = "all" | "unread" | "mine" | "unassigned";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function MessagingInbox({ staff }: { staff: boolean }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [clients, setClients] = useState<MessagingClient[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<StaffFilter>("all");
  const [body, setBody] = useState("");
  const [subject, setSubject] = useState("");
  const [clientId, setClientId] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadConversations = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const query = staff ? `?filter=${filter}` : "";
      const next = await apiFetch<Conversation[]>(
        `/api/messaging/conversations/${query}`
      );
      setConversations(next);
      setSelectedId((current) =>
        current && next.some((conversation) => conversation.id === current)
          ? current
          : next[0]?.id ?? null
      );
      setError("");
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [filter, staff]);

  useEffect(() => {
    const initial = window.setTimeout(() => {
      void loadConversations(true);
    }, 0);
    const polling = window.setInterval(() => {
      void loadConversations();
    }, 15000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(polling);
    };
  }, [loadConversations]);

  useEffect(() => {
    if (!staff) return;
    const timer = window.setTimeout(() => {
      apiFetch<MessagingClient[]>("/api/messaging/clients/")
        .then(setClients)
        .catch((nextError: Error) => setError(nextError.message));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [staff]);

  const selected = conversations.find(
    (conversation) => conversation.id === selectedId
  );

  async function selectConversation(conversation: Conversation) {
    setSelectedId(conversation.id);
    if (!conversation.unread_count) return;
    try {
      await apiFetch(
        `/api/messaging/conversations/${conversation.id}/mark-read/`,
        { method: "POST" }
      );
      await loadConversations();
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  async function sendReply(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || !body.trim()) return;
    setSubmitting(true);
    try {
      await apiFetch(
        `/api/messaging/conversations/${selected.id}/send/`,
        { method: "POST", body: JSON.stringify({ body }) }
      );
      setBody("");
      await loadConversations();
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function assignToMe() {
    if (!selected) return;
    try {
      await apiFetch(
        `/api/messaging/conversations/${selected.id}/assign/`,
        { method: "POST" }
      );
      await loadConversations();
    } catch (nextError) {
      setError((nextError as Error).message);
    }
  }

  async function startConversation(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const conversation = await apiFetch<Conversation>(
        "/api/messaging/conversations/start/",
        {
          method: "POST",
          body: JSON.stringify({ client_id: Number(clientId), subject }),
        }
      );
      setFilter("all");
      setSubject("");
      setClientId("");
      setShowNew(false);
      await loadConversations();
      setSelectedId(conversation.id);
    } catch (nextError) {
      setError((nextError as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="portal-content messaging-page">
      <div className="messaging-heading">
        <div>
          <p className="portal-eyebrow">{staff ? "STAFF INBOX" : "MESSAGES"}</p>
          <h1>{staff ? "Client conversations" : "Your conversations"}</h1>
          <p className="portal-muted">
            {staff
              ? "Review requests, coordinate projects and reply to clients."
              : "Keep project conversations and decisions in one place."}
          </p>
        </div>
        {staff && (
          <button className="inbox-primary" onClick={() => setShowNew(true)}>
            New conversation
          </button>
        )}
      </div>

      {error && <p className="portal-error">{error}</p>}

      {staff && (
        <div className="inbox-filters" aria-label="Conversation filters">
          {(["all", "unread", "mine", "unassigned"] as StaffFilter[]).map(
            (value) => (
              <button
                className={filter === value ? "active" : ""}
                key={value}
                onClick={() => setFilter(value)}
              >
                {value}
              </button>
            )
          )}
        </div>
      )}

      {showNew && staff && (
        <form className="new-conversation" onSubmit={startConversation}>
          <div>
            <label htmlFor="message-client">Client</label>
            <select
              id="message-client"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option value={client.id} key={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="message-subject">Subject</label>
            <input
              id="message-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              maxLength={200}
              required
            />
          </div>
          <div className="new-conversation-actions">
            <button type="button" onClick={() => setShowNew(false)}>
              Cancel
            </button>
            <button className="inbox-primary" disabled={submitting}>
              {submitting ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      )}

      <div className="inbox-layout">
        <aside className="conversation-list" aria-label="Conversations">
          {loading ? (
            <p className="portal-muted inbox-empty">Loading conversations…</p>
          ) : conversations.length ? (
            conversations.map((conversation) => {
              const last = conversation.messages.at(-1);
              return (
                <button
                  className={selectedId === conversation.id ? "active" : ""}
                  key={conversation.id}
                  onClick={() => void selectConversation(conversation)}
                >
                  <span className="conversation-title">
                    <strong>{staff ? conversation.client_name : conversation.subject}</strong>
                    {conversation.unread_count > 0 && (
                      <i>{conversation.unread_count}</i>
                    )}
                  </span>
                  <span>{staff ? conversation.subject : conversation.project_title || "General"}</span>
                  {last && <small>{last.content}</small>}
                  <time>{formatDate(conversation.updated_at)}</time>
                </button>
              );
            })
          ) : (
            <p className="portal-muted inbox-empty">No conversations found.</p>
          )}
        </aside>

        <section className="conversation-panel">
          {!selected ? (
            <div className="inbox-placeholder">Select a conversation to begin.</div>
          ) : (
            <>
              <header className="conversation-header">
                <div>
                  <p>{staff ? selected.client_name : selected.project_title || "LaBio Media"}</p>
                  <h2>{selected.subject}</h2>
                  {selected.project_id && (
                    <Link href={`/client/projects/${selected.project_id}`}>
                      Open project
                    </Link>
                  )}
                </div>
                {staff && (
                  <div className="conversation-assignment">
                    <span>{selected.assigned_staff_name || "Unassigned"}</span>
                    <button onClick={() => void assignToMe()}>Assign to me</button>
                  </div>
                )}
              </header>

              <div className="conversation-messages" aria-live="polite">
                {selected.messages.length ? (
                  selected.messages.map((message) => (
                    <article
                      className={`inbox-message ${
                        message.sender_role === (staff ? "staff" : "client")
                          ? "outgoing"
                          : "incoming"
                      }`}
                      key={message.id}
                    >
                      <div>
                        <strong>
                          {message.sender_name ||
                            (message.sender_role === "staff"
                              ? "LaBio Media"
                              : selected.client_name)}
                        </strong>
                        <time>{formatDate(message.created_at)}</time>
                      </div>
                      <p>{message.content}</p>
                    </article>
                  ))
                ) : (
                  <p className="portal-muted inbox-empty">No messages yet.</p>
                )}
              </div>

              <form className="inbox-reply" onSubmit={sendReply}>
                <label htmlFor="reply-body">Reply</label>
                <textarea
                  id="reply-body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  maxLength={10000}
                  placeholder="Write a message"
                  required
                />
                <button className="inbox-primary" disabled={submitting}>
                  {submitting ? "Sending…" : "Send message"}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </section>
  );
}
