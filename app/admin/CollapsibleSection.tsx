"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  storageKey: string;
  title: string;
  count: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({ storageKey, title, count, actions, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    const saved = localStorage.getItem(`admin-section-${storageKey}`);
    if (saved !== null) setOpen(saved === "1");
  }, [storageKey]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem(`admin-section-${storageKey}`, next ? "1" : "0");
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={toggle}
          className="flex items-center gap-2.5 group text-left"
        >
          <ChevronDown
            size={18}
            className={`text-neutral-400 group-hover:text-neutral-600 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
          />
          <div>
            <h2 className="text-xl font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">{title}</h2>
            <p className="text-sm text-neutral-500 mt-0.5">{count}</p>
          </div>
        </button>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {open && children}
    </section>
  );
}
