"use client";

import Link from "next/link";
import { daysUntil, type Deadline } from "@/lib/deadlines";

// Grid card for the deadlines list — leads with days-remaining since that's
// the thing a student scanning this list actually needs first, styled with
// the pin-red accent once something's overdue (the one place CLAUDE.md's
// "alerts only" accent color is meant for).
export function DeadlineCard({ deadline }: { deadline: Deadline }) {
  const days = daysUntil(deadline.dueDate);
  const doneCount = deadline.checklist.filter((c) => c.done).length;

  let dueLabel: string;
  let dueClass: string;
  if (deadline.completed) {
    dueLabel = "Done";
    dueClass = "text-spool-teal";
  } else if (days < 0) {
    dueLabel = `${Math.abs(days)}d overdue`;
    dueClass = "text-pin-red";
  } else if (days === 0) {
    dueLabel = "Due today";
    dueClass = "text-pin-red";
  } else {
    dueLabel = `${days}d left`;
    dueClass = "text-ink/60";
  }

  return (
    <Link
      href={`/hub/deadlines/${deadline.id}`}
      className="group relative block rounded-sm p-4 bg-muslin text-ink cut-line hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className={`font-display uppercase tracking-wide text-lg mb-1 truncate ${deadline.completed ? "line-through opacity-60" : ""}`}>
          {deadline.title}
        </h3>
        <span className={`font-mono text-xs uppercase tracking-wide shrink-0 ${dueClass}`}>{dueLabel}</span>
      </div>
      {deadline.course && <p className="font-mono text-xs text-ink/60 truncate">{deadline.course}</p>}
      <div className="flex items-center justify-between mt-2 text-[11px] font-mono text-ink/50">
        <span>{deadline.dueDate}</span>
        {deadline.checklist.length > 0 && (
          <span>
            {doneCount}/{deadline.checklist.length} checklist
          </span>
        )}
      </div>
    </Link>
  );
}
