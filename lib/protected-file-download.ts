import { apiFetch } from "./api";

type FileAccess = { url: string };
type FileAccessLookup = (endpoint: string) => Promise<FileAccess>;
type FileNavigation = (url: string) => void;

export async function downloadProtectedFile(
  endpoint: string,
  lookup: FileAccessLookup = (path) => apiFetch<FileAccess>(path),
  navigate: FileNavigation = (url) => window.location.assign(url),
): Promise<void> {
  const { url } = await lookup(endpoint);
  navigate(url);
}
