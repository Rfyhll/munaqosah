"use client";

import { useEffect } from "react";
import { useMonaqosah, hydrateFromStorage } from "@/store/monaqosah";
import { LoadingScreen } from "@/components/monaqosah/loading-screen";
import { SiteHeader } from "@/components/monaqosah/site-header";
import { ProjectorDisplay } from "@/components/monaqosah/projector-display";
import { MCScreen } from "@/components/monaqosah/mc-screen";

export default function HomePage() {
  const { isLoaded, mcScreenVisible, setMcScreenVisible } = useMonaqosah();

  // Hydrate the last displayed Word file from localStorage.
  useEffect(() => {
    hydrateFromStorage();
  }, []);

  if (!isLoaded) {
    return <LoadingScreen />;
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-[#F5F7F2] text-[#1a1a1a]">
      {/* Decorative background pattern - subtle green dots */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #0F4D3A 1px, transparent 1px), radial-gradient(circle at 80% 70%, #0F4D3A 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(15,77,58,0.08), transparent 50%), radial-gradient(circle at 0% 100%, rgba(15,77,58,0.06), transparent 50%)",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <ProjectorDisplay />
      </div>

      {/* MC Screen overlay - shown when MC is speaking */}
      <MCScreen
        visible={mcScreenVisible}
        onClose={() => setMcScreenVisible(false)}
      />
    </main>
  );
}
