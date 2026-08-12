export type Project = {
  id: number;
  title: string;
  description: string;
  project_type: string;
  status: string;
  progress: number;
};

export type ProjectFile = {
  id: number;
  filename: string;
  category: "raw" | "preview" | "approval" | "final_delivery";
  download_url: string;
  preview_url: string | null;
  pending_approval: boolean;
};

export type PortalMessage = { id: number; content: string; sender_username: string };
export type Approval = { id: number; file: number; file_name: string; status: string; comment: string };
export type Dashboard = {
  client: { name: string; company: string };
  active_projects: Project[];
  pending_approvals: Approval[];
  latest_messages: PortalMessage[];
  latest_files: ProjectFile[];
};
