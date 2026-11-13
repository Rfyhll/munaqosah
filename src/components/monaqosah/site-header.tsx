"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Mic2 } from "lucide-react";
import { useMonaqosah } from "@/store/monaqosah";
import { startArabicMusic, stopArabicMusic, initAudio } from "@/lib/arabic-music";

export function SiteHeader() {
  const { audioEnabled, toggleAudio, mcScreenVisible, setMcScreenVisible } =
    useMonaqosah();

  const handleToggleAudio = () => {
    const next = !audioEnabled;
    toggleAudio();
    initAudio();
    if (next) {
      startArabicMusic();
    } else {
      stopArabicMusic();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#0F4D3A]/20 bg-[#0F4D3A] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <Image
              src="/OIP.jpg"
              alt="Logo Bahtra"
              width={48}
              height={48}
              className="rounded-full"
            />
          </motion.div>
          <div className="leading-tight">
            <motion.h1
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base font-black tracking-[0.25em] text-white md:text-lg"
            >
              MUNAQOSYAH
            </motion.h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm font-medium text-[#F7E07A]">
                مناقشة
              </span>
              <span className="text-[10px] tracking-[0.2em] text-white/70">
                PESANTREN BAHTRA
              </span>
            </motion.div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setMcScreenVisible(!mcScreenVisible)}
            className={`gap-2 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white ${
              mcScreenVisible ? "bg-white/15" : ""
            }`}
          >
            <Mic2 className="h-4 w-4" />
            <span className="hidden text-xs font-semibold tracking-wider sm:inline">
              MC Screen
            </span>
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={handleToggleAudio}
            className="h-9 w-9 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
            aria-label={audioEnabled ? "Matikan suara" : "Nyalakan suara"}
          >
            {audioEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
