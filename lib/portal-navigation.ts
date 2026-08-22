function positiveInteger(value: string | null): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function projectFileTargetId(fileId: number): string {
  return `file-${fileId}`;
}

export function projectFileHref(projectId: number, fileId: number): string {
  return `/client/projects/${projectId}?file=${fileId}`;
}

export function projectFileIdFromSearch(search: string): number | null {
  return positiveInteger(new URLSearchParams(search).get("file"));
}

export function conversationHref(conversationId: number): string {
  return `/client/messages?conversation=${conversationId}`;
}

export function conversationIdFromSearch(search: string): number | null {
  return positiveInteger(new URLSearchParams(search).get("conversation"));
}
