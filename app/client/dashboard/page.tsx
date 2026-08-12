"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import PortalShell from "@/app/components/PortalShell";
import { apiFetch } from "@/lib/api";
import type { Dashboard } from "@/lib/portal-types";

export default function ClientDashboard() {
  const [data, setData] = useState<Dashboard | null>(null); const [error, setError] = useState("");
  useEffect(() => { apiFetch<Dashboard>("/api/auth/dashboard/").then(setData).catch((e: Error) => setError(e.message)); }, []);
  return <PortalShell>{error ? <p className="portal-error">{error}</p> : !data ? <p className="portal-loading">Loading your workspace…</p> : <section className="portal-content"><p className="portal-eyebrow">CLIENT WORKSPACE</p><h1>Welcome back, {data.client.name}</h1><p className="portal-muted">{data.client.company || "LaBio Media client"}</p><div className="portal-cards"><Card label="Active projects" value={data.active_projects.length}/><Card label="Messages" value={data.latest_messages.length}/><Card label="Pending approvals" value={data.pending_approvals.length}/><Card label="Delivered files" value={data.latest_files.length}/></div><section className="portal-section"><div className="section-heading"><h2>Active projects</h2><Link href="/client/projects">View all</Link></div>{data.active_projects.length ? data.active_projects.map((project) => <Link className="project-row" href={`/client/projects/${project.id}`} key={project.id}><span><strong>{project.title}</strong><small>{project.project_type || "Creative project"}</small></span><span className="status-pill">{project.status}</span><span>{project.progress}%</span></Link>) : <p className="portal-muted">No active projects yet.</p>}</section><section className="portal-grid"><List title="Latest messages" items={data.latest_messages.map((m) => m.content)}/><List title="Pending approvals" items={data.pending_approvals.map((a) => a.file_name)}/><List title="Latest delivered files" items={data.latest_files.map((f) => f.filename)}/></section></section>}</PortalShell>;
}
function Card({label,value}:{label:string;value:number}) { return <div className="portal-card"><span>{label}</span><strong>{value}</strong></div> }
function List({title,items}:{title:string;items:string[]}) { return <section className="portal-section"><h2>{title}</h2>{items.length ? <ul>{items.map((x,i)=><li key={i}>{x}</li>)}</ul> : <p className="portal-muted">Nothing to show.</p>}</section> }
