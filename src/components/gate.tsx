"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { EmptyState, LinkButton, SkeletonList } from "@/components/ui";
import { useHydrated, useSession } from "@/store/app-store";
import type { Role, User } from "@/lib/types";

/** Renders children only for a signed-in user (optionally with a given role). */
export function Gate({
  role,
  children,
  next,
}: {
  role?: Role;
  children: (user: User) => ReactNode;
  next: string;
}) {
  const ready = useHydrated();
  const user = useSession();
  if (!ready) return <SkeletonList />;
  if (!user || (role && user.role !== role)) {
    return (
      <EmptyState
        icon={<Lock className="h-5 w-5" strokeWidth={1.8} />}
        title={user ? `This area is for ${role} accounts` : "Sign in to continue"}
        body={
          user
            ? "Switch to the right account from the Account tab."
            : "Your trips, alerts and bookings are tied to your EXJET account."
        }
        action={<LinkButton href={`/account/?next=${encodeURIComponent(next)}`}>{user ? "Go to account" : "Sign in"}</LinkButton>}
      />
    );
  }
  return <>{children(user)}</>;
}
