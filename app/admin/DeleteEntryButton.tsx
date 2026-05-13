"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Trash2 } from "lucide-react";

export function DeleteEntryButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/entries/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} loading={loading}>
      <Trash2 size={13} className="text-red-400" />
    </Button>
  );
}
