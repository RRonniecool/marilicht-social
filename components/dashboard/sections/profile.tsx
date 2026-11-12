"use client";

import { MapPin } from "lucide-react";
import { TextField } from "@/components/ui/field";
import { ImageField } from "@/components/ui/image-field";
import { Panel } from "@/components/ui/misc";
import { useEditor } from "../editor-context";

export function ProfileSection() {
  const { draft, update, errorFor } = useEditor();
  const { profile } = draft;

  return (
    <div className="space-y-5">
      <Panel title="Identity" description="Your logo and name appear at the top of your page and in link previews.">
        <div className="space-y-5">
          <ImageField
            label="Logo"
            hint="A square image at least 400 × 400 px works best. It's shown in a circle."
            shape="logo"
            value={profile.logo}
            onChange={(logo) => update((d) => void (d.profile.logo = logo))}
          />
          <TextField
            label="Business name"
            value={profile.name}
            max={60}
            error={errorFor("profile.name")}
            onChange={(name) => update((d) => void (d.profile.name = name))}
          />
          <TextField
            label="Tagline"
            optional
            hint="One short line under your name."
            placeholder="Spring water, bottled at source"
            value={profile.tagline}
            max={90}
            error={errorFor("profile.tagline")}
            onChange={(tagline) => update((d) => void (d.profile.tagline = tagline))}
          />
        </div>
      </Panel>

      <Panel title="About" description="Tell customers what makes you different. This is the first thing they read after your name.">
        <div className="space-y-5">
          <TextField
            label="Description"
            multiline
            placeholder="What you sell, where you deliver and why people choose you."
            value={profile.description}
            max={600}
            error={errorFor("profile.description")}
            onChange={(description) => update((d) => void (d.profile.description = description))}
          />
          <TextField
            label="Location"
            optional
            hint="A short area name. Your full address goes in Contact & hours."
            placeholder="Lekki, Lagos"
            leading={<MapPin size={15} />}
            value={profile.location}
            max={80}
            error={errorFor("profile.location")}
            onChange={(location) => update((d) => void (d.profile.location = location))}
          />
        </div>
      </Panel>

      <Panel title="Cover image" description="The large image behind your name. Photos of your products, shop or team work well.">
        <ImageField
          label="Cover"
          hint="Landscape, at least 1600 px wide. Leave empty to use a gradient in your brand colors."
          shape="wide"
          value={profile.cover}
          onChange={(cover) => update((d) => void (d.profile.cover = cover))}
        />
      </Panel>
    </div>
  );
}
