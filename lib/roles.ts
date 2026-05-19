// Central role permission helpers — import these instead of hardcoding role strings

export const ROLE_LABELS: Record<string, string> = {
  ADMIN:          "Admin",
  SUPER_EDITOR:   "Super Editor",
  CONTENT_EDITOR: "Content Editor",
  OFFER_MANAGER:  "Offer Manager",
  VIEWER:         "Viewer",
  EDITOR:         "Content Editor", // legacy — treated as CONTENT_EDITOR
};

export const ROLE_OPTIONS = [
  { value: "VIEWER",         label: "Viewer" },
  { value: "CONTENT_EDITOR", label: "Content Editor" },
  { value: "OFFER_MANAGER",  label: "Offer Manager" },
  { value: "SUPER_EDITOR",   label: "Super Editor" },
  { value: "ADMIN",          label: "Admin" },
];

// Can create/edit/delete entries and brand materials
export function canManageContent(role?: string | null): boolean {
  return ["ADMIN", "SUPER_EDITOR", "CONTENT_EDITOR", "EDITOR"].includes(role ?? "");
}

// Can create/edit/delete offers
export function canManageOffers(role?: string | null): boolean {
  return ["ADMIN", "SUPER_EDITOR", "OFFER_MANAGER"].includes(role ?? "");
}

// Can manage users (create, edit roles, deactivate)
export function canManageUsers(role?: string | null): boolean {
  return role === "ADMIN";
}

// Has access to any part of the admin panel
export function hasAdminAccess(role?: string | null): boolean {
  return ["ADMIN", "SUPER_EDITOR", "CONTENT_EDITOR", "OFFER_MANAGER", "EDITOR"].includes(role ?? "");
}
