type ClassValue = string | number | bigint | boolean | null | undefined | ClassValue[] | Record<string, unknown>;

/** Minimal class name joiner (clsx-compatible subset). */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (value === true) continue;
    if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") out.push(String(value));
    else if (Array.isArray(value)) {
      const inner = cn(...value);
      if (inner) out.push(inner);
    } else if (typeof value === "object") {
      for (const [key, on] of Object.entries(value)) if (on) out.push(key);
    }
  }
  return out.join(" ");
}

export function uid(prefix = "") {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return prefix ? `${prefix}_${rand}` : rand;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 40);
}

/** Ensures a URL has a protocol so links typed as "marilicht.com" still work. */
export function normalizeUrl(url: string | undefined | null): string {
  const value = (url ?? "").trim();
  if (!value) return "";
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  return `https://${value}`;
}

export function displayUrl(url: string | undefined | null): string {
  return (url ?? "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

export function digitsOnly(phone: string | undefined | null) {
  return (phone ?? "").replace(/[^\d]/g, "");
}

export function whatsappLink(number: string | undefined | null, message?: string) {
  const digits = digitsOnly(number);
  if (!digits) return "";
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function formatRelative(iso: string | undefined | null) {
  if (!iso) return "never";
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.round(diff / minute)} min ago`;
  if (diff < day) return `${Math.round(diff / hour)} h ago`;
  if (diff < 7 * day) return `${Math.round(diff / day)} d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
