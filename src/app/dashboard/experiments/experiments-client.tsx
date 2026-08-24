"use client";

import { useState, useTransition } from "react";
import { FlaskConical, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  createExperiment,
  deleteExperiment,
  setExperimentStatus,
} from "@/lib/actions/growth";

type ExperimentRow = {
  id: string;
  name: string;
  status: string;
  variants: { id: string; name: string; impressions: number; conversions: number }[];
};

export function ExperimentsClient({
  canUse,
  initial,
}: {
  canUse: boolean;
  initial: ExperimentRow[];
}) {
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  function create() {
    startTransition(async () => {
      const result = await createExperiment(name);
      if (!result.success) {
        toast.error(result.error ?? "Failed to create");
        return;
      }
      toast.success("Experiment created");
      setName("");
      window.location.reload();
    });
  }

  function setStatus(
    id: string,
    status: "draft" | "running" | "paused" | "completed",
  ) {
    startTransition(async () => {
      const result = await setExperimentStatus(id, status);
      if (!result.success) {
        toast.error(result.error ?? "Failed to update");
        return;
      }
      setItems((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status } : e)),
      );
      toast.success(`Marked ${status}`);
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const result = await deleteExperiment(id);
      if (!result.success) {
        toast.error(result.error ?? "Failed to delete");
        return;
      }
      setItems((prev) => prev.filter((e) => e.id !== id));
      toast.success("Deleted");
    });
  }

  if (!canUse) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Upgrade to Business to run A/B experiments on your bio page.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="exp-name">Experiment name</Label>
            <Input
              id="exp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Headline test"
              className="min-h-11"
            />
          </div>
          <Button
            className="min-h-11 cursor-pointer gap-2"
            disabled={pending}
            onClick={create}
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <FlaskConical className="size-4" />
            )}
            Create experiment
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No experiments yet. Create one to get Control + Variant B.
          </p>
        ) : (
          items.map((exp) => (
            <Card key={exp.id}>
              <CardContent className="space-y-3 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-medium">{exp.name}</h3>
                    <Badge variant="secondary" className="mt-1 capitalize">
                      {exp.status}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11 cursor-pointer"
                    disabled={pending}
                    onClick={() => remove(exp.id)}
                    aria-label={`Delete ${exp.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {exp.variants.map((v) => (
                    <li key={v.id}>
                      {v.name}: {v.impressions} views · {v.conversions}{" "}
                      conversions
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ["draft", "Draft"],
                      ["running", "Run"],
                      ["paused", "Pause"],
                      ["completed", "Complete"],
                    ] as const
                  ).map(([status, label]) => (
                    <Button
                      key={status}
                      variant={exp.status === status ? "default" : "outline"}
                      className="min-h-11 cursor-pointer"
                      disabled={pending || exp.status === status}
                      onClick={() => setStatus(exp.id, status)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
