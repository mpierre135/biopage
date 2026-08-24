"use client";

import { useState, useEffect, useRef } from "react";
import { QrCode, Download, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function QrCodePage() {
  const [foreground, setForeground] = useState("#000000");
  const [background, setBackground] = useState("#ffffff");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    async function loadQr() {
      try {
        const res = await fetch("/api/profile/me");
        if (res.ok) {
          const data = await res.json();
          const url =
            typeof window !== "undefined"
              ? `${window.location.origin}/${data.username}`
              : `/${data.username}`;
          setProfileUrl(url);
        }
      } catch {
        // use fallback
      } finally {
        setLoading(false);
      }
    }
    loadQr();
  }, []);

  useEffect(() => {
    if (!profileUrl) return;

    async function generateQr() {
      try {
        const QRCode = (await import("qrcode")).default;
        const dataUrl = await QRCode.toDataURL(profileUrl, {
          width: 512,
          margin: 2,
          color: {
            dark: foreground,
            light: background,
          },
        });
        setQrDataUrl(dataUrl);
      } catch {
        // fallback
      }
    }
    generateQr();
  }, [profileUrl, foreground, background]);

  function handleDownload() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = "biohub-qr.png";
    link.href = qrDataUrl;
    link.click();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">QR Code</h1>
        <p className="mt-1 text-sm text-slate-600">
          Generate a QR code for your bio page to share anywhere.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QR Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {loading ? (
              <div className="flex size-64 items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code for your bio page"
                className="size-64 rounded-lg"
              />
            ) : (
              <div className="flex size-64 flex-col items-center justify-center rounded-lg bg-slate-50">
                <QrCode className="size-12 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">
                  QR code will appear here
                </p>
              </div>
            )}
            {profileUrl && (
              <p className="mt-3 text-sm text-slate-500 break-all text-center">
                {profileUrl}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="size-4" />
              Customize
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="qr-foreground" className="text-sm font-medium text-slate-700">
                Foreground Color
              </Label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="qr-foreground"
                  type="color"
                  value={foreground}
                  onChange={(e) => setForeground(e.target.value)}
                  className="size-10 cursor-pointer rounded-lg border border-slate-200 p-1"
                />
                <Input
                  value={foreground}
                  onChange={(e) => setForeground(e.target.value)}
                  className="max-w-[120px] font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="qr-background" className="text-sm font-medium text-slate-700">
                Background Color
              </Label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  id="qr-background"
                  type="color"
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="size-10 cursor-pointer rounded-lg border border-slate-200 p-1"
                />
                <Input
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="max-w-[120px] font-mono text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Button
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="w-full cursor-pointer gap-2 min-h-[44px]"
              >
                <Download className="size-4" />
                Download PNG
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
