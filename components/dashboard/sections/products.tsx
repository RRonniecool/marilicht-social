"use client";

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Copy, Package, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { ImageField } from "@/components/ui/image-field";
import { EmptyState, Panel } from "@/components/ui/misc";
import { SortableList } from "@/components/ui/sortable";
import { imageSrc } from "@/lib/images";
import { SITE_COPY } from "@/lib/site";
import type { Product } from "@/lib/types";
import { cn, uid } from "@/lib/utils";
import { useEditor } from "../editor-context";

export function ProductsSection() {
  const { draft, update } = useEditor();
  const [open, setOpen] = useState<string | null>(null);
  const t = { copy: SITE_COPY };

  function add() {
    const id = uid("p");
    update((d) => void d.products.push({ id, name: "New product", description: "", size: "", price: "", image: null, orderUrl: "", badge: "" }));
    setOpen(id);
  }

  return (
    <div className="space-y-5">
      <Panel
        title="Your products"
        description={`Shown under “${t.copy.productsHeading}”. Drag to reorder; the first products get the most attention.`}
        actions={
          draft.products.length > 0 && (
            <Button variant="primary" size="sm" icon={<Plus size={15} />} onClick={add}>
              Add product
            </Button>
          )
        }
      >
        {draft.products.length === 0 ? (
          <EmptyState
            icon={<Package size={20} />}
            title="Add your first product"
            description="Products appear as cards with a photo, size, price and an order button that opens WhatsApp."
            action={
              <Button variant="primary" icon={<Plus size={15} />} onClick={add}>
                Add product
              </Button>
            }
          />
        ) : (
          <SortableList
            items={draft.products}
            onReorder={(products) => update((d) => void (d.products = products))}
            renderItem={(product, handle, index) => (
              <ProductRow
                product={product}
                index={index}
                handle={handle}
                open={open === product.id}
                onToggle={() => setOpen(open === product.id ? null : product.id)}
                onDuplicate={() => {
                  const id = uid("p");
                  update((d) => void d.products.splice(index + 1, 0, { ...structuredClone(product), id, name: `${product.name} (copy)` }));
                  setOpen(id);
                }}
              />
            )}
          />
        )}
      </Panel>
    </div>
  );
}

function ProductRow({
  product,
  index,
  handle,
  open,
  onToggle,
  onDuplicate,
}: {
  product: Product;
  index: number;
  handle: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  onDuplicate: () => void;
}) {
  const { update, errorFor, draft, errors } = useEditor();
  const t = { copy: SITE_COPY };
  const set = <K extends keyof Product>(key: K, value: Product[K]) => update((d) => void (d.products[index][key] = value));
  const hasError = Object.keys(errors).some((k) => k.startsWith(`products.${index}.`));

  return (
    <div className={cn("overflow-hidden rounded-lg bg-surface ring-1 transition-shadow", open ? "shadow-md ring-[#d3d6de]" : "ring-line/80", hasError && "ring-danger")}>
      <div className="flex items-center gap-2 p-2 pr-3">
        {handle}
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="checker grid size-12 shrink-0 place-items-center overflow-hidden rounded-md ring-1 ring-line/80">
            {product.image?.url ? (
              <img src={imageSrc(product.image, 48)} alt="" className="size-full object-contain p-0.5" />
            ) : (
              <Package size={18} className="text-faint" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-[14.5px] font-medium text-ink">{product.name || "Untitled product"}</span>
              {product.badge && <span className="shrink-0 rounded-full bg-signal-soft px-2 py-0.5 text-[11px] font-medium text-signal-ink">{product.badge}</span>}
            </span>
            <span className="block truncate text-[13px] text-muted">{[product.size, product.price].filter(Boolean).join(" · ") || "No size or price yet"}</span>
          </span>
          <ChevronDown size={17} className={cn("shrink-0 text-faint transition-transform duration-200", open && "rotate-180")} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="grid gap-5 border-t border-line-2 p-4 sm:grid-cols-[180px_1fr] sm:p-5">
              <ImageField
                label="Photo"
                hint="Transparent PNGs look best."
                shape="product"
                value={product.image}
                onChange={(image) => set("image", image)}
              />
              <div className="space-y-4">
                <TextField label="Name" value={product.name} max={80} error={errorFor(`products.${index}.name`)} onChange={(v) => set("name", v)} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label={t.copy.sizeLabel}
                    optional
                    placeholder="50cl · pack of 12"
                    value={product.size}
                    max={40}
                    error={errorFor(`products.${index}.size`)}
                    onChange={(v) => set("size", v)}
                  />
                  <TextField
                    label="Price"
                    optional
                    placeholder="₦3,600"
                    value={product.price}
                    max={40}
                    error={errorFor(`products.${index}.price`)}
                    onChange={(v) => set("price", v)}
                  />
                </div>
                <TextField
                  label="Description"
                  optional
                  multiline
                  value={product.description}
                  max={400}
                  error={errorFor(`products.${index}.description`)}
                  onChange={(v) => set("description", v)}
                />
                <div className="grid gap-4 sm:grid-cols-[1fr_1.4fr]">
                  <TextField
                    label="Badge"
                    optional
                    placeholder="Best seller"
                    value={product.badge}
                    max={24}
                    error={errorFor(`products.${index}.badge`)}
                    onChange={(v) => set("badge", v)}
                  />
                  <TextField
                    label="Order link"
                    optional
                    placeholder="Leave empty to order on WhatsApp"
                    inputMode="url"
                    hint={!product.orderUrl && !draft.contact.whatsapp ? "Add a WhatsApp number in Contact & hours, or a link here, to show an order button." : undefined}
                    value={product.orderUrl}
                    max={500}
                    error={errorFor(`products.${index}.orderUrl`)}
                    onChange={(v) => set("orderUrl", v.trim())}
                  />
                </div>
                <div className="flex justify-between gap-2 pt-1">
                  <Button variant="ghost" size="sm" icon={<Copy size={14} />} onClick={onDuplicate}>
                    Duplicate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    className="text-danger hover:bg-danger-soft hover:text-danger"
                    onClick={() => update((d) => void d.products.splice(index, 1))}
                  >
                    Remove product
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
