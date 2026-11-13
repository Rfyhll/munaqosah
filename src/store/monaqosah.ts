"use client";

import { create } from "zustand";

interface MonaQosahState {
  // Loading
  isLoaded: boolean;
  setLoaded: (v: boolean) => void;

  // MC screen (shown when MC is speaking, after a participant finishes)
  mcScreenVisible: boolean;
  setMcScreenVisible: (v: boolean) => void;

  // The actual content currently displayed on the projector.
  fileHtml: string | null;
  fileName: string | null;
  setFile: (html: string, name: string) => void;
  /** Update the HTML of the currently displayed file (e.g. after inline
   *  editing in the projector display). Persists to localStorage too. */
  updateFileHtml: (html: string) => void;
  clearFile: () => void;

  // Audio enabled
  audioEnabled: boolean;
  toggleAudio: () => void;
}

const STORAGE_KEY = "monaqosah-current-file";

function loadCached(): { html: string; name: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.html === "string" && parsed.html.length > 0) {
      return { html: parsed.html, name: parsed.name ?? "Word file" };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function hydrateFromStorage() {
  const cached = loadCached();
  if (cached) {
    useMonaqosah.setState({
      fileHtml: cached.html,
      fileName: cached.name,
    });
  }
}

export const useMonaqosah = create<MonaQosahState>((set) => ({
  isLoaded: false,
  setLoaded: (v) => set({ isLoaded: v }),

  mcScreenVisible: false,
  setMcScreenVisible: (v) => set({ mcScreenVisible: v }),

  // Always start empty on SSR + first client render to avoid hydration mismatch.
  fileHtml: null,
  fileName: null,

  setFile: (html, name) => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ html, name }),
        );
      } catch {
        /* ignore quota errors */
      }
    }
    set({ fileHtml: html, fileName: name });
  },

  updateFileHtml: (html) => {
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...parsed, html }),
        );
      } catch {
        /* ignore quota errors */
      }
    }
    set({ fileHtml: html });
  },

  clearFile: () => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
    set({ fileHtml: null, fileName: null });
  },

  audioEnabled: true,
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
}));
