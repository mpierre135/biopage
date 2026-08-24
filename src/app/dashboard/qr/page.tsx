"use client";

import { useState, useEffect, useCallback } from "react";
import { QrCode, Download, Copy, Check } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { brandConfig } from "@/lib/brand";

export default function QRCodePage() {
  const [url, setUrl] = useState("");
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const baseUrl =
      typeof window !== "undefined" ? window.location.origin : "";
    setUrl(baseUrl);
  }, []);

  const generateQR = useCallback(async () => {
    if (!url) return;
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 512,
        margin: 2,
        color: {
          dark: foreground,
          light: background,
        },
      });
      setQrDataUrl(dataUrl);
    } catch {
      setQrDataUrl(null);
    }
  }, [url, foreground, background]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  function handleDownload() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `${brandConfig.name.toLowerCase()}-qr.png`;
    link.href = qrDataUrl;
    link.click();
  }

  async function handleCopyUrl() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">QR Code</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate a QR code for your page. Download and share anywhere.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customize</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-url">Page URL</Label>
              <Input
                id="qr-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://biohub.com/yourname"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qr-fg">Foreground</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="qr-fg"
                    type="color"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-border"
                  />
                  <Input
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qr-bg">Background</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="qr-bg"
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded border border-border"
                  />
                  <Input
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="cursor-pointer min-h-11 gap-2 flex-1"
              >
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button
                onClick={handleCopyUrl}
                variant="outline"
                className="cursor-pointer min-h-11 gap-2"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy URL"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <QrCode className="h-4 w-4 text-muted-foreground" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="h-64 w-64 rounded-lg"
              />
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground">
                  Enter a URL to generate
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
