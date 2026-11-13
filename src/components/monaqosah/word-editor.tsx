"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Undo2,
  Redo2,
} from "lucide-react";

interface WordEditorProps {
  html: string;
  onChange: (html: string) => void;
}

/**
 * Inline rich-text editor for the loaded Word file content.
 *
 * The Word file's HTML (produced by mammoth) is rendered inside a
 * contentEditable div. While editing, a floating toolbar provides
 * basic formatting: bold / italic / underline, headings, alignment,
 * lists, and undo/redo.
 *
 * Implementation notes:
 *  - We use document.execCommand even though it is deprecated, because
 *    it is still the only broadly-supported way to drive a
 *    contentEditable from a custom toolbar without pulling in a heavy
 *    editor dependency. It works in all modern browsers.
 *  - We never re-set innerHTML while the user is editing (that would
 *    move the caret and lose their selection). innerHTML is only set
 *    once on mount, and we read it back via onInput.
 *  - We deliberately do NOT call document.queryCommandState during
 *    render (that touches DOM refs and triggers the react-hooks/refs
 *    lint rule and can cause stale reads). The toolbar buttons are
 *    stateless; pressing a toggling command again simply toggles it
 *    off, which is the standard contentEditable UX.
 */
export function WordEditor({ html, onChange }: WordEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [, setTick] = useState(0);

  // Set the content once on mount (and whenever html changes from the
  // outside — e.g. a new file is loaded). We only overwrite when the
  // incoming html actually differs, so we don't blow away the user's
  // caret / edits on a re-render that passes the same string.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== html) {
      ref.current.innerHTML = html;
    }
  }, [html]);

  const exec = (command: string, value?: string) => {
    // Focus the editor first so the command applies to the current
    // selection (or the caret position inside the editor).
    ref.current?.focus();
    try {
      document.execCommand(command, false, value);
    } catch {
      /* ignore unsupported commands */
    }
    // Force a re-render so toolbar refreshes after a command runs.
    setTick((t) => t + 1);
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML);
    setTick((t) => t + 1);
  };

  // Make the editor keyboard-accessible. Ctrl/Cmd+B,I,U work natively in
  // contentEditable; we just refresh state after.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && ["b", "i", "u"].includes(e.key.toLowerCase())) {
      setTimeout(() => {
        if (ref.current) onChange(ref.current.innerHTML);
        setTick((t) => t + 1);
      }, 0);
    }
  };

  const btn = (
    onClick: () => void,
    icon: React.ReactNode,
    label: string,
  ) => (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="h-8 w-8 gap-1 p-0 text-[#0F4D3A] hover:bg-[#0F4D3A]/15"
    >
      {icon}
    </Button>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Editor toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-[#0F4D3A]/20 bg-[#F5F7F2]/95 px-3 py-1.5 backdrop-blur"
      >
        <span className="mr-2 text-[10px] font-semibold tracking-[0.2em] text-[#0F4D3A] uppercase">
          Edit
        </span>
        {btn(() => exec("undo"), <Undo2 className="h-4 w-4" />, "Undo")}
        {btn(() => exec("redo"), <Redo2 className="h-4 w-4" />, "Redo")}

        <div className="mx-1 h-5 w-px bg-[#0F4D3A]/20" />

        {btn(() => exec("bold"), <Bold className="h-4 w-4" />, "Tebal (Ctrl+B)")}
        {btn(() => exec("italic"), <Italic className="h-4 w-4" />, "Miring (Ctrl+I)")}
        {btn(() => exec("underline"), <Underline className="h-4 w-4" />, "Garis bawah (Ctrl+U)")}

        <div className="mx-1 h-5 w-px bg-[#0F4D3A]/20" />

        {btn(() => exec("formatBlock", "<h1>"), <Heading1 className="h-4 w-4" />, "Judul 1")}
        {btn(() => exec("formatBlock", "<h2>"), <Heading2 className="h-4 w-4" />, "Judul 2")}
        {btn(
          () => exec("formatBlock", "<p>"),
          <span className="text-[11px] font-semibold">¶</span>,
          "Paragraf",
        )}

        <div className="mx-1 h-5 w-px bg-[#0F4D3A]/20" />

        {btn(() => exec("justifyLeft"), <AlignLeft className="h-4 w-4" />, "Rata kiri")}
        {btn(() => exec("justifyCenter"), <AlignCenter className="h-4 w-4" />, "Rata tengah")}
        {btn(() => exec("justifyRight"), <AlignRight className="h-4 w-4" />, "Rata kanan")}

        <div className="mx-1 h-5 w-px bg-[#0F4D3A]/20" />

        {btn(() => exec("insertUnorderedList"), <List className="h-4 w-4" />, "Daftar poin")}
        {btn(() => exec("insertOrderedList"), <ListOrdered className="h-4 w-4" />, "Daftar bernomor")}
      </motion.div>

      {/* Editable content area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="docx-content flex-1 overflow-y-auto px-6 py-8 outline-none md:px-12 md:py-12"
        style={{ caretColor: "#0F4D3A" }}
      />
    </div>
  );
}
