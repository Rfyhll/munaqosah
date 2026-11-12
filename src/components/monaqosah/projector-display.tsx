"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMonaqosah } from "@/store/monaqosah";
import { parseDocxToHtml } from "@/lib/docx-parser";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

export function ProjectorDisplay() {
  const { fileHtml, fileName, setFile, clearFile } = useMonaqosah();
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const lower = file.name.toLowerCase();
      if (!lower.endsWith(".docx") && !lower.endsWith(".doc")) {
        setError("File harus berformat .docx (Microsoft Word)");
        return;
      }
      setIsParsing(true);
      try {
        const html = await parseDocxToHtml(file);
        if (!html || html.trim().length === 0) {
          setError(
            "File Word kosong atau tidak bisa dibaca. Pastikan file berisi teks.",
          );
          setIsParsing(false);
          return;
        }
        setIsParsing(false);
        // Brief transition overlay, then show content.
        setIsTransitioning(true);
        setTimeout(() => {
          setFile(html, file.name);
          setTimeout(() => setIsTransitioning(false), 400);
        }, 500);
      } catch (e) {
        console.error(e);
        setError(
          "Gagal membaca file. Pastikan file .docx tidak rusak dan bisa dibuka di Word.",
        );
        setIsParsing(false);
      }
    },
    [setFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile],
  );

  // Reset scroll position when content changes.
  useEffect(() => {
    if (fileHtml && displayRef.current) {
      displayRef.current.scrollTop = 0;
    }
  }, [fileHtml]);

  return (
    <div
      className="relative min-h-[calc(100vh-72px)] w-full"
      onDragOver={(e) => {
        e.preventDefault();
        if (!isTransitioning) setIsDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".docx,.doc"
        onChange={handleInput}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {/* EMPTY STATE */}
        {!fileHtml && !isTransitioning && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center p-8"
          >
            <motion.div
              onClick={() => inputRef.current?.click()}
              className={`relative flex w-full max-w-2xl cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed p-12 text-center transition-all ${
                isDragging
                  ? "border-[#0F4D3A] bg-[#0F4D3A]/10 scale-[1.02]"
                  : "border-[#0F4D3A]/30 hover:border-[#0F4D3A]/60 hover:bg-[#0F4D3A]/5"
              }`}
              animate={
                isDragging ? { scale: 1.02 } : { scale: [1, 1.005, 1] }
              }
              transition={{
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(15,77,58,0.12), transparent 70%)",
                }}
              />

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 mb-6"
              >
                {isParsing ? (
                  <Loader2 className="h-20 w-20 animate-spin text-[#0F4D3A]" />
                ) : (
                  <UploadCloud className="h-20 w-20 text-[#0F4D3A] drop-shadow-[0_0_20px_rgba(15,77,58,0.3)]" />
                )}
              </motion.div>

              <h2 className="relative z-10 mb-2 text-2xl font-bold text-[#0F4D3A] md:text-3xl">
                {isParsing ? "Membaca file Word..." : "Drag File Word ke Sini"}
              </h2>
              <p className="relative z-10 max-w-md text-sm text-[#1a1a1a]/70">
                {isParsing
                  ? "Tunggu sebentar, konten sedang diproses."
                  : "Tarik file .docx dari komputer ke area ini. Isi file akan otomatis tampil di layar proyektor untuk dibaca santri."}
              </p>

              <div className="relative z-10 mt-6 flex items-center gap-2 rounded-full border border-[#0F4D3A]/30 bg-white/60 px-4 py-1.5 text-[10px] tracking-[0.3em] text-[#0F4D3A]/70 uppercase">
                <FileText className="h-3 w-3" />
                Format .docx
              </div>

              {error && (
                <div className="relative z-10 mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center gap-3 text-[#0F4D3A]/40"
            >
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#0F4D3A]/40" />
              <span className="text-xs tracking-[0.4em]">مناقشة</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#0F4D3A]/40" />
            </motion.div>
          </motion.div>
        )}

        {/* LOADED STATE */}
        {fileHtml && !isTransitioning && (
          <motion.div
            key="loaded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex min-h-[calc(100vh-72px)] flex-col"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#0F4D3A]/20 bg-white/80 px-4 py-2 backdrop-blur">
              <div className="flex min-w-0 items-center gap-2 text-[#0F4D3A]">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="truncate text-xs font-medium tracking-wide text-[#1a1a1a]">
                  {fileName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => inputRef.current?.click()}
                  disabled={isParsing || isTransitioning}
                  className="h-8 gap-1 border-[#0F4D3A]/30 bg-white px-3 text-[11px] text-[#0F4D3A] hover:bg-[#0F4D3A]/10 hover:text-[#0A3326]"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Ganti File
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearFile}
                  className="h-8 gap-1 border-red-500/40 bg-white px-3 text-[11px] text-red-700 hover:bg-red-500/10 hover:text-red-800"
                >
                  <X className="h-3.5 w-3.5" />
                  Tutup
                </Button>
              </div>
            </div>

            <div
              ref={displayRef}
              className="docx-content flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-12"
              dangerouslySetInnerHTML={{ __html: fileHtml }}
            />

            {error && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg border border-red-500/30 bg-white/90 px-4 py-2 text-xs text-red-700 backdrop-blur">
                <AlertCircle className="mr-2 inline h-4 w-4" />
                {error}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TRANSITION OVERLAY - brief fade when switching content */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#F5F7F2]"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex items-center gap-3"
            >
              <div className="h-3 w-3 rounded-full bg-[#0F4D3A]" />
              <div
                className="h-3 w-3 rounded-full bg-[#0F4D3A]"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="h-3 w-3 rounded-full bg-[#0F4D3A]"
                style={{ animationDelay: "0.4s" }}
              />
            </motion.div>
            <p className="mt-4 text-xs tracking-[0.3em] text-[#0F4D3A] uppercase">
              Menyiapkan halaman...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DRAG OVERLAY */}
      {isDragging && fileHtml && !isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-white/85 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[#0F4D3A] bg-[#0F4D3A]/10 p-12">
            <UploadCloud className="h-12 w-12 text-[#0F4D3A]" />
            <p className="text-lg font-bold text-[#0F4D3A]">
              Lepaskan untuk ganti file
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
