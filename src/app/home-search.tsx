"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { CharterSearchForm } from "@/components/charter-search-form";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/format";

export function HomeSearch() {
  const [mode, setMode] = useState<"charter" | "empty">("charter");
  return (
    <>
      <div className="mb-5 flex gap-6 border-b border-line">
        {(
          [
            ["charter", "Charter a jet"],
            ["empty", "Empty legs"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "-mb-px border-b-2 pb-3 text-[15px] font-medium transition",
              mode === m ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {mode === "charter" ? <CharterSearchForm /> : <EmptyLegSearch />}
    </>
  );
}

function EmptyLegSearch() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = new URLSearchParams();
        if (from.trim()) q.set("from", from.trim());
        if (to.trim()) q.set("to", to.trim());
        router.push(`/empty-legs/${q.size ? `?${q}` : ""}`);
      }}
      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
    >
      <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="From — city, airport or anywhere" aria-label="From" className="h-12" />
      <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="To — anywhere" aria-label="To" className="h-12" />
      <Button type="submit" size="lg">
        <Search className="h-4 w-4" /> Find deals
      </Button>
    </form>
  );
}
