"use client";

/**
 * BookLoadingAnimation
 *
 * A loading animation inspired by the "Book Loading Animation" YouTube
 * tutorials: a book whose pages flip open in 3D (rotateY) while a soft
 * spinner ring rotates around it and a glow pulses behind it.
 *
 * Uses the book image at /book.png (uploaded by the user) as the book
 * cover/body. While the file is being parsed (isParsing = true) the
 * book "opens" its pages repeatedly, signaling that the document is
 * being read.
 *
 * The animation is pure framer-motion + Tailwind, no external assets
 * other than the book image.
 */

import { motion } from "framer-motion";
import Image from "next/image";

interface BookLoadingAnimationProps {
  /** Optional message shown under the book. */
  message?: string;
}

export function BookLoadingAnimation({
  message = "Membaca file Word...",
}: BookLoadingAnimationProps) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Pulsing radial glow behind the book */}
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          opacity: [0.3, 0.7, 0.3],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 2.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(15,77,58,0.25), transparent 60%)",
        }}
      />

      {/* Rotating dashed ring (the "loading" indicator) */}
      <motion.div
        className="absolute -z-10"
        animate={{ rotate: 360 }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
          <circle
            cx="110"
            cy="110"
            r="104"
            stroke="#0F4D3A"
            strokeWidth="2"
            strokeDasharray="6 14"
            strokeLinecap="round"
            opacity="0.4"
          />
          <circle
            cx="110"
            cy="110"
            r="92"
            stroke="#1B6B4F"
            strokeWidth="1.5"
            strokeDasharray="2 18"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>
      </motion.div>

      {/* The book itself, with a 3D page-flip animation */}
      <div
        className="relative"
        style={{ perspective: "1000px", width: 140, height: 140 }}
      >
        {/* Book body (the user's uploaded book image) */}
        <motion.div
          className="absolute inset-0"
          animate={{
            y: [0, -8, 0],
            rotateZ: [-2, 2, -2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <Image
            src="/book.png"
            alt="Buku"
            width={140}
            height={140}
            className="h-full w-full object-contain drop-shadow-[0_12px_24px_rgba(15,77,58,0.35)]"
            priority
          />
        </motion.div>

        {/* A flipping "page" overlay on the right side of the book.
            It rotates around the book's spine (left edge) repeatedly,
            like a page being turned — this is the signature move of
            the YouTube "book loading animation" tutorials. */}
        <motion.div
          className="absolute left-1/2 top-1 h-[88%] w-1/2 origin-left"
          style={{
            transformStyle: "preserve-3d",
            // Slight gradient that looks like a sheet of paper edge-on
            background:
              "linear-gradient(90deg, rgba(255,250,235,0.92), rgba(245,235,200,0.85))",
            boxShadow: "0 4px 14px rgba(120,100,60,0.25)",
            borderRadius: "0 6px 6px 0",
          }}
          animate={{
            rotateY: [0, -160, -180],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            repeatDelay: 0.4,
          }}
        >
          {/* Subtle lines on the page to suggest text */}
          <div className="absolute inset-2 flex flex-col gap-1.5">
            <div className="h-0.5 w-3/4 rounded bg-[#0F4D3A]/15" />
            <div className="h-0.5 w-full rounded bg-[#0F4D3A]/15" />
            <div className="h-0.5 w-5/6 rounded bg-[#0F4D3A]/15" />
            <div className="h-0.5 w-full rounded bg-[#0F4D3A]/15" />
            <div className="h-0.5 w-2/3 rounded bg-[#0F4D3A]/15" />
            <div className="h-0.5 w-full rounded bg-[#0F4D3A]/15" />
            <div className="h-0.5 w-4/5 rounded bg-[#0F4D3A]/15" />
          </div>
        </motion.div>
      </div>

      {/* Message under the book */}
      <motion.p
        className="mt-8 text-xs font-medium tracking-[0.3em] text-[#0F4D3A] uppercase"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {message}
      </motion.p>
    </div>
  );
}
