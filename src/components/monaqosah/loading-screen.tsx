"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useMonaqosah } from "@/store/monaqosah";
import { playTick, startArabicMusic, stopArabicMusic, preloadMusic } from "@/lib/arabic-music";

export function LoadingScreen() {
  const setLoaded = useMonaqosah((s) => s.setLoaded);
  const audioEnabled = useMonaqosah((s) => s.audioEnabled);
  const [progress, setProgress] = useState(0);
  // "gate" = waiting for the user to click "Mulai" so the browser's
  // autoplay policy allows audio to actually play. Without this, the
  // AudioContext is created in "suspended" state (no sound) and the
  // YouTube IFrame API is not allowed to play with sound.
  const [stage, setStage] = useState<"gate" | "intro" | "loading" | "done">("gate");

  // PRELOAD the YouTube player MUTED on mount. Muted autoplay is always
  // allowed, so the video starts buffering + playing silently right
  // away. Then when the user clicks "Klik untuk Memulai", we unmute it
  // synchronously inside the gesture (see startLoading). This is the
  // ONLY reliable way to get YouTube audio to play after a gesture,
  // because the YT IFrame API is async and any `await` after a click
  // breaks the gesture chain.
  useEffect(() => {
    if (audioEnabled) {
      preloadMusic();
    }
  }, [audioEnabled]);

  // Begin audio + loading animation ONLY after a user gesture (click on
  // the "Klik untuk Memulai" button). This click is what unblocks the
  // previously-muted YouTube iframe (unmute + play) AND the Web Audio
  // tick sounds. startArabicMusic() is SYNCHRONOUS — it must not await
  // anything, so the unmute happens inside the gesture.
  const startLoading = () => {
    if (stage !== "gate") return;
    if (audioEnabled) {
      startArabicMusic();
    }
    setStage("intro");
  };

  // NOTE: there is intentionally NO useEffect that auto-advances the
  // stage from "intro" to "loading" here. The original code had a
  // `setTimeout(() => setStage("loading"), 1200)` running on mount that
  // fired even while still in the "gate" stage — that is why the
  // loading bar started before the user clicked. The intro -> loading
  // transition now happens ONLY inside the gate click handler below.

  // Drive the progress-bar ticking while we are in the "loading"
  // stage, and advance intro -> loading on a timer. Both timers are
  // gated on stage actually being past "gate", so the loading bar can
  // NEVER start before the user clicks "Klik untuk Memulai".
  useEffect(() => {
    if (stage === "gate") return;

    // After 1.2s in intro, move to the loading bar.
    let t1: ReturnType<typeof setTimeout> | undefined;
    if (stage === "intro") {
      t1 = setTimeout(() => setStage("loading"), 1200);
    }

    let raf: number;
    let last = 0;
    const tick = (now: number) => {
      if (stage !== "loading") {
        raf = requestAnimationFrame(tick);
        return;
      }
      // Slower progress: tick every 90ms, smaller increment.
      // Total time ~16s (was ~10s).
      if (now - last > 90) {
        setProgress((p) => {
          // Increment is smaller and slows down as we approach 100
          // for a dramatic "almost there" feeling.
          const slowdown = p > 80 ? 0.4 : p > 60 ? 0.7 : 1;
          const next = Math.min(100, p + (Math.random() * 2 + 0.6) * slowdown);
          if (audioEnabled && Math.floor(next / 4) !== Math.floor(p / 4)) {
            playTick();
          }
          if (next >= 100) {
            setTimeout(() => setStage("done"), 600);
            setTimeout(() => setLoaded(true), 1600);
          }
          return next;
        });
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      if (t1) clearTimeout(t1);
      cancelAnimationFrame(raf);
    };
  }, [stage, setLoaded, audioEnabled]);

  // Stop music when the loading screen unmounts (done).
  useEffect(() => {
    return () => {
      stopArabicMusic();
    };
  }, []);

  return (
    <AnimatePresence>
      {stage !== "done" || progress < 100 ? (
        <motion.div
          key="loading"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F5F7F2] overflow-hidden"
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Animated background: radial gold glow */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(15,77,58,0.08) 0%, rgba(245,247,242,0.4) 35%, rgba(245,247,242,1) 70%)",
            }}
          />

          {/* Decorative rotating geometric ring */}
          <motion.div
            className="absolute"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.4, scale: 1, rotate: 360 }}
            transition={{
              opacity: { duration: 1 },
              scale: { duration: 1.2, ease: "easeOut" },
              rotate: { duration: 40, repeat: Infinity, ease: "linear" },
            }}
          >
            <svg width="520" height="520" viewBox="0 0 520 520">
              <circle
                cx="260"
                cy="260"
                r="240"
                fill="none"
                stroke="#0F4D3A"
                strokeWidth="1"
                strokeDasharray="4 8"
              />
              <circle
                cx="260"
                cy="260"
                r="200"
                fill="none"
                stroke="#0F4D3A"
                strokeWidth="0.5"
                strokeDasharray="2 12"
              />
              <circle
                cx="260"
                cy="260"
                r="160"
                fill="none"
                stroke="#1B6B4F"
                strokeWidth="0.5"
              />
            </svg>
          </motion.div>

          {/* Counter-rotating star */}
          <motion.div
            className="absolute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12, rotate: -360 }}
            transition={{
              opacity: { duration: 1.5 },
              rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            }}
          >
            <svg width="380" height="380" viewBox="0 0 380 380">
              <path
                d="M190,30 L220,160 L350,190 L220,220 L190,350 L160,220 L30,190 L160,160 Z"
                fill="#0F4D3A"
              />
              <path
                d="M190,30 L220,160 L350,190 L220,220 L190,350 L160,220 L30,190 L160,160 Z"
                fill="#0F4D3A"
                transform="rotate(45 190 190)"
              />
            </svg>
          </motion.div>

          {/* Particles - deterministic positions to avoid hydration mismatch.
              Inner orbit (close to logo) + outer orbit (far) for depth. */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i / 36) * Math.PI * 2;
            const isInner = i % 3 === 0;
            const r = isInner ? 160 + ((i * 17) % 40) : 240 + ((i * 29) % 90);
            const size = isInner ? "h-1.5 w-1.5" : "h-1 w-1";
            return (
              <motion.span
                key={`p-${i}`}
                className={`absolute ${size} rounded-full bg-[#0F4D3A]`}
                initial={{
                  x: Math.cos(angle) * r,
                  y: Math.sin(angle) * r,
                  opacity: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.4, isInner ? 1.6 : 1.2, 0.4],
                  rotate: 360,
                }}
                transition={{
                  opacity: {
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: "easeInOut",
                  },
                  scale: {
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.08,
                    ease: "easeInOut",
                  },
                  rotate: {
                    duration: isInner ? 8 : 12,
                    repeat: Infinity,
                    ease: "linear",
                  },
                }}
              />
            );
          })}

          {/* Floating diamond ornaments - additional 3D-like depth */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
            const r = 320;
            return (
              <motion.div
                key={`d-${i}`}
                className="absolute"
                initial={{
                  x: Math.cos(angle) * r,
                  y: Math.sin(angle) * r,
                  opacity: 0,
                }}
                animate={{
                  opacity: [0, 0.6, 0],
                  rotate: [0, 180, 360],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeInOut",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14">
                  <path
                    d="M7,0 L9,5 L14,7 L9,9 L7,14 L5,9 L0,7 L5,5 Z"
                    fill="#0F4D3A"
                  />
                </svg>
              </motion.div>
            );
          })}

          {/* Logo */}
          <motion.div
            className="relative z-10 mb-8"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: stage === "gate" ? 0.9 : 1 }}
            transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="drop-shadow-[0_0_30px_rgba(15,77,58,0.3)]"
            >
              <Image
                src="/OIP.png"
                alt="Logo Bahtra"
                width={200}
                height={200}
                priority
              />
            </motion.div>
          </motion.div>

          {/* Arabic calligraphy */}
          <motion.div
            className="relative z-10 mb-2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            <span className="text-5xl font-bold text-[#0F4D3A] tracking-wide drop-shadow-[0_0_12px_rgba(15,77,58,0.2)]">
              مناقشة
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="relative z-10 text-4xl md:text-6xl font-bold tracking-[0.3em] text-[#0F4D3A] mb-2"
            initial={{ opacity: 0, letterSpacing: "0.8em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ delay: 0.8, duration: 1.2 }}
          >
            MUNAQOSYAH
          </motion.h1>

          <motion.p
            className="relative z-10 text-sm md:text-base text-[#1B6B4F]/80 tracking-[0.4em] uppercase mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
          >
            Pondok Pesantren Bahtra
          </motion.p>

          <motion.p
            className="relative z-10 text-xs md:text-sm text-[#1B6B4F]/70 tracking-[0.2em] mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
          >
            BY : الثانوية الثالثة Tahun 2026/2027
          </motion.p>

          {/* Progress bar */}
          <motion.div
            className="relative z-10 w-[280px] md:w-[400px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: stage === "gate" || stage === "intro" ? 0 : 1, y: stage === "gate" || stage === "intro" ? 20 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative h-1 w-full rounded-full bg-[#0F4D3A]/15 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0A3326] via-[#0F4D3A] to-[#1B6B4F]"
                style={{ width: `${progress}%` }}
                transition={{ ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-transparent via-white/60 to-transparent"
                animate={{ x: ["-48px", "448px"] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <div className="mt-3 flex justify-between text-[10px] tracking-[0.3em] text-[#0F4D3A]/70 uppercase">
              <span>Memuat Sidang</span>
              <span>{Math.floor(progress)}%</span>
            </div>
          </motion.div>

          {/* "Klik untuk Memulai" gate button — required so the browser
              allows audio (Web Audio API + YouTube) to actually play. */}
          {stage === "gate" && (
            <motion.button
              type="button"
              onClick={startLoading}
              className="relative z-20 mt-8 cursor-pointer rounded-full border border-[#0F4D3A]/40 bg-[#0F4D3A] px-8 py-3 text-sm md:text-base font-semibold tracking-[0.3em] uppercase text-[#F5F7F2] shadow-[0_8px_30px_rgba(15,77,58,0.35)] transition-all hover:bg-[#0A3326] hover:shadow-[0_12px_40px_rgba(15,77,58,0.5)] hover:scale-105 active:scale-95"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              Klik untuk Memulai
            </motion.button>
          )}

          {/* Bottom hint */}
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] text-[#0F4D3A]/50 uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === "gate" ? 0 : 1 }}
            transition={{ delay: 2, duration: 1 }}
          >
            إِقْرَأْ بِاسْمِ رَبِّكَ
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
