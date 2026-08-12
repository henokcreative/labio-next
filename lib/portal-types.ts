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

export type PortalMessage = {
  id: number;
  body: string;
  content: string;
  sender_username: string;
  sender_name: string;
  sender_role: "client" | "staff";
  is_read: boolean;
  created_at: string;
};

export type Conversation = {
  id: number;
  subject: string;
  client_username: string;
  client_name: string;
  assigned_staff_username: string | null;
  assigned_staff_name: string | null;
  project_id: number | null;
  project_title: string | null;
  unread_count: number;
  created_at: string;
  updated_at: string;
  messages: PortalMessage[];
};

export type MessagingClient = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  name: string;
};
export type Approval = { id: number; file: number; file_name: string; status: string; comment: string };
export type Dashboard = {
  client: { name: string; company: string };
  active_projects: Project[];
  pending_approvals: Approval[];
  latest_messages: PortalMessage[];
  latest_files: ProjectFile[];
};
