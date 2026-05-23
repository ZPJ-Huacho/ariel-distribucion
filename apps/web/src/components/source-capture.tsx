"use client";

import { useEffect } from "react";
import { captureSource } from "@/lib/source-tracking";

export function SourceCapture() {
  useEffect(() => {
    captureSource();
  }, []);
  return null;
}
