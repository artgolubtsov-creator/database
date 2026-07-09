"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeactivateUserToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(isActive);
  const [isSaving, setIsSaving] = useState(false);

  const updateStatus = async () => {
    const next = !checked;
    setChecked(next);
    setIsSaving(true);

    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });

    setIsSaving(false);

    if (!res.ok) {
      setChecked(!next);
      return;
    }

    router.refresh();
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? "Deactivate user" : "Activate user"}
      onClick={updateStatus}
      disabled={isSaving}
      className={`relative h-6 w-10 rounded-full transition-colors disabled:opacity-60 ${
        checked ? "bg-emerald-500" : "bg-neutral-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}
