"use client";

import { useState, useTransition } from "react";
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  GripVertical,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Smartphone,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { getBlock, listBlocks } from "@/lib/blocks";
import { createBlock, updateBlock, deleteBlock, reorderBlocks } from "@/lib/actions/blocks";
import { cn } from "@/lib/utils";
import type { BlockType } from "@/lib/blocks";

import "@/lib/blocks";

type BlockItem = {
  id: string;
  type: BlockType;
  position: number;
  enabled: boolean;
  config: Record<string, unknown>;
};

function SortableBlock({
  block,
  onToggle,
  onDelete,
  onEdit,
}: {
  block: BlockItem;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const descriptor = getBlock(block.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all duration-200",
        isDragging && "opacity-50 shadow-lg",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="flex-1 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <div className="flex items-center gap-2">
          {descriptor && <descriptor.icon className="h-4 w-4 text-muted-foreground" />}
          <span className="text-sm font-medium text-foreground">
            {descriptor?.label ?? block.type}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-[200px]">
          {(block.config as Record<string, string>).title ??
            (block.config as Record<string, string>).url ??
            (block.config as Record<string, string>).text ??
            "Click to edit"}
        </p>
      </button>

      <Switch
        checked={block.enabled}
        onCheckedChange={onToggle}
        aria-label={block.enabled ? "Disable block" : "Enable block"}
        className="cursor-pointer"
      />

      <button
        type="button"
        onClick={onDelete}
        className="rounded p-1.5 text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Delete block"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function LinksEditor({
  profileId,
  username,
  initialBlocks,
}: {
  profileId: string;
  username: string;
  initialBlocks: BlockItem[];
}) {
  const [items, setItems] = useState(initialBlocks);
  const [isPending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    startTransition(async () => {
      await reorderBlocks(profileId, newItems.map((i) => i.id));
    });
  }

  function handleToggle(blockId: string) {
    const block = items.find((i) => i.id === blockId);
    if (!block) return;

    setItems((prev) =>
      prev.map((i) => (i.id === blockId ? { ...i, enabled: !i.enabled } : i)),
    );

    startTransition(async () => {
      await updateBlock(blockId, { enabled: !block.enabled });
    });
  }

  function handleDelete(blockId: string) {
    setItems((prev) => prev.filter((i) => i.id !== blockId));
    startTransition(async () => {
      await deleteBlock(blockId);
    });
  }

  function handleAddBlock(type: BlockType) {
    const descriptor = getBlock(type);
    if (!descriptor) return;

    setAddOpen(false);
    startTransition(async () => {
      const result = await createBlock(profileId, {
        type,
        enabled: true,
        config: descriptor.defaultConfig as Record<string, unknown>,
      });
      if (result.success && result.blockId) {
        setItems((prev) => [
          ...prev,
          {
            id: result.blockId!,
            type,
            position: prev.length,
            enabled: true,
            config: descriptor.defaultConfig as Record<string, unknown>,
          },
        ]);
      }
    });
  }

  const availableBlocks = listBlocks();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {items.length} block{items.length !== 1 ? "s" : ""}
          </p>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="cursor-pointer min-h-11 gap-2" />
              }
            >
              <Plus className="h-4 w-4" />
              Add Block
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add a Block</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {availableBlocks.map((desc) => (
                  <button
                    key={desc.type}
                    type="button"
                    onClick={() => handleAddBlock(desc.type)}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-all duration-200 hover:border-primary/40 hover:bg-muted/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <desc.icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {desc.label}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {desc.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {items.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <LinkIcon className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                No blocks yet. Add your first link or content block.
              </p>
            </CardContent>
          </Card>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onToggle={() => handleToggle(block.id)}
                  onDelete={() => handleDelete(block.id)}
                  onEdit={() => {}}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {isPending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </div>
        )}
      </div>

      {/* Phone preview */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <div className="flex items-center gap-2 pb-3">
            <Smartphone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Preview</span>
          </div>
          <div className="mx-auto w-[280px] rounded-[2rem] border-4 border-slate-800 bg-white p-4 shadow-xl">
            <div className="space-y-2">
              {items
                .filter((b) => b.enabled)
                .map((b) => (
                  <BlockRenderer
                    key={b.id}
                    type={b.type}
                    config={b.config}
                    blockId={b.id}
                    profileUsername={username}
                  />
                ))}
              {items.filter((b) => b.enabled).length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                  Your page preview will appear here
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
