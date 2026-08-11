"use client";

import Link from "next/link";
import { FIELD_LABEL, STANDARD_FIELDS, type MeasurementProfile } from "@/lib/measurements";

// Grid card for the measurements list — no photo (unlike swatches), so it
// leads with the name and surfaces a couple of the most-referenced
// measurements for a fast scan instead.
export function MeasurementCard({ profile }: { profile: MeasurementProfile }) {
  const filledCount = STANDARD_FIELDS.filter((f) => profile[f] != null).length;
  const preview = STANDARD_FIELDS.filter((f) => profile[f] != null).slice(0, 3);

  return (
    <Link
      href={`/hub/measurements/${profile.id}`}
      className="group relative block rounded-sm p-4 bg-muslin text-ink cut-line hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
    >
      <h3 className="font-display uppercase tracking-wide text-lg mb-1 truncate">
        {profile.name}
      </h3>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] font-mono uppercase tracking-wide text-ink/50">
        {preview.map((f) => (
          <span key={f}>
            {FIELD_LABEL[f]} {profile[f]}
            {profile.unit}
          </span>
        ))}
      </div>
      <p className="font-mono text-[11px] text-ink/40 mt-2 uppercase tracking-wide">
        {filledCount} of {STANDARD_FIELDS.length} measurements logged
      </p>
    </Link>
  );
}
