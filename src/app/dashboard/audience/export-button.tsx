"use client";

import { useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportAudienceCsv } from "@/lib/actions/audience";

export function ExportAudienceButton({
  profileId,
  canExport,
}: {
  profileId: string;
  canExport: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (!canExport) {
    return (
      <Button
        variant="outline"
        className="min-h-11 cursor-pointer gap-2"
        disabled
        title="Upgrade to Pro"
      >
        <Download className="h-4 w-4" />
        Export CSV
      </Button>
    );
  }

  function download() {
    startTransition(async () => {
      const result = await exportAudienceCsv(profileId);
      if (!result.success || !result.csv) {
        toast.error(result.error ?? "Export failed");
        return;
      }
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "audience.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("CSV downloaded");
    });
  }

  return (
    <Button
      variant="outline"
      className="min-h-11 cursor-pointer gap-2"
      onClick={download}
      disabled={pending}
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Export CSV
    </Button>
  );
}
