"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import PortalShell from "@/app/components/PortalShell";
import { apiFetch } from "@/lib/api";
import type { Project } from "@/lib/portal-types";
export default function ProjectsPage() { const [projects,setProjects]=useState<Project[]>([]); const [error,setError]=useState(""); useEffect(()=>{apiFetch<Project[]>("/api/projects/").then(setProjects).catch((e: Error)=>setError(e.message))},[]); return <PortalShell><section className="portal-content"><p className="portal-eyebrow">PROJECTS</p><h1>Your projects</h1>{error?<p className="portal-error">{error}</p>:<div className="project-list">{projects.map(p=><Link className="project-card" href={`/client/projects/${p.id}`} key={p.id}><span className="status-pill">{p.status}</span><h2>{p.title}</h2><p>{p.description || "Creative project managed by LaBio Media."}</p><div className="progress"><i style={{width:`${p.progress}%`}} /></div><small>{p.progress}% complete</small></Link>)}{!projects.length&&<p>No projects yet.</p>}</div>}</section></PortalShell> }
