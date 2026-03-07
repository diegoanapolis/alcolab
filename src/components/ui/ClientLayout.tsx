"use client"
import { useState } from "react";
import BottomTabs from "@/components/ui/BottomTabs";
import TopBar from "@/components/ui/TopBar";
import TermsGate from "@/components/ui/TermsGate";
import WorkerPreload from "@/components/ui/WorkerPreload";
import SplashScreen from "@/components/ui/SplashScreen";
import { LanguageProvider } from "@/lib/i18n";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <LanguageProvider>
      {!splashDone && (
        <SplashScreen onComplete={() => setSplashDone(true)} />
      )}
      {splashDone && (
        <TermsGate>
          <WorkerPreload />
          <TopBar />
          <div className="md:max-w-md md:mx-auto pt-2 pb-16">{children}</div>
          <BottomTabs />
        </TermsGate>
      )}
    </LanguageProvider>
  );
}
