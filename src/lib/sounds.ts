"use client";

import { Howl } from "howler";

/**
 * MonaQosah sound effects.
 *
 * Sounds are synthesized at runtime via tiny base64-encoded WAV/MP3 snippets
 * generated through the Web Audio API fallback (Howler handles playback).
 * Since we cannot host audio binary files reliably, we generate short procedural
 * sounds using the AudioContext on the client.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Play a single oscillator note. */
function tone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  when: number = 0,
  gain: number = 0.2,
) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const start = ac.currentTime + when;
  const end = start + duration;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, end);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(start);
  osc.stop(end + 0.05);
}

/** Noise burst for shimmer / impact. */
function noise(duration: number, when: number = 0, gain: number = 0.15, filterFreq: number = 1200) {
  const ac = getCtx();
  if (!ac) return;
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = filterFreq;
  filter.Q.value = 1;
  const g = ac.createGain();
  const start = ac.currentTime + when;
  const end = start + duration;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, end);
  src.connect(filter);
  filter.connect(g);
  g.connect(ac.destination);
  src.start(start);
  src.stop(end + 0.05);
}

/** A low ambient drone used during loading. */
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
let ambientLfo: OscillatorNode | null = null;

export function startAmbient() {
  const ac = getCtx();
  if (!ac) return;
  if (ambientOsc) return;
  ambientOsc = ac.createOscillator();
  ambientGain = ac.createGain();
  ambientLfo = ac.createOscillator();
  const lfoGain = ac.createGain();

  ambientOsc.type = "sine";
  ambientOsc.frequency.value = 110; // A2
  ambientGain.gain.value = 0.04;

  ambientLfo.type = "sine";
  ambientLfo.frequency.value = 0.3;
  lfoGain.gain.value = 0.02;
  ambientLfo.connect(lfoGain);
  lfoGain.connect(ambientGain.gain);

  ambientOsc.connect(ambientGain);
  ambientGain.connect(ac.destination);
  ambientOsc.start();
  ambientLfo.start();
}

export function stopAmbient() {
  if (!ambientOsc || !ambientLfo) return;
  try {
    ambientOsc.stop();
    ambientLfo.stop();
  } catch {}
  ambientOsc = null;
  ambientLfo = null;
  ambientGain = null;
}

/** Soft tick used for loading progress. */
export function playTick() {
  tone(660, 0.06, "square", 0, 0.04);
}

/** Whoosh used when starting chest animation. */
export function playWhoosh() {
  const ac = getCtx();
  if (!ac) return;
  noise(0.6, 0, 0.08, 800);
  // sweeping tone
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sawtooth";
  const start = ac.currentTime;
  osc.frequency.setValueAtTime(120, start);
  osc.frequency.exponentialRampToValueAtTime(640, start + 0.6);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(0.06, start + 0.1);
  g.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start(start);
  osc.stop(start + 0.65);
}

/** Creak + click when chest lid unlocks. */
export function playUnlock() {
  tone(180, 0.18, "sawtooth", 0, 0.12);
  tone(90, 0.22, "square", 0.05, 0.06);
  noise(0.1, 0.18, 0.08, 2400);
  // metallic click
  tone(2400, 0.04, "square", 0.22, 0.08);
  tone(1800, 0.04, "square", 0.24, 0.06);
}

/** Magical reveal sound: ascending arpeggio + shimmer. */
export function playReveal() {
  // arpeggio C E G C
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, i) => tone(n, 0.5, "sine", i * 0.08, 0.12));
  // shimmer
  noise(1.2, 0.32, 0.06, 6000);
  // low impact
  tone(55, 0.6, "sine", 0.32, 0.18);
}

/** Background music loop using a simple synthesized pad. */
let musicNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let musicPlaying = false;

export function startMusic() {
  const ac = getCtx();
  if (!ac || musicPlaying) return;
  musicPlaying = true;
  // pad chord (A minor extended): A2 + E3 + A3 + C4
  const freqs = [110, 164.81, 220, 261.63];
  freqs.forEach((f, idx) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = idx === 0 ? "sine" : "triangle";
    osc.frequency.value = f;
    gain.gain.value = 0.015;
    // gentle LFO
    const lfo = ac.createOscillator();
    const lfoGain = ac.createGain();
    lfo.frequency.value = 0.1 + idx * 0.05;
    lfoGain.gain.value = 0.008;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start();
    musicNodes.push({ osc, gain });
    musicNodes.push({ osc: lfo, gain: lfoGain });
  });
}

export function stopMusic() {
  musicNodes.forEach((n) => {
    try {
      n.osc.stop();
    } catch {}
  });
  musicNodes = [];
  musicPlaying = false;
}

/** Initialize audio context after a user gesture (browser autoplay policy). */
export function initAudio() {
  getCtx();
}
