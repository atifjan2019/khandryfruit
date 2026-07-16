"use client";

import { readinessTargetId } from "./readiness-targets";

export function ReadinessBlockers({ blockers }: { blockers: string[] }) {
  const focusTarget = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    if (!el.matches("input, select, textarea, button, a, [tabindex]"))
      el.setAttribute("tabindex", "-1");
    (el as HTMLElement).focus({ preventScroll: true });
  };
  return (
    <ul>
      {blockers.map((blocker) => {
        const target = readinessTargetId[blocker];
        const label = blocker.replaceAll("_", " ").toLowerCase();
        return (
          <li key={blocker}>
            {target ? (
              <button
                type="button"
                className="readiness-blocker"
                onClick={() => focusTarget(target)}
              >
                {label}
              </button>
            ) : (
              label
            )}
          </li>
        );
      })}
    </ul>
  );
}
