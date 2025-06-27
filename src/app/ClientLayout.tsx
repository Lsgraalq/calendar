"use client";

import { useEffect } from "react";
import { initAppCheck } from "@/firebase/appCheckInit";

export function ClientLayout({ children }) {
  useEffect(() => {
    initAppCheck();
  }, []);

  return <>{children}</>;
}
