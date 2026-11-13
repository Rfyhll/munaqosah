"use client";

/**
 * BookLoadingAnimation
 *
 * Elegant "book opening" loader shown while a dragged Word file is
 * being parsed. Pure CSS/SVG — no external image.
 *
 * Sequence (10s total cycle, matching the 10s forced parse window):
 *   1. Cover opens (rotateY 0° → -168°) over ~1.2s.
 *   2. TEN pages flip one-by-one (~0.65s each + tiny pause).
 *   3. Cover closes, hiding the page reset, then loops.
 *
 * Color matching: the static page block on the left and every
 * flipping page use the IDENTICAL cream gradient, so when a page
 * lands on the left it blends seamlessly into the page surface
 * beneath it (no green cover bleeding through, no mismatched cream).
 *
 * Palette: deep pesantren green (#0F4D3A) leather cover, gold (#C9A961)
 * tooling, ivory (#F5EFE0) pages.
 */

import { motion } from "framer-motion";

interface BookLoadingAnimationProps {
  message?: string;
}

const COVER_W = 150; // half-book width (each cover)
const COVER_H = 200; // book height
const TOTAL_PAGES = 10;
const CYCLE = 10; // seconds per full loop — matches MIN_PARSE_MS
const COVER_OPEN_END = 1.2; // cover finishes opening at 1.2s
const PAGE_FLIP = 0.65; // seconds a single page takes to turn
const PAGE_GAP = 0.05; // pause between pages
const PAGE_START = 1.2; // first page starts flipping right after cover
// 10 pages: 10*0.65 + 9*0.05 = 6.95s -> last page ends ~8.15s
const COVER_CLOSE_START = 8.3; // cover starts closing (after all pages)
const COVER_CLOSE_END = 9.4; // cover fully closed
const PAGE_RESET = 8.8; // pages snap back to 0 (hidden by closing cover)

// Identical cream gradient shared by the static page block AND every
// flipping page, so a landed page matches the surface beneath it.
const PAGE_GRADIENT =
  "linear-gradient(90deg, #E8DFC8 0%, #F5EFE0 14%, #F5EFE0 86%, #E8DFC8 100%)";

/** Convert a cycle-seconds value to a fraction of CYCLE for `times`. */
const t = (s: number) => Math.min(0.999, s / CYCLE);

