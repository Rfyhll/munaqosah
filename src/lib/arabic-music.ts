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
 *  - The YouTube <iframe> MUST be created during a user gesture, but
 *    the call to playVideo() can happen any time after that. The trick
 *    that actually works across browsers is: create the player (which
 *    embeds the iframe) on the FIRST user gesture, wait for onReady,
 *    then call playVideo() with sound. We no longer defer iframe
 *    creation until after the gate — we preload it eagerly.
 *
 * Implementation:
 *  - `preloadPlayer()` creates the hidden iframe + YT.Player instance
 *    and is called on EVERY user gesture (gate click, audio toggle,
 *    page click) until ready. This is what unlocks autoplay-with-sound.
 *  - `startArabicMusic()` / `startMcMusic()` then just call
 *    playVideo() on the already-ready player (or queue a pendingPlay
 *    flag if the player isn't ready yet).
 *  - The tick sound uses a SHARED AudioContext that is resumed on the
 *    same gesture; previously every tick created a brand-new suspended
 *    AudioContext and closed it immediately, which produced NO sound.
 */

const LOADING_VIDEO_ID = "8rGeb1a-iPs"; // CEK SOUND ARABIC - WIJAYA ENTERTAINMENT
const MC_VIDEO_ID = "JAFTuss-Ekw"; // National Arab Orchestra - Ghanili Shway

// ---------- Shared AudioContext for tick sounds -----------------------------
let _audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_audioCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    _audioCtx = new AC();
  }
  if (_audioCtx.state === "suspended") {
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
}

let player: any = null;
let isReady = false;
// Which video the user actually W wants to hear right now. The player
// may have been preloaded with the loading video; if the user opens
// the MC screen before the loading music ever started, we swap.
let desiredVideoId: string | null = null;
// Which video is currently loaded into the iframe.
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

/** Create the hidden player + iframe. Must be called within a user
 *  gesture for autoplay-with-sound to be allowed later. */
async function preloadPlayer(videoId: string): Promise<any> {
  if (typeof window === "undefined") return null;
  await loadAPI();
  const YT = (window as any).YT;
  if (!YT || !YT.Player) return null;

  // Player already exists — just make sure the right video is loaded.
  if (player) {
    if (currentVideoId !== videoId) {
      try {
        player.loadVideoById(videoId);
        currentVideoId = videoId;
      } catch {}
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
          // If the user already asked to play a (different) video
          // before we finished loading, swap + play now.
          if (desiredVideoId && desiredVideoId !== currentVideoId) {
            try {
              player.loadVideoById(desiredVideoId);
              currentVideoId = desiredVideoId;
            } catch {}
          }
          if (desiredVideoId) {
            try {
              player.setVolume(60);
              player.playVideo();
            } catch {}
          }
          resolve(player);
        },
        onStateChange: (event: any) => {
          // When the video ends, loop it.
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
  desiredVideoId = LOADING_VIDEO_ID;
  try {
    const p = await preloadPlayer(LOADING_VIDEO_ID);
    if (!p) return;
    if (!isReady) {
      // onReady will pick up desiredVideoId and play.
      return;
    }
    if (currentVideoId !== LOADING_VIDEO_ID) {
      p.loadVideoById(LOADING_VIDEO_ID);
      currentVideoId = LOADING_VIDEO_ID;
    }
    p.setVolume(60);
    p.playVideo();
  } catch {}
}

/** Start playing the MC SCREEN music (Ghanili Shway). */
export async function startMcMusic() {
  desiredVideoId = MC_VIDEO_ID;
  try {
    const p = await preloadPlayer(MC_VIDEO_ID);
    if (!p) return;
    if (!isReady) {
      return;
    }
    if (currentVideoId !== MC_VIDEO_ID) {
      p.loadVideoById(MC_VIDEO_ID);
      currentVideoId = MC_VIDEO_ID;
    }
    p.setVolume(60);
    p.playVideo();
  } catch {}
}

/** Stop/pause the music (does NOT clear desiredVideoId, so a later
 *  start can resume). */
export function stopArabicMusic() {
  try {
    if (player && isReady) {
      player.pauseVideo();
    }
  } catch {}
}

/** Preload the player — call on EVERY user gesture (gate click, audio
 *  toggle, first click anywhere). Creating the iframe during a gesture
 *  is what unlocks autoplay-with-sound later. Safe to call repeatedly. */
export async function initAudio() {
  try {
    // Preload with whichever video is currently desired (default: the
    // loading-screen track). If desiredVideoId is set we honor it.
    const vid = desiredVideoId || LOADING_VIDEO_ID;
    await preloadPlayer(vid);
  } catch {}
}

/** Soft tick for progress bar (Web Audio API). */
export function playTick() {
  if (typeof window === "undefined") return;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
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
  } catch {}
}
