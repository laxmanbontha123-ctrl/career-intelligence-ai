"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import CareerSidebar from "@/app/components/career-sidebar";

function isPublicPage(pathname: string) {
  return (
    pathname === "/" ||
    pathname.startsWith("/register") ||
    pathname === "/onboarding"
  );
}

export default function CareerShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (isPublicPage(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <CareerSidebar />

      <div className="min-w-0 lg:pl-72">
        {children}
      </div>
    </>
  );
}
