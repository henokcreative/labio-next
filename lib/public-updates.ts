import type {
  CmsEventPage,
  CmsEventSummary,
  CmsUpdatePage,
  CmsUpdateSummary,
} from "./cms-types";

const publicDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function dateFromIso(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

export function formatPublicDate(value: string): string {
  const date = dateFromIso(value);
  return date ? publicDateFormatter.format(date) : value;
}

function formatClock(value?: string): string {
  return value ? value.slice(0, 5) : "";
}

type EventTiming = Pick<
  CmsEventPage | CmsEventSummary,
  "startDate" | "startTime" | "endDate" | "endTime"
>;

export function formatEventSchedule(event: EventTiming): string {
  const startDate = formatPublicDate(event.startDate);
  const endDateValue = event.endDate || event.startDate;
  const sameDay = endDateValue === event.startDate;
  const startTime = formatClock(event.startTime);
  const endTime = formatClock(event.endTime);

  if (sameDay) {
    const timeRange = startTime && endTime
      ? `${startTime}–${endTime}`
      : startTime || endTime;
    return timeRange ? `${startDate} · ${timeRange}` : startDate;
  }

  const start = startTime ? `${startDate} · ${startTime}` : startDate;
  const endDate = formatPublicDate(endDateValue);
  const end = endTime ? `${endDate} · ${endTime}` : endDate;
  return `${start} – ${end}`;
}

export function updateTypeLabel(
  update: CmsUpdatePage | CmsUpdateSummary,
): string {
  return update.kind === "article" ? update.articleTypeLabel : "Event";
}

export function updateDisplayDate(
  update: CmsUpdatePage | CmsUpdateSummary,
): string {
  return update.kind === "article"
    ? formatPublicDate(update.publicationDate)
    : formatEventSchedule(update);
}

export function updateMachineDate(
  update: CmsUpdatePage | CmsUpdateSummary,
): string {
  return update.kind === "article" ? update.publicationDate : update.startDate;
}
