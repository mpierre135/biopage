"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  attachDigitalFile,
  removeDigitalFile,
} from "@/lib/actions/digital-files";

type FileRow = {
  id: string;
  filename: string;
  sizeBytes: number | null;
};

export function ProductFileAttach({
  productId,
  canSell,
  initialFiles,
}: {
  productId: string;
  canSell: boolean;
  initialFiles: FileRow[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState(initialFiles);
  const [pending, startTransition] = useTransition();

  if (!canSell) return null;

  function upload(file: File) {
    startTransition(async () => {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body });
      const data = (await res.json()) as {
        error?: string;
        key?: string;
        filename?: string;
        mimeType?: string;
        sizeBytes?: number;
      };
      if (!res.ok || !data.key) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      const result = await attachDigitalFile(productId, {
        filename: data.filename ?? file.name,
        storageKey: data.key,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
      });
      if (!result.success || !result.fileId) {
        toast.error(result.error ?? "Failed to attach file");
        return;
      }
      setFiles((prev) => [
        ...prev,
        {
          id: result.fileId!,
          filename: data.filename ?? file.name,
          sizeBytes: data.sizeBytes ?? null,
        },
      ]);
      toast.success("File attached");
    });
  }

  function remove(fileId: string) {
    startTransition(async () => {
      const result = await removeDigitalFile(fileId);
      if (!result.success) {
        toast.error(result.error ?? "Failed to remove");
        return;
      }
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      toast.success("File removed");
    });
  }

  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <p className="text-xs font-medium text-muted-foreground">Digital files</p>
      {files.map((f) => (
        <div
          key={f.id}
          className="flex items-center justify-between gap-2 text-sm"
        >
          <span className="truncate">{f.filename}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 cursor-pointer"
            disabled={pending}
            onClick={() => remove(f.id)}
            aria-label={`Remove ${f.filename}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full cursor-pointer gap-2"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Paperclip className="size-4" />
        )}
        Attach file
      </Button>
    </div>
  );
}
