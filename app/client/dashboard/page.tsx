"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PortalShell from "@/app/components/PortalShell";
import { apiFetch } from "@/lib/api";
import type { Approval, Dashboard, PortalMessage } from "@/lib/portal-types";

function approvalHref(approval: Approval): string {
  return `/client/projects/${approval.project}#file-${approval.file}`;
}

function formatMessageDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <>
      <span>{label}</span>
      <strong>{value}</strong>
    </>
  );

  return href ? (
    <Link className="portal-card portal-card-link" href={href}>
      {content}
    </Link>
  ) : (
    <div className="portal-card">{content}</div>
  );
}

function LatestMessages({ messages }: { messages: PortalMessage[] }) {
  return (
    <section className="portal-section dashboard-list-section dashboard-messages">
      <div className="section-heading">
        <h2>Latest messages</h2>
        <Link href="/client/messages">View messages</Link>
      </div>
      {messages.length ? (
        <div className="dashboard-message-list">
          {messages.map((message) => {
            const date = formatMessageDate(message.created_at);
            return (
              <Link
                className="dashboard-message-preview"
                href="/client/messages"
                key={message.id}
              >
                <span className="dashboard-message-meta">
                  <strong>{message.sender_name || message.sender_username}</strong>
                  {date && <time dateTime={message.created_at}>{date}</time>}
                </span>
                <span>{message.content || message.body}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="portal-empty-state">No recent messages.</p>
      )}
    </section>
  );
}

function SummaryList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="portal-section dashboard-list-section">
      <h2>{title}</h2>
      {items.length ? (
        <ul className="dashboard-summary-list">
          {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
        </ul>
      ) : (
        <p className="portal-empty-state">Nothing to show.</p>
      )}
    </section>
  );
}

function PendingApprovals({ approvals }: { approvals: Approval[] }) {
  return (
    <section className="portal-section dashboard-list-section">
      <h2>Pending approvals</h2>
      {approvals.length ? (
        <ul className="dashboard-summary-list">
          {approvals.map((approval) => (
            <li className="dashboard-approval-item" key={approval.id}>
              <Link
                className="dashboard-approval-link"
                href={approvalHref(approval)}
              >
                <span>{approval.file_name}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="portal-empty-state">Nothing to show.</p>
      )}
    </section>
  );
}

export default function ClientDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<Dashboard>("/api/auth/dashboard/")
      .then(setData)
      .catch((nextError: Error) => setError(nextError.message));
  }, []);

  return (
    <PortalShell>
      {error ? (
        <p className="portal-error">{error}</p>
      ) : !data ? (
        <p className="portal-loading">Loading your workspace…</p>
      ) : (
        <section className="portal-content dashboard-content">
          <p className="portal-eyebrow">CLIENT WORKSPACE</p>
          <h1>Welcome back, {data.client.name}</h1>
          <p className="portal-muted">{data.client.company || "LaBio Media client"}</p>

          <div className="portal-cards">
            <StatCard
              label="Active projects"
              value={data.active_projects.length}
              href="/client/projects"
            />
            <StatCard
              label="Messages"
              value={data.latest_messages.length}
              href="/client/messages"
            />
            <StatCard
              label="Pending approvals"
              value={data.pending_approvals.length}
              href={data.pending_approvals[0]
                ? approvalHref(data.pending_approvals[0])
                : undefined}
            />
            <StatCard label="Delivered files" value={data.latest_files.length} />
          </div>

          <section className="portal-section dashboard-projects">
            <div className="section-heading">
              <h2>Active projects</h2>
              <Link href="/client/projects">View all</Link>
            </div>
            {data.active_projects.length ? (
              data.active_projects.map((project) => (
                <Link
                  className="project-row"
                  href={`/client/projects/${project.id}`}
                  key={project.id}
                >
                  <span>
                    <strong>{project.title}</strong>
                    <small>{project.project_type || "Creative project"}</small>
                  </span>
                  <span className="status-pill">{project.status}</span>
                  <span>{project.progress}%</span>
                </Link>
              ))
            ) : (
              <p className="portal-empty-state">No active projects yet.</p>
            )}
          </section>

          <div className="dashboard-detail-grid">
            <LatestMessages messages={data.latest_messages} />
            <PendingApprovals approvals={data.pending_approvals} />
            <SummaryList
              title="Latest delivered files"
              items={data.latest_files.map((file) => file.filename)}
            />
          </div>
        </section>
      )}
    </PortalShell>
  );
}
