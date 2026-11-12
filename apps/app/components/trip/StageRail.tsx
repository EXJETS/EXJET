import { STAGES } from "@/lib/rules";

const ANCHORS = ["request", "aircraft", "rfq", "quotes", "contract", "payment", "manifest", "flight"];

export function StageRail({ current, cancelled }: { current: number; cancelled: boolean }) {
  return (
    <nav aria-label="Trip stages">
      <ol className="rail">
        {STAGES.map((s, i) => {
          const state = cancelled ? "todo" : i < current ? "done" : i === current ? "current" : "todo";
          return (
            <li key={s} data-state={state}>
              <a href={`#${ANCHORS[i]}`} aria-current={state === "current" ? "step" : undefined}>
                <span className="n">{String(i + 1).padStart(2, "0")}</span>
                <span className="t">{s}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
