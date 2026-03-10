"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BlogRedirect() {
  const router = useRouter();

  useEffect(() => {
    const lang = navigator.language || navigator.languages?.[0] || "en";
    const isPt = lang.toLowerCase().startsWith("pt");
    router.replace(isPt ? "/blog/pt" : "/blog/en");
  }, [router]);

  return (
    <div className="min-h-dvh flex items-center justify-center">
      <p className="text-sm text-neutral-400">Redirecting...</p>
    </div>
  );
}
