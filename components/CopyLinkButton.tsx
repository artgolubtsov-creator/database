"use client";
import { useState } from "react";
import { Link2, Check } from "lucide-react";

export function CopyLinkButton({ shareToken }: { shareToken: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}/share/${shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 transition-all"
    >
      {copied ? <Check size={13} className="text-emerald-500" /> : <Link2 size={13} />}
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
