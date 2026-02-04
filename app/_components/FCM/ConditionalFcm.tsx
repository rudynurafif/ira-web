// components/ConditionalFCM.tsx
"use client";

import { usePathname } from "next/navigation";
import FCMInitializer from "./FCMInitializer";

export default function ConditionalFcm() {
  const pathname = usePathname();

  const isAuthPage = pathname.startsWith("/auth");

  if (isAuthPage) return null;

  return <FCMInitializer />;
}
