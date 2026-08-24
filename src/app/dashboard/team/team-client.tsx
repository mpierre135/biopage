"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inviteTeamMember, removeTeamMember } from "@/lib/actions/growth";

type Member = {
  id: string;
  email: string;
  firstName: string | null;
  role: string;
};

export function TeamClient({
  canUse,
  initial,
}: {
  canUse: boolean;
  initial: Member[];
}) {
  const [members, setMembers] = useState(initial);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "editor" | "analyst" | "billing">(
    "editor",
  );
  const [pending, startTransition] = useTransition();

  function invite() {
    startTransition(async () => {
      const result = await inviteTeamMember(email, role);
      if (!result.success) {
        toast.error(result.error ?? "Invite failed");
        return;
      }
      toast.success("Teammate added");
      setEmail("");
      // Soft refresh list via reload is fine; keep optimistic placeholder
      window.location.reload();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await removeTeamMember(id);
      if (!result.success) {
        toast.error(result.error ?? "Remove failed");
        return;
      }
      setMembers((m) => m.filter((x) => x.id !== id));
      toast.success("Removed");
    });
  }

  if (!canUse) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Upgrade to Business to invite editors, analysts, and admins.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Teammate email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="they@already-signed-up.com"
              className="min-h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as typeof role)
              }
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
              <option value="analyst">Analyst</option>
              <option value="billing">Billing</option>
            </select>
          </div>
          <Button
            className="min-h-11 cursor-pointer gap-2"
            disabled={pending}
            onClick={invite}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Invite
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No teammates yet.</p>
        ) : (
          members.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex items-center justify-between gap-3 pt-4">
                <div>
                  <p className="font-medium">
                    {m.firstName ?? m.email}
                  </p>
                  <p className="text-sm text-muted-foreground">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {m.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11 cursor-pointer"
                    disabled={pending}
                    onClick={() => remove(m.id)}
                    aria-label={`Remove ${m.email}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
