export function relativeDay(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.round((now - then) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.round(days / 7)} weeks ago`;
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
  });
}

export function daysUntil(iso: string): number {
  const target = new Date(iso).getTime();
  return Math.ceil((target - Date.now()) / (24 * 60 * 60 * 1000));
}

export function eventDateLabel(iso: string): string {
  const d = daysUntil(iso);
  const date = new Date(iso).toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  if (d < 0) return date;
  if (d === 0) return `${date} · today`;
  if (d === 1) return `${date} · tomorrow`;
  if (d <= 7) return `${date} · in ${d} days`;
  return date;
}
