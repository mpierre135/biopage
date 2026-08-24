"use client";

import { useState, useEffect, useTransition } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

type ProfileData = {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  location: string | null;
  profileImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  visibility: string;
  isPublished: boolean;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile/me");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function handleChange(field: keyof ProfileData, value: string | boolean) {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    setSaved(false);
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/profile/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: profile.displayName,
          bio: profile.bio,
          username: profile.username,
          location: profile.location,
          profileImage: profile.profileImage,
          seoTitle: profile.seoTitle,
          seoDescription: profile.seoDescription,
          visibility: profile.visibility,
          isPublished: profile.isPublished,
        }),
      });
      if (res.ok) {
        setSaved(true);
      }
    } catch {
      // error handling
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-slate-500">
          Could not load profile settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your profile information and preferences.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="cursor-pointer gap-2 min-h-[44px]"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Saving..." : saved ? "Saved" : "Save Changes"}
        </Button>
      </div>

      {/* Profile settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="displayName" className="text-sm font-medium text-slate-700">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={profile.displayName ?? ""}
                onChange={(e) =>
                  handleChange("displayName", (e.target as HTMLInputElement).value)
                }
                className="mt-2"
                placeholder="Your display name"
              />
            </div>
            <div>
              <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                Username
              </Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) =>
                  handleChange("username", (e.target as HTMLInputElement).value)
                }
                className="mt-2"
                placeholder="username"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio" className="text-sm font-medium text-slate-700">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={profile.bio ?? ""}
              onChange={(e) =>
                handleChange("bio", (e.target as HTMLTextAreaElement).value)
              }
              className="mt-2"
              rows={3}
              placeholder="Tell visitors about yourself..."
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="location" className="text-sm font-medium text-slate-700">
                Location
              </Label>
              <Input
                id="location"
                value={profile.location ?? ""}
                onChange={(e) =>
                  handleChange("location", (e.target as HTMLInputElement).value)
                }
                className="mt-2"
                placeholder="City, Country"
              />
            </div>
            <div>
              <Label htmlFor="profileImage" className="text-sm font-medium text-slate-700">
                Profile Image URL
              </Label>
              <Input
                id="profileImage"
                value={profile.profileImage ?? ""}
                onChange={(e) =>
                  handleChange("profileImage", (e.target as HTMLInputElement).value)
                }
                className="mt-2"
                placeholder="https://..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO settings */}
      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="seoTitle" className="text-sm font-medium text-slate-700">
              SEO Title
            </Label>
            <Input
              id="seoTitle"
              value={profile.seoTitle ?? ""}
              onChange={(e) =>
                handleChange("seoTitle", (e.target as HTMLInputElement).value)
              }
              className="mt-2"
              placeholder="Page title for search engines"
            />
          </div>
          <div>
            <Label htmlFor="seoDescription" className="text-sm font-medium text-slate-700">
              SEO Description
            </Label>
            <Textarea
              id="seoDescription"
              value={profile.seoDescription ?? ""}
              onChange={(e) =>
                handleChange("seoDescription", (e.target as HTMLTextAreaElement).value)
              }
              className="mt-2"
              rows={2}
              placeholder="Brief description for search engines"
            />
          </div>
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Visibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isPublished" className="text-sm font-medium text-slate-700">
                Published
              </Label>
              <p className="text-sm text-slate-500">
                Make your page visible to visitors.
              </p>
            </div>
            <Switch
              id="isPublished"
              checked={profile.isPublished}
              onCheckedChange={(checked) =>
                handleChange("isPublished", checked as boolean)
              }
              className="cursor-pointer"
            />
          </div>

          <div>
            <Label htmlFor="visibility" className="text-sm font-medium text-slate-700">
              Visibility
            </Label>
            <Select
              value={profile.visibility}
              onValueChange={(value) => handleChange("visibility", value)}
            >
              <SelectTrigger className="mt-2 cursor-pointer min-h-[44px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public" className="cursor-pointer">
                  Public
                </SelectItem>
                <SelectItem value="unlisted" className="cursor-pointer">
                  Unlisted
                </SelectItem>
                <SelectItem value="private" className="cursor-pointer">
                  Private
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-slate-500">
              Public pages are discoverable. Unlisted pages are only accessible
              via direct link. Private pages are hidden.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
