"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export function SyncFigmaButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  async function handleSync() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/figma-sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Sync failed");
      setResult(`Updated ${data.updated} entries (scanned ${data.scanned})`);
      setIsError(false);
    } catch (e: unknown) {
      setResult(e instanceof Error ? e.message : "Error");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {result && (
        <span className={`flex items-center gap-1 text-xs ${isError ? "text-red-500" : "text-emerald-600"}`}>
          {isError ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
          {result}
        </span>
      )}
      <Button size="sm" variant="ghost" onClick={handleSync} disabled={loading}>
        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        {loading ? "Syncing…" : "Sync Figma"}
      </Button>
    </div>
  );
}
