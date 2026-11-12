"use client";

import { Globe, ShoppingBag } from "lucide-react";
import { TextField } from "@/components/ui/field";
import { ImageField } from "@/components/ui/image-field";
import { Panel } from "@/components/ui/misc";
import { useEditor } from "../editor-context";

export function WebsiteSection() {
  const { draft, update, errorFor } = useEditor();
  const { website } = draft;

  return (
    <div className="space-y-5">
      <Panel title="Website" description="Shown as a preview card with a button to your site. Leave the address empty to hide it.">
        <div className="space-y-5">
          <TextField
            label="Website address"
            placeholder="www.marilicht.com"
            leading={<Globe size={15} />}
            inputMode="url"
            value={website.url}
            max={300}
            error={errorFor("website.url")}
            onChange={(url) => update((d) => void (d.website.url = url.trim()))}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Title"
              optional
              placeholder={draft.profile.name}
              value={website.title}
              max={80}
              error={errorFor("website.title")}
              onChange={(title) => update((d) => void (d.website.title = title))}
            />
          </div>
          <TextField
            label="Description"
            optional
            multiline
            placeholder="What customers can do on your website."
            value={website.description}
            max={240}
            error={errorFor("website.description")}
            onChange={(description) => update((d) => void (d.website.description = description))}
          />
          <ImageField
            label="Preview image"
            hint="A screenshot of your homepage, 1200 × 750 px or similar."
            shape="wide"
            value={website.previewImage}
            onChange={(previewImage) => update((d) => void (d.website.previewImage = previewImage))}
          />
        </div>
      </Panel>

      <Panel title="Online store" description="Adds a second button next to your website, for customers ready to buy.">
        <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
          <TextField
            label="Store link"
            optional
            placeholder="shop.marilicht.com"
            leading={<ShoppingBag size={15} />}
            inputMode="url"
            value={website.storeUrl}
            max={300}
            error={errorFor("website.storeUrl")}
            onChange={(storeUrl) => update((d) => void (d.website.storeUrl = storeUrl.trim()))}
          />
          <TextField
            label="Button label"
            optional
            placeholder="Shop online"
            value={website.storeLabel}
            max={40}
            error={errorFor("website.storeLabel")}
            onChange={(storeLabel) => update((d) => void (d.website.storeLabel = storeLabel))}
          />
        </div>
      </Panel>
    </div>
  );
}
