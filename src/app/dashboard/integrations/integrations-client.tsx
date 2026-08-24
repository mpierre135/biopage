"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Loader2,
  Music,
  Plug,
  ShoppingBag,
  Unplug,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  disconnectIntegration,
  importShopifyProducts,
  saveApiKeyIntegration,
  saveShopifyStoreUrl,
} from "@/lib/actions/integrations";
import type { ApiKeyProvider, PlatformFlags } from "@/lib/integrations/catalog";

export type IntegrationStatus = {
  provider: string;
  enabled: boolean;
  oauthConnected: boolean;
  accountLabel: string | null;
  shop: string | null;
  listId: string | null;
};

function StatusBadge({
  connected,
  label,
}: {
  connected: boolean;
  label: string;
}) {
  return (
    <Badge variant={connected ? "default" : "secondary"}>
      {connected ? label : "Not connected"}
    </Badge>
  );
}

export function IntegrationsClient({
  canUse,
  platform,
  initial,
}: {
  canUse: boolean;
  platform: PlatformFlags;
  initial: IntegrationStatus[];
}) {
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const shopify = rows.find((r) => r.provider === "shopify");
  const [shop, setShop] = useState(shopify?.shop ?? "");
  const [mailchimpKey, setMailchimpKey] = useState("");
  const [mailchimpList, setMailchimpList] = useState(
    rows.find((r) => r.provider === "mailchimp")?.listId ?? "",
  );
  const [klaviyoKey, setKlaviyoKey] = useState("");

  function byProvider(id: string) {
    return rows.find((r) => r.provider === id);
  }

  function disconnect(provider: string) {
    startTransition(async () => {
      const result = await disconnectIntegration(provider);
      if (!result.success) {
        toast.error(result.error ?? "Could not disconnect");
        return;
      }
      setRows((prev) => prev.filter((r) => r.provider !== provider));
      toast.success("Disconnected");
    });
  }

  function saveKey(provider: ApiKeyProvider, apiKey: string, listId?: string) {
    startTransition(async () => {
      const result = await saveApiKeyIntegration(provider, apiKey, { listId });
      if (!result.success) {
        toast.error(result.error ?? "Could not save");
        return;
      }
      setRows((prev) => {
        const others = prev.filter((r) => r.provider !== provider);
        return [
          ...others,
          {
            provider,
            enabled: true,
            oauthConnected: false,
            accountLabel: "API key saved",
            shop: null,
            listId: listId ?? null,
          },
        ];
      });
      toast.success("Connected");
    });
  }

  if (!canUse) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Upgrade to Pro to connect Shopify, Spotify, Meta, and email tools.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50">
                <ShoppingBag className="size-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="font-medium">Shopify</h3>
                <p className="text-xs text-muted-foreground">
                  Connect a store so merch blocks can import products and send
                  buyers to checkout.
                </p>
              </div>
            </div>
            <StatusBadge
              connected={Boolean(shopify)}
              label={
                shopify?.oauthConnected ? "OAuth connected" : "Store saved"
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shopify-shop">Store domain</Label>
            <Input
              id="shopify-shop"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              placeholder="yourstore.myshopify.com"
              className="min-h-11"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="min-h-11 cursor-pointer"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  const result = await saveShopifyStoreUrl(shop);
                  if (!result.success) {
                    toast.error(result.error ?? "Could not save store");
                    return;
                  }
                  setRows((prev) => {
                    const current = prev.find((r) => r.provider === "shopify");
                    const others = prev.filter((r) => r.provider !== "shopify");
                    return [
                      ...others,
                      {
                        provider: "shopify",
                        enabled: true,
                        oauthConnected: current?.oauthConnected ?? false,
                        accountLabel: current?.accountLabel ?? shop,
                        shop,
                        listId: null,
                      },
                    ];
                  });
                  toast.success("Store saved");
                });
              }}
            >
              Save store
            </Button>
            {platform.shopify ? (
              <Button
                variant="outline"
                className="min-h-11 cursor-pointer"
                disabled={pending || !shop.trim()}
                render={
                  <a
                    href={`/api/integrations/shopify/start?shop=${encodeURIComponent(shop.trim())}`}
                  />
                }
              >
                <Plug className="size-4" />
                Connect with Shopify
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground self-center">
                OAuth needs SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET on the
                server.
              </p>
            )}
            {shopify?.oauthConnected ? (
              <Button
                variant="outline"
                className="min-h-11 cursor-pointer"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await importShopifyProducts();
                    if (!result.success) {
                      toast.error(result.error ?? "Import failed");
                      return;
                    }
                    toast.success(
                      `Imported ${result.imported ?? 0} product${result.imported === 1 ? "" : "s"}`,
                    );
                  });
                }}
              >
                Import products
              </Button>
            ) : null}
            {shopify ? (
              <Button
                variant="outline"
                className="min-h-11 cursor-pointer gap-2"
                disabled={pending}
                onClick={() => disconnect("shopify")}
              >
                <Unplug className="size-4" />
                Disconnect
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-green-50">
                <Music className="size-5 text-green-700" />
              </div>
              <div>
                <h3 className="font-medium">Spotify</h3>
                <p className="text-xs text-muted-foreground">
                  Track/playlist embeds already work by pasting a Spotify URL
                  on a block. Account login unlocks your profile for later
                  music features.
                </p>
              </div>
            </div>
            <StatusBadge
              connected={Boolean(byProvider("spotify")?.oauthConnected)}
              label={byProvider("spotify")?.accountLabel ?? "Connected"}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {platform.spotify ? (
              <Button
                className="min-h-11 cursor-pointer gap-2"
                render={<a href="/api/integrations/spotify/start" />}
              >
                <Plug className="size-4" />
                Connect Spotify
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to enable
                account login. Embeds do not need this.
              </p>
            )}
            {byProvider("spotify") ? (
              <Button
                variant="outline"
                className="min-h-11 cursor-pointer gap-2"
                disabled={pending}
                onClick={() => disconnect("spotify")}
              >
                <Unplug className="size-4" />
                Disconnect
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">Meta (Facebook / Instagram)</h3>
              <p className="text-xs text-muted-foreground">
                Ads on Facebook and Instagram share one Meta Pixel. Paste the
                pixel ID under{" "}
                <Link href="/dashboard/pixels" className="underline">
                  Pixels
                </Link>
                . Optional Facebook login below is for pulling ad-account
                metadata later.
              </p>
            </div>
            <StatusBadge
              connected={Boolean(byProvider("meta")?.oauthConnected)}
              label={byProvider("meta")?.accountLabel ?? "Connected"}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {platform.meta ? (
              <Button
                className="min-h-11 cursor-pointer gap-2"
                render={<a href="/api/integrations/meta/start" />}
              >
                <Plug className="size-4" />
                Connect Facebook
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add META_APP_ID and META_APP_SECRET to enable Facebook login.
                Pixel IDs work today without it.
              </p>
            )}
            {byProvider("meta") ? (
              <Button
                variant="outline"
                className="min-h-11 cursor-pointer gap-2"
                disabled={pending}
                onClick={() => disconnect("meta")}
              >
                <Unplug className="size-4" />
                Disconnect
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">Mailchimp</h3>
              <p className="text-xs text-muted-foreground">
                New email captures are forwarded to this audience.
              </p>
            </div>
            <StatusBadge
              connected={Boolean(byProvider("mailchimp"))}
              label="Connected"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mc-key">API key</Label>
              <Input
                id="mc-key"
                type="password"
                value={mailchimpKey}
                onChange={(e) => setMailchimpKey(e.target.value)}
                placeholder="••••••••-us21"
                className="min-h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mc-list">Audience ID</Label>
              <Input
                id="mc-list"
                value={mailchimpList}
                onChange={(e) => setMailchimpList(e.target.value)}
                placeholder="abc123def"
                className="min-h-11"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="min-h-11 cursor-pointer"
              disabled={pending}
              onClick={() => saveKey("mailchimp", mailchimpKey, mailchimpList)}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
            {byProvider("mailchimp") ? (
              <Button
                variant="outline"
                className="min-h-11 cursor-pointer"
                disabled={pending}
                onClick={() => disconnect("mailchimp")}
              >
                Disconnect
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-medium">Klaviyo</h3>
              <p className="text-xs text-muted-foreground">
                New email captures are created as Klaviyo profiles.
              </p>
            </div>
            <StatusBadge
              connected={Boolean(byProvider("klaviyo"))}
              label="Connected"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kl-key">Private API key</Label>
            <Input
              id="kl-key"
              type="password"
              value={klaviyoKey}
              onChange={(e) => setKlaviyoKey(e.target.value)}
              placeholder="pk_••••"
              className="min-h-11"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="min-h-11 cursor-pointer"
              disabled={pending}
              onClick={() => saveKey("klaviyo", klaviyoKey)}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
            {byProvider("klaviyo") ? (
              <Button
                variant="outline"
                className="min-h-11 cursor-pointer"
                disabled={pending}
                onClick={() => disconnect("klaviyo")}
              >
                Disconnect
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
