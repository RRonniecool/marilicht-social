"use client";

import { CopyCheck, Mail, MapPin, Phone } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/brand";
import { Button } from "@/components/ui/button";
import { inputClass, Switch, TextField } from "@/components/ui/field";
import { Panel } from "@/components/ui/misc";
import { DAYS } from "@/lib/types";
import { cn, whatsappLink } from "@/lib/utils";
import { useEditor } from "../editor-context";

export function ContactSection() {
  const { draft, update, errorFor } = useEditor();
  const { contact } = draft;
  const hours = [...contact.hours].sort((a, b) => a.day - b.day);
  const waTest = whatsappLink(contact.whatsapp, contact.whatsappMessage);

  function setDay(day: number, patch: Partial<(typeof hours)[number]>) {
    update((d) => {
      const existing = d.contact.hours.find((h) => h.day === day);
      if (existing) Object.assign(existing, patch);
      else d.contact.hours.push({ day, open: "08:00", close: "18:00", closed: false, ...patch });
    });
  }

  function copyMondayToWeekdays() {
    const monday = hours.find((h) => h.day === 0);
    if (!monday) return;
    update((d) => {
      for (const h of d.contact.hours) if (h.day > 0 && h.day < 5) Object.assign(h, { open: monday.open, close: monday.close, closed: monday.closed });
    });
  }

  return (
    <div className="space-y-5">
      <Panel title="WhatsApp ordering" description="Powers the main “Order on WhatsApp” button and every product's order button.">
        <div className="space-y-5">
          <TextField
            label="WhatsApp number"
            hint="Include the country code, e.g. +234 801 234 5678."
            placeholder="+234 801 234 5678"
            inputMode="tel"
            leading={<WhatsAppIcon size={15} />}
            value={contact.whatsapp}
            max={30}
            error={errorFor("contact.whatsapp")}
            onChange={(v) => update((d) => void (d.contact.whatsapp = v))}
          />
          <TextField
            label="Opening message"
            optional
            multiline
            hint="Customers see this already typed when WhatsApp opens. They can edit it before sending."
            value={contact.whatsappMessage}
            max={200}
            error={errorFor("contact.whatsappMessage")}
            onChange={(v) => update((d) => void (d.contact.whatsappMessage = v))}
          />
          {waTest && (
            <a href={waTest} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[13.5px] font-medium text-signal hover:text-signal-ink">
              <WhatsAppIcon size={16} /> Send yourself a test message
            </a>
          )}
        </div>
      </Panel>

      <Panel title="Other ways to reach you">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Phone"
            optional
            inputMode="tel"
            leading={<Phone size={15} />}
            placeholder="+234 801 234 5678"
            value={contact.phone}
            max={30}
            error={errorFor("contact.phone")}
            onChange={(v) => update((d) => void (d.contact.phone = v))}
          />
          <TextField
            label="Email"
            optional
            type="email"
            leading={<Mail size={15} />}
            placeholder="hello@marilicht.social"
            value={contact.email}
            max={120}
            error={errorFor("contact.email")}
            onChange={(v) => update((d) => void (d.contact.email = v.trim()))}
          />
          <TextField
            label="Address"
            optional
            className="sm:col-span-2"
            leading={<MapPin size={15} />}
            placeholder="14 Admiralty Way, Lekki Phase 1, Lagos"
            value={contact.address}
            max={200}
            error={errorFor("contact.address")}
            onChange={(v) => update((d) => void (d.contact.address = v))}
          />
          <TextField
            label="Google Maps link"
            optional
            className="sm:col-span-2"
            inputMode="url"
            hint="Open your business in Google Maps, tap Share and paste the link. Without it, we search for your address."
            placeholder="https://maps.app.goo.gl/…"
            value={contact.mapsUrl}
            max={500}
            error={errorFor("contact.mapsUrl")}
            onChange={(v) => update((d) => void (d.contact.mapsUrl = v.trim()))}
          />
        </div>
      </Panel>

      <Panel
        title="Opening hours"
        description="Your page shows “Open now” or when you next open, in each visitor's local time."
        actions={
          <Button variant="ghost" size="sm" icon={<CopyCheck size={14} />} onClick={copyMondayToWeekdays}>
            Copy Monday to weekdays
          </Button>
        }
      >
        <ul className="divide-y divide-line-2 rounded-lg ring-1 ring-line/80">
          {DAYS.map((label, day) => {
            const h = hours.find((x) => x.day === day) ?? { day, open: "08:00", close: "18:00", closed: true };
            return (
              <li key={label} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3.5 py-2.5 sm:flex-nowrap">
                <span className="w-24 text-[14px] font-medium text-ink">{label}</span>
                <Switch label={`Open on ${label}`} checked={!h.closed} onChange={(open) => setDay(day, { closed: !open })} size="sm" />
                <div className={cn("ml-auto flex items-center gap-2 transition-opacity", h.closed && "pointer-events-none opacity-40")}>
                  {h.closed ? (
                    <span className="w-[226px] text-right text-[13.5px] text-muted">Closed</span>
                  ) : (
                    <>
                      <input
                        type="time"
                        value={h.open}
                        aria-label={`${label} opening time`}
                        onChange={(e) => setDay(day, { open: e.target.value })}
                        className={cn(inputClass, "tabular h-9 w-[104px] px-2.5 text-[13.5px]")}
                      />
                      <span className="text-faint">to</span>
                      <input
                        type="time"
                        value={h.close}
                        aria-label={`${label} closing time`}
                        onChange={(e) => setDay(day, { close: e.target.value })}
                        className={cn(inputClass, "tabular h-9 w-[104px] px-2.5 text-[13.5px]")}
                      />
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <TextField
          className="mt-5"
          label="Note"
          optional
          placeholder="Same-day delivery on orders placed before 2pm."
          value={contact.hoursNote}
          max={120}
          error={errorFor("contact.hoursNote")}
          onChange={(v) => update((d) => void (d.contact.hoursNote = v))}
        />
      </Panel>
    </div>
  );
}
