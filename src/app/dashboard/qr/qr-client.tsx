"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function QrClient({
  url,
  username,
}: {
  url: string;
  username: string;
}) {
  const [foreground, setForeground] = useState("#0f172a");
  const [background, setBackground] = useState("#ffffff");
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void QRCode.toDataURL(url, {
      width: 512,
      margin: 2,
      color: { dark: foreground, light: background },
      errorCorrectionLevel: "H",
    }).then((png) => {
      if (!cancelled) setDataUrl(png);
    });
    return () => {
      cancelled = true;
    };
  }, [url, foreground, background]);

  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="flex size-56 items-center justify-center rounded-xl border border-border bg-white p-3">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={dataUrl}
              alt={`QR code for ${username}`}
              className="size-full"
            />
          ) : (
            <div className="size-full animate-pulse rounded-lg bg-muted" />
          )}
        </div>
        <div className="w-full flex-1 space-y-4">
          <p className="break-all text-sm text-muted-foreground">{url}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="fg">Foreground</Label>
              <Input
                id="fg"
                type="color"
                value={foreground}
                onChange={(e) => setForeground(e.target.value)}
                className="min-h-11 cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bg">Background</Label>
              <Input
                id="bg"
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="min-h-11 cursor-pointer"
              />
            </div>
          </div>
          <a
            href={dataUrl ?? undefined}
            download={`${username}-qr.png`}
            className={!dataUrl ? "pointer-events-none opacity-50" : undefined}
          >
            <Button className="min-h-11 w-full cursor-pointer" disabled={!dataUrl}>
              <Download className="size-4" aria-hidden />
              Download PNG
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
