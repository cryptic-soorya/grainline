"use client";

// Shared input styling + labeled wrapper for the swatch add/edit forms —
// pulled out once it was needed identically in both places.
export const inputClass =
  "w-full bg-muslin text-ink border border-ink/15 rounded-sm px-3 py-2 font-mono text-sm focus:outline-none focus:border-chalk-gold";

export function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-xs uppercase tracking-wide text-parchment/60 mb-1">
        {label}
        {required && <span className="text-pin-red"> *</span>}
      </span>
      {children}
    </label>
  );
}
