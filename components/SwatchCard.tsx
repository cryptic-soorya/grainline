"use client";

import Link from "next/link";
import { DRAPE_LABEL, OPACITY_LABEL, type Swatch } from "@/lib/swatches";

// Grid card for the fabric library list — a photo thumbnail plus the specs
// that matter most for a fast visual scan, styled like the rest of the app's
// muslin/cut-line surfaces.
export function SwatchCard({ swatch }: { swatch: Swatch }) {
  return (
    <Link
      href={`/hub/fabric-library/${swatch.id}`}
      className="group relative block rounded-sm overflow-hidden bg-muslin text-ink cut-line hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
    >
      <div className="aspect-[4/3] bg-ink/10 flex items-center justify-center overflow-hidden">
        {swatch.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={swatch.photoDataUrl}
            alt={swatch.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="font-mono text-xs text-ink/30 uppercase tracking-widest">
            No photo
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display uppercase tracking-wide text-lg mb-1 truncate">
          {swatch.name}
        </h3>
        {swatch.fiberContent && (
          <p className="font-mono text-xs text-ink/60 truncate">{swatch.fiberContent}</p>
        )}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[11px] font-mono uppercase tracking-wide text-ink/50">
          {swatch.gsm != null && <span>{swatch.gsm} gsm</span>}
          {swatch.stretchPercent != null && <span>{swatch.stretchPercent}% stretch</span>}
          {swatch.drape && <span>{DRAPE_LABEL[swatch.drape]}</span>}
          {swatch.opacity && <span>{OPACITY_LABEL[swatch.opacity]}</span>}
        </div>
      </div>
    </Link>
  );
}
