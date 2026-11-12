"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/hooks/me";
import { PageSkeleton } from "@/components/Shell";

export default function Home() {
  const { me, loading } = useMe();
  const router = useRouter();
  useEffect(() => {
    if (loading) return;
    router.replace(me ? (me.next_step === "ready" ? "/trips" : "/onboarding") : "/login");
  }, [me, loading, router]);
  return <PageSkeleton />;
}
