"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  startMcMusic,
  stopArabicMusic,
  initAudio,
} from "@/lib/arabic-music";

interface MCScreenProps {
  visible: boolean;
  onClose: () => void;
}

export function MCScreen({ visible, onClose }: MCScreenProps) {
  const [musicOn, setMusicOn] = useState(true);

  // Start/stop Arabic music when screen visibility changes.
  useEffect(() => {
    if (visible) {
      initAudio();
      // Small delay to let audio context initialize.
      const t = setTimeout(() => {
        if (musicOn) startMcMusic();
      }, 200);
      return () => {
        clearTimeout(t);
        stopArabicMusic();
      };
    } else {
      stopArabicMusic();
    }
  }, [visible, musicOn]);

  const toggleMusic = () => {
    const next = !musicOn;
    setMusicOn(next);
    if (next) {
      startMcMusic();
    } else {
      stopArabicMusic();
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="mc-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center overflow-hidden bg-[#F5F7F2]"
        >
          {/* Decorative rotating geometric ring (subtle, large) */}
          <motion.div
            className="absolute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15, rotate: 360 }}
            transition={{
              opacity: { duration: 2 },
              rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            }}
          >
            <svg width="700" height="700" viewBox="0 0 700 700">
              <circle
                cx="350"
                cy="350"
                r="320"
                fill="none"
                stroke="#0F4D3A"
                strokeWidth="1"
                strokeDasharray="4 12"
              />
              <circle
                cx="350"
                cy="350"
                r="260"
                fill="none"
                stroke="#0F4D3A"
                strokeWidth="0.5"
                strokeDasharray="2 16"
              />
              <circle
                cx="350"
                cy="350"
                r="200"
                fill="none"
                stroke="#1B6B4F"
                strokeWidth="0.5"
              />
            </svg>
          </motion.div>

          {/* Counter-rotating 8-pointed star ornament */}
          <motion.div
            className="absolute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08, rotate: -360 }}
            transition={{
              opacity: { duration: 2 },
              rotate: { duration: 80, repeat: Infinity, ease: "linear" },
            }}
          >
            <svg width="500" height="500" viewBox="0 0 500 500">
              <path
                d="M250,30 L290,210 L470,250 L290,290 L250,470 L210,290 L30,250 L210,210 Z"
                fill="#0F4D3A"
              />
              <path
                d="M250,30 L290,210 L470,250 L290,290 L250,470 L210,290 L30,250 L210,210 Z"
                fill="#0F4D3A"
                transform="rotate(45 250 250)"
              />
            </svg>
          </motion.div>

          {/* Particles - 36 green dots in dual orbit */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i / 36) * Math.PI * 2;
            const isInner = i % 3 === 0;
            const r = isInner ? 200 + ((i * 17) % 50) : 300 + ((i * 29) % 100);
            const size = isInner ? "h-2 w-2" : "h-1.5 w-1.5";
            return (
              <motion.span
                key={`mc-p-${i}`}
                className={`absolute ${size} rounded-full bg-[#0F4D3A]`}
                initial={{
                  x: Math.cos(angle) * r,
                  y: Math.sin(angle) * r,
                  opacity: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.3, isInner ? 1.8 : 1.3, 0.3],
                  rotate: 360,
                }}
                transition={{
                  opacity: {
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.07,
                    ease: "easeInOut",
                  },
                  scale: {
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.07,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: isInner ? 10 : 15,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
              />
            );
          })}

          {/* 8 floating diamond ornaments */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
            const r = 380;
            return (
              <motion.div
                key={`mc-d-${i}`}
                className="absolute"
                initial={{
                  x: Math.cos(angle) * r,
                  y: Math.sin(angle) * r,
                  opacity: 0,
                }}
                animate={{
                  opacity: [0, 0.5, 0],
                  rotate: [0, 180, 360],
                  scale: [0.5, 1.2, 0.5],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "easeInOut",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path
                    d="M9,0 L11,6.5 L18,9 L11,11.5 L9,18 L7,11.5 L0,9 L7,6.5 Z"
                    fill="#0F4D3A"
                  />
                </svg>
              </motion.div>
            );
          })}

          {/* Center: Bahtra logo with floating animation */}
          <motion.div
            className="relative z-10 flex flex-col items-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 2, 0, -2, 0],
              }}
              transition={{
                y: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="drop-shadow-[0_10px_40px_rgba(15,77,58,0.3)]"
            >
              <Image
                src="/OIP.jpg"
                alt="Logo Bahtra"
                width={280}
                height={280}
                priority
                className="rounded-full"
              />
            </motion.div>

            {/* Arabic calligraphy */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <span className="text-5xl font-bold text-[#0F4D3A] tracking-wide drop-shadow-[0_0_12px_rgba(15,77,58,0.2)] md:text-6xl">
                مناقشة
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              className="mt-4 text-2xl font-black tracking-[0.25em] text-[#0F4D3A] md:text-4xl"
              initial={{ opacity: 0, letterSpacing: "0.6em" }}
              animate={{ opacity: 1, letterSpacing: "0.25em" }}
              transition={{ delay: 0.8, duration: 1.2 }}
            >
              MUNAQOSYAH
            </motion.h1>

            <motion.p
              className="mt-2 text-xs tracking-[0.4em] text-[#1B6B4F]/80 uppercase md:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
            >
              Pondok Pesantren Bahtra
            </motion.p>

            {/* Status indicator */}
            <motion.div
              className="mt-10 flex items-center gap-3 rounded-full border border-[#0F4D3A]/30 bg-white/80 px-6 py-2.5 backdrop-blur"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <motion.span
                className="h-2.5 w-2.5 rounded-full bg-[#0F4D3A]"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="text-sm font-semibold tracking-[0.2em] text-[#0F4D3A] uppercase">
                Acara Sedang Berlangsung
              </span>
            </motion.div>

            {/* Ornament divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 2 }}
              className="mt-8 flex items-center gap-3 text-[#0F4D3A]/40"
            >
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#0F4D3A]/40" />
              <span className="text-xs tracking-[0.4em]">إِقْرَأْ</span>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#0F4D3A]/40" />
            </motion.div>
          </motion.div>

          {/* Top-right controls */}
          <div className="absolute right-4 top-4 z-20 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={toggleMusic}
              className="gap-2 border-[#0F4D3A]/30 bg-white/90 text-[#0F4D3A] hover:bg-[#0F4D3A]/10"
            >
              {musicOn ? (
                <>
                  <Volume2 className="h-4 w-4" />
                  Musik Aktif
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  Musik Mati
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="gap-2 border-red-500/40 bg-white/90 text-red-700 hover:bg-red-500/10"
            >
              <X className="h-4 w-4" />
              Tutup
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
