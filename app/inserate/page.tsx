"use client";

import { Suspense } from "react";
import { SkeletonList } from "@/components/ui/Skeleton";
import InserateContent from "./InserateContent";

export default function InseratePage() {
  return (
    <Suspense fallback={<SkeletonList count={3} />}>
      <InserateContent />
    </Suspense>
  );
}
