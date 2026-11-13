"use client";

/**
 * YouTube music player using the IFrame Player API.
 *
 * Plays Arabic orchestral music as background:
 *  - Loading screen: "CEK SOUND ARABIC - SOUND SYSTEM LEBIH BERKELAS - WIJAYA ENTERTAINMENT"
 *    Video ID: 8rGeb1a-iPs
 *  - MC Screen (acara berlangsung): "National Arab Orchestra - Ghanili Shway"
 *    Video ID: JAFTuss-Ekw
 *
 * IMPORTANT (autoplay policy):
 *  - YouTube IFrame API cannot autoplay with sound until the page has
 *    received a user gesture. The loading screen now waits for a
 *    "Klik untuk Memulai" click before starting, so by the time we call
 *    playVideo() the gesture has happened and audio will be audible.
 *  - The tick sound uses a SHARED AudioContext that is resumed on the
 *    same gesture; previously every tick created a brand-new suspended
 *    AudioContext and closed it immediately, which produced NO sound.
 */

const LOADING_VIDEO_ID = "8rGeb1a-iPs"; // CEK SOUND ARABIC - WIJAYA ENTERTAINMENT
const MC_VIDEO_ID = "JAFTuss-Ekw"; // National Arab Orchestra - Ghanili Shway

// ---------- Shared AudioContext for tick sounds -----------------------------
// Browsers create a brand-new AudioContext in the "suspended" state until
// the user has interacted with the page. Previously playTick() created a
// fresh AudioContext per tick and closed it again — every one of those
// was suspended, so the tick was silent. We now keep ONE context and
// call resume() on it whenever we touch it.
let _audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_audioCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    _audioCtx = new AC();
  }
  if (_audioCtx.state === "suspended") {
    // Best-effort resume — must be called from within a user gesture
    // (i.e. the click on "Klik untuk Memulai") to actually unblock audio.
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
}

let player: any = null;
let isReady = false;
let pendingPlay = false;
let currentVideoId: string | null = null;
let apiLoading = false;

/** Load the YouTube IFrame API script once. */
function loadAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).YT && (window as any).YT.Player) {
    return Promise.resolve();
  }
  if (apiLoading) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          clearInterval(check);
          resolve();
        }
      }, 100);
    });
  }
  apiLoading = true;
  return new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    (window as any).onYouTubeIframeAPIReady = () => {
      apiLoading = false;
      resolve();
    };
    setTimeout(() => {
      apiLoading = false;
      resolve();
    }, 5000);
  });
}

/** Create or reuse the hidden player. */
async function ensurePlayer(videoId: string): Promise<any> {
  if (typeof window === "undefined") return null;
  await loadAPI();
  const YT = (window as any).YT;
  if (!YT || !YT.Player) return null;

  // If player exists and is ready, just swap the video if needed.
  if (player && isReady) {
    if (currentVideoId !== videoId) {
      player.loadVideoById(videoId);
      currentVideoId = videoId;
    }
    return player;
  }

  let container = document.getElementById("yt-music-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "yt-music-container";
    container.style.position = "fixed";
    container.style.bottom = "0";
    container.style.right = "0";
    container.style.width = "1px";
    container.style.height = "1px";
    container.style.overflow = "hidden";
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "-1";
    document.body.appendChild(container);
  }

  let inner = document.getElementById("yt-music-player");
  if (!inner) {
    inner = document.createElement("div");
    inner.id = "yt-music-player";
    inner.style.width = "100%";
    inner.style.height = "100%";
    container.appendChild(inner);
  }

  return new Promise((resolve) => {
    player = new YT.Player("yt-music-player", {
      videoId: videoId,
      width: "1",
      height: "1",
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        loop: 1,
        playlist: videoId,
      },
      events: {
        onReady: () => {
          isReady = true;
          currentVideoId = videoId;
          if (pendingPlay) {
            pendingPlay = false;
            try {
              player.setVolume(50);
              player.playVideo();
            } catch {}
          }
          resolve(player);
        },
        onStateChange: (event: any) => {
          if (event.data === 0) {
            try {
              player.seekTo(0);
              player.playVideo();
            } catch {}
          }
        },
        onError: () => {
          // Silent fail on region block etc.
        },
      },
    });
    setTimeout(() => resolve(player), 3000);
  });
}

/** Start playing the LOADING screen music (CEK SOUND ARABIC). */
export async function startArabicMusic() {
  return startVideo(LOADING_VIDEO_ID);
}

/** Start playing the MC SCREEN music (Ghanili Shway). */
export async function startMcMusic() {
  return startVideo(MC_VIDEO_ID);
}

/** Internal: play a specific video. */
async function startVideo(videoId: string) {
  try {
    const p = await ensurePlayer(videoId);
    if (!p || !isReady) {
      pendingPlay = true;
      currentVideoId = videoId;
      return;
    }
    // Swap video if different from current.
    if (currentVideoId !== videoId) {
      p.loadVideoById(videoId);
      currentVideoId = videoId;
    }
    p.setVolume(50);
    p.playVideo();
  } catch (e) {
    // Silent fail.
  }
}

/** Stop/pause the music. */
export function stopArabicMusic() {
  try {
    if (player && isReady) {
      player.pauseVideo();
    }
  } catch {}
}

/** Initialize (preload) the player — call on user gesture. */
export async function initAudio() {
  try {
    await ensurePlayer(LOADING_VIDEO_ID);
  } catch {}
}

/** Soft tick for progress bar (Web Audio API). */
export function playTick() {
  if (typeof window === "undefined") return;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    // If still suspended (no gesture yet), bail silently.
    if (ctx.state === "suspended") return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    const start = ctx.currentTime;
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(0.03, start + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.1);
    // NOTE: do NOT call ctx.close() — the shared context must stay alive.
  } catch {}
}