export function BookLoadingAnimation({
  message = "Membaca file Word...",
}: BookLoadingAnimationProps) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Pulsing ambient glow behind the book (very slow) */}
      <motion.div
        className="absolute -z-10 h-[340px] w-[340px] rounded-full"
        animate={{
          opacity: [0.2, 0.45, 0.2],
          scale: [0.9, 1.08, 0.9],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(15,77,58,0.30), transparent 62%)",
        }}
      />

      {/* Slow rotating hairline ring (the loading indicator) */}
      <motion.div
        className="absolute -z-10"
        animate={{ rotate: 360 }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <svg width="300" height="300" viewBox="0 0 300 300" fill="none">
          <circle
            cx="150"
            cy="150"
            r="142"
            stroke="#0F4D3A"
            strokeWidth="1"
            strokeDasharray="1 12"
            strokeLinecap="round"
            opacity="0.35"
          />
          <circle
            cx="150"
            cy="150"
            r="130"
            stroke="#C9A961"
            strokeWidth="0.75"
            strokeDasharray="1 18"
            strokeLinecap="round"
            opacity="0.25"
          />
        </svg>
      </motion.div>

      {/* The book, viewed from slightly above. */}
      <motion.div
        className="relative"
        style={{
          width: COVER_W * 2,
          height: COVER_H,
          perspective: "1600px",
        }}
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Shared "spine" tilt so the book reads as 3D, not flat. */}
        <motion.div
          className="absolute inset-0"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(-18deg)",
          }}
        >
          {/* ---------------- Back cover (static, sits flat) ----------- */}
          <div
            className="absolute left-0 top-0"
            style={{
              width: COVER_W,
              height: COVER_H,
              transform: "translateX(0) rotateY(0deg)",
              transformOrigin: "right center",
              background:
                "linear-gradient(135deg, #0F4D3A 0%, #0A3326 60%, #06241A 100%)",
              borderRadius: "4px 0 0 4px",
              boxShadow:
                "inset -6px 0 10px rgba(0,0,0,0.45), 0 14px 30px rgba(15,77,58,0.30)",
            }}
          >
            <div
              className="absolute inset-3 rounded-sm border"
              style={{ borderColor: "rgba(201,169,97,0.35)" }}
            />
          </div>

          {/* ---------------- Page block (left side) ------------------- */}
          {/* Same cream gradient as every flipping page, so when a page
              lands here it matches the surface beneath it seamlessly. */}
          <div
            className="absolute left-0 top-0"
            style={{
              width: COVER_W - 4,
              height: COVER_H - 6,
              transform: "translateX(2px) translateY(3px)",
              background: PAGE_GRADIENT,
              borderRadius: "2px 0 0 2px",
              boxShadow: "inset 0 0 8px rgba(120,100,60,0.12)",
            }}
          >
            <PageLines />
          </div>

          {/* ---------------- 10 flipping pages ----------------------- */}
          {/* Each page turns around the spine, one after another, then
              they all reset (hidden behind the closing cover). Uses the
              SAME PAGE_GRADIENT as the left page block so a landed page
              blends into the surface beneath it — no color mismatch. */}
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => {
            const flipStart = PAGE_START + i * (PAGE_FLIP + PAGE_GAP);
            const flipEnd = flipStart + PAGE_FLIP;
            return (
              <motion.div
                key={`flip-${i}`}
                className="absolute"
                style={{
                  width: COVER_W - 4,
                  height: COVER_H - 6,
                  left: COVER_W - 2,
                  top: 3,
                  transformOrigin: "left center",
                  transformStyle: "preserve-3d",
                  borderRadius: "0 3px 3px 0",
                  background: PAGE_GRADIENT,
                  boxShadow: "0 6px 14px rgba(80,65,30,0.18)",
                  backfaceVisibility: "hidden",
                }}
                animate={{
                  rotateY: [0, 0, -168, -168, 0],
                }}
                transition={{
                  duration: CYCLE,
                  times: [
                    0,
                    t(flipStart),
                    t(flipEnd),
                    t(PAGE_RESET - 0.05),
                    0.998,
                  ],
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <PageLines />
                <div
                  className="pointer-events-none absolute inset-y-0 right-0 w-3"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(80,65,30,0.10))",
                  }}
                />
              </motion.div>
            );
          })}

          {/* ---------------- Front cover (opens then closes) --------- */}
          <motion.div
            className="absolute"
            style={{
              width: COVER_W,
              height: COVER_H,
              left: COVER_W - 2,
              top: 0,
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
              background:
                "linear-gradient(135deg, #0F4D3A 0%, #0A3326 60%, #06241A 100%)",
              borderRadius: "0 4px 4px 0",
              boxShadow:
                "inset 6px 0 10px rgba(0,0,0,0.45), 0 14px 30px rgba(15,77,58,0.30)",
            }}
            animate={{
              rotateY: [0, -168, -168, 0],
            }}
            transition={{
              duration: CYCLE,
              times: [0, t(COVER_OPEN_END), t(COVER_CLOSE_START), t(COVER_CLOSE_END)],
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {/* gold tooled border + emblem on the front cover */}
            <div
              className="absolute inset-3 rounded-sm border"
              style={{ borderColor: "rgba(201,169,97,0.45)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle
                  cx="32"
                  cy="32"
                  r="22"
                  stroke="#C9A961"
                  strokeWidth="1"
                  opacity="0.7"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="16"
                  stroke="#C9A961"
                  strokeWidth="0.75"
                  opacity="0.5"
                />
                <path
                  d="M32 18 L36 30 L48 32 L36 34 L32 46 L28 34 L16 32 L28 30 Z"
                  fill="#C9A961"
                  opacity="0.75"
                />
              </svg>
            </div>
            {/* spine hinge highlight */}
            <div
              className="absolute inset-y-0 left-0 w-1.5"
              style={{
                background:
                  "linear-gradient(90deg, rgba(201,169,97,0.5), transparent)",
              }}
            />
          </motion.div>

          {/* ---------------- Gold bookmark ribbon ------------------ */}
          <motion.div
            className="absolute"
            style={{
              left: COVER_W + 18,
              top: -6,
              width: 8,
              height: 90,
              transformOrigin: "top center",
              background: "linear-gradient(180deg, #C9A961, #A88845)",
              boxShadow: "0 4px 8px rgba(80,65,30,0.25)",
              clipPath:
                "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)",
            }}
            animate={{ rotate: [-1.5, 1.5, -1.5] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Message under the book (very slow fade) */}
      <motion.p
        className="mt-10 text-[11px] font-medium tracking-[0.4em] text-[#0F4D3A] uppercase"
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {message}
      </motion.p>
    </div>
  );
}

/** Faint horizontal lines that suggest printed text on a page. */
function PageLines() {
  return (
    <div className="absolute inset-5 flex flex-col gap-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="h-px rounded-full bg-[#0F4D3A]"
          style={{
            width: i === 2 ? "60%" : i === 5 ? "75%" : "100%",
            opacity: 0.18,
          }}
        />
      ))}
    </div>
  );
}
