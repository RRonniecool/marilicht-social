import { DAYS, type OpeningHours } from "@/lib/types";

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** Monday-based index for a JS date (Mon = 0 … Sun = 6). */
export const weekdayIndex = (date: Date) => (date.getDay() + 6) % 7;

export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}

export type OpenStatus = { open: boolean; label: string } | null;

/** Computes "Open until 7pm" / "Closed, opens Mon 7am" for the viewer's local time. */
export function openStatus(hours: OpeningHours[], now = new Date()): OpenStatus {
  if (!hours.length) return null;
  const byDay = new Map(hours.map((h) => [h.day, h]));
  const today = weekdayIndex(now);
  const minutes = now.getHours() * 60 + now.getMinutes();
  const current = byDay.get(today);
  if (current && !current.closed) {
    const open = toMinutes(current.open);
    const close = toMinutes(current.close);
    if (minutes >= open && minutes < close) return { open: true, label: `Open until ${formatTime(current.close)}` };
    if (minutes < open) return { open: false, label: `Closed, opens ${formatTime(current.open)}` };
  }
  for (let offset = 1; offset <= 7; offset++) {
    const day = (today + offset) % 7;
    const next = byDay.get(day);
    if (next && !next.closed) {
      const when = offset === 1 ? "tomorrow" : DAYS[day].slice(0, 3);
      return { open: false, label: `Closed, opens ${when} ${formatTime(next.open)}` };
    }
  }
  return { open: false, label: "Closed" };
}

/** Groups consecutive days with identical hours: "Mon–Fri 7am–7pm". */
export function groupHours(hours: OpeningHours[]) {
  const sorted = [...hours].sort((a, b) => a.day - b.day);
  const groups: { from: number; to: number; text: string }[] = [];
  for (const h of sorted) {
    const text = h.closed ? "Closed" : `${formatTime(h.open)} – ${formatTime(h.close)}`;
    const last = groups[groups.length - 1];
    if (last && last.text === text && last.to === h.day - 1) last.to = h.day;
    else groups.push({ from: h.day, to: h.day, text });
  }
  return groups.map((g) => ({
    days: g.from === g.to ? DAYS[g.from].slice(0, 3) : `${DAYS[g.from].slice(0, 3)} – ${DAYS[g.to].slice(0, 3)}`,
    text: g.text,
    from: g.from,
    to: g.to,
  }));
}
