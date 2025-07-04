"use client";

import { useEffect } from "react";
import { initAppCheck } from "@/firebase/appCheckInit";
import { ReactNode } from "react";


export function ClientLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    initAppCheck();
  }, []);

  return <>{children}</>;
}
