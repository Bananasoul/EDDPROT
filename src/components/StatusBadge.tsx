"use client";

import { Badge } from "@/components/ui/Badge";
import { useApp } from "@/lib/app-context";
import type { PatientStatus } from "@/lib/mock-data";

const variants: Record<PatientStatus, "navy" | "amber" | "accent" | "clover" | "slate" | "outline"> = {
  prescribed: "slate",
  contacted: "outline",
  scheduled: "navy",
  t0_done: "navy",
  in_program: "clover",
  t1_due: "amber",
  completed: "clover",
};

export function StatusBadge({ status }: { status: PatientStatus }) {
  const { t } = useApp();
  return <Badge variant={variants[status]}>{t.status[status]}</Badge>;
}
