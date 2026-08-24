"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Pencil,
  Trash2,
  Link2,
  Type,
  Image,
  Video,
  Mail,
  MessageSquare,
  ShoppingBag,
  Minus,
  Code,
  FileText,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Block = {
  id: string;
  profileId: string;
  type: string;
  position: number;
  enabled: boolean;
  config: Record<string, unknown>;
  publishAt: string | null;
  expireAt: string | null;
};

const blockTypeIcons: Record<string, typeof Link2> = {
  LINK: Link2,
  HEADER: Type,
  TEXT: FileText,
  IMAGE: Image,
  YOUTUBE: Video,
  EMAIL_CAPTURE: Mail,
  SMS_CAPTURE: MessageSquare,
  PRODUCT: ShoppingBag,
  DIGITAL_PRODUCT: ShoppingBag,
  DIVIDER: Minus,
  CUSTOM_EMBED: Code,
};

const blockTypeLabels: Record<string, string> = {
  LINK: "Link",
  HEADER: "Header",
  TEXT: "Text",
  IMAGE: "Image",
  VIDEO: "Video",
  YOUTUBE: "YouTube",
  VIMEO: "Vimeo",
  SPOTIFY: "Spotify",
  APPLE_MUSIC: "Apple Music",
  SOUNDCLOUD: "SoundCloud",
  SOCIAL: "Social",
  EMAIL_CAPTURE: "Email Capture",
  SMS_CAPTURE: "SMS Capture",
  FORM: "Form",
  CONTACT: "Contact",
  PRODUCT: "Product",
  DIGITAL_PRODUCT: "Digital Product",
  COURSE: "Course",
  BOOKING: "Booking",
  DONATION: "Donation",
  GALLERY: "Gallery",
  CAROUSEL: "Carousel",
  MAP: "Map",
  COUNTDOWN: "Countdown",
  FAQ: "FAQ",
  TESTIMONIAL: "Testimonial",
  DIVIDER: "Divider",
  CUSTOM_EMBED: "Custom Embed",
};

function getBlockTitle(block: Block): string {
  const config = block.config;
  if (config.title && typeof config.title === "string") return config.title;
  if (config.label && typeof config.label === "string") return config.label;
  if (config.text && typeof config.text === "string")
    return config.text.slice(0, 50);
  if (config.url && typeof config.url === "string") return config.url;
  return blockTypeLabels[block.type] ?? block.type;
}

function SortableBlock({
  block,
  onToggle,
  onDelete,
}: {
  block: Block;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = blockTypeIcons[block.type] ?? Link2;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border border-slate-200 bg-white p-3 transition-shadow duration-200",
        isDragging && "shadow-lg ring-2 ring-indigo-200 z-50"
      )}
    >
      <div className="flex items-center gap-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-4" />
        </button>

        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100">
          <Icon className="size-4 text-slate-600" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-900">
            {getBlockTitle(block)}
          </p>
          <p className="text-xs text-slate-500">
            {blockTypeLabels[block.type] ?? block.type}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={block.enabled}
            onCheckedChange={(checked) => onToggle(block.id, checked as boolean)}
            aria-label={`Toggle ${getBlockTitle(block)}`}
            className="cursor-pointer"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-150 min-w-[44px] min-h-[44px]"
            aria-label="Delete block"
            onClick={() => onDelete(block.id)}
          >
            <Trash2 className="size-4 text-slate-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const addableBlockTypes = [
  "LINK",
  "HEADER",
  "TEXT",
  "IMAGE",
  "YOUTUBE",
  "EMAIL_CAPTURE",
  "SMS_CAPTURE",
  "DIVIDER",
  "CUSTOM_EMBED",
  "PRODUCT",
] as const;

export default function LinksPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">(
    "saved"
  );
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchBlocks = useCallback(async () => {
    try {
      const res = await fetch("/api/blocks");
      if (res.ok) {
        const data = await res.json();
        setBlocks(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);

    const reordered = arrayMove(blocks, oldIndex, newIndex).map((b, i) => ({
      ...b,
      position: i,
    }));
    setBlocks(reordered);
    setSaveStatus("saving");

    try {
      await fetch("/api/blocks/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: reordered.map((b) => ({ id: b.id, position: b.position })),
        }),
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("unsaved");
    }
  }

  async function handleToggle(id: string, enabled: boolean) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, enabled } : b))
    );
    setSaveStatus("saving");

    try {
      await fetch(`/api/blocks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("unsaved");
    }
  }

  async function handleDelete(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSaveStatus("saving");

    try {
      await fetch(`/api/blocks/${id}`, { method: "DELETE" });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("unsaved");
    }
  }

  async function handleAddBlock(type: string) {
    setAddSheetOpen(false);
    setSaveStatus("saving");

    try {
      const res = await fetch("/api/blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          position: blocks.length,
          config: {},
        }),
      });
      if (res.ok) {
        const newBlock = await res.json();
        setBlocks((prev) => [...prev, newBlock]);
      }
      setSaveStatus("saved");
    } catch {
      setSaveStatus("unsaved");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Links</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your bio page blocks. Drag to reorder.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs transition-colors duration-200",
              saveStatus === "saved" && "bg-green-50 text-green-700",
              saveStatus === "saving" && "bg-amber-50 text-amber-700",
              saveStatus === "unsaved" && "bg-red-50 text-red-700"
            )}
          >
            {saveStatus === "saved" && (
              <Check className="mr-1 size-3" />
            )}
            {saveStatus === "saving" && (
              <Loader2 className="mr-1 size-3 animate-spin" />
            )}
            {saveStatus === "saved"
              ? "Saved"
              : saveStatus === "saving"
                ? "Saving..."
                : "Unsaved changes"}
          </Badge>

          <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
            <SheetTrigger
              render={
                <Button className="cursor-pointer gap-2 min-h-[44px]" />
              }
            >
              <Plus className="size-4" />
              Add Block
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Add Block</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-3 p-4">
                {addableBlockTypes.map((type) => {
                  const Icon = blockTypeIcons[type] ?? Link2;
                  return (
                    <button
                      key={type}
                      onClick={() => handleAddBlock(type)}
                      className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-4 transition-colors duration-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[44px]"
                    >
                      <Icon className="size-5 text-slate-600" />
                      <span className="text-xs font-medium text-slate-700">
                        {blockTypeLabels[type]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : blocks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Link2 className="size-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-900">
              No blocks yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add your first link or content block to get started.
            </p>
            <Button
              className="mt-4 cursor-pointer gap-2 min-h-[44px]"
              onClick={() => setAddSheetOpen(true)}
            >
              <Plus className="size-4" />
              Add Block
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
