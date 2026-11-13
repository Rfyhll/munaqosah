"use client";

/**
 * YouTube background-music player — MUTE-PRELOAD + UNMUTE-ON-GESTURE.
 *
 * Plays Arabic orchestral music as background:
 *  - Loading screen: "CEK SOUND ARABIC - SOUND SYSTEM LEBIH BERKELAS - WIJAYA ENTERTAINMENT"
 *    Video ID: 8rGeb1a-iPs
 *  - MC Screen (acara berlangsung): "National Arab Orchestra - Ghanili Shway"
 *    Video ID: JAFTuss-Ekw
 *
 * WHY MUTE-PRELOAD?
 *  Browsers block YouTube autoplay-WITH-SOUND unless the play call
 *  happens synchronously inside a real user gesture. The catch: the
 *  YT IFrame API is async — `new YT.Player(...)` + `onReady` happen
 *  after a tick, by which point the gesture is gone. So calling
 *  playVideo() after an `await` is always blocked.
 *
 *  Trick that actually works:
 *   1. On component mount, create the player MUTED + autoplay=1.
 *      Muted autoplay is ALWAYS allowed by every browser, no gesture
 *      needed. The video starts playing silently in the background.
 *   2. When the user clicks "Klik untuk Memulai" (a real gesture),
 *      call `player.unMute()` SYNCHRONOUSLY inside that handler.
 *      Unmuting an already-playing video is permitted inside a
 *      gesture, so audio becomes audible immediately.
 *   3. To switch tracks (loading -> MC), call `loadVideoById()` +
 *      `unMute()` inside the MC button's click gesture.
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

// ---------- YouTube player state -------------------------------------------
let player: any = null;
let isReady = false;
let apiLoading = false;
// Which video is currently loaded into the iframe.
let currentVideoId: string | null = null;
// Which video the caller WANTS to play right now (used by onReady to
// catch a switch requested before the player finished loading).
let desiredVideoId: string = LOADING_VIDEO_ID;
// If the user clicked to unmute before onReady fired, remember it so
// onReady can perform the unmute the moment the player is ready.
let wantUnmute = false;
// Whether the user has ever unmuted (so we don't re-mute by accident).
let isUnmuted = false;

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

/**
 * Create the hidden MUTED player on mount. No user gesture needed —
 * muted autoplay is always allowed. The video starts playing silently
 * immediately so that, the moment the user clicks, we can unmute it
 * synchronously inside the gesture.
 */
export async function preloadMusic(): Promise<void> {
  if (typeof window === "undefined") return;
  if (player) return; // already created
  await loadAPI();
  const YT = (window as any).YT;
  if (!YT || !YT.Player) return;

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

  // YT.Player REPLACES the given element with an <iframe>, so we need a
  // fresh child element each time we (re)create the player.
  let inner = document.getElementById("yt-music-player");
  if (inner) inner.remove();
  inner = document.createElement("div");
  inner.id = "yt-music-player";
  inner.style.width = "100%";
  inner.style.height = "100%";
  container.appendChild(inner);

  const startVideo = desiredVideoId;
  player = new YT.Player("yt-music-player", {
    videoId: startVideo,
    width: "1",
    height: "1",
    playerVars: {
      autoplay: 1, // start playing immediately...
      mute: 1, // ...but MUTED, so autoplay is allowed with no gesture
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      loop: 1,
      playlist: startVideo,
    },
    events: {
      onReady: () => {
        isReady = true;
        currentVideoId = startVideo;
        try {
          player.setVolume(60);
          // If desired video changed while loading, swap now.
          if (desiredVideoId !== currentVideoId) {
            player.loadVideoById(desiredVideoId);
            currentVideoId = desiredVideoId;
          }
          // If the user already clicked to unmute before we were ready,
          // perform the unmute now (this is still within the same task
          // the gesture started if it fired fast enough; even if not,
          // unmuting an already-playing muted iframe is allowed).
          if (wantUnmute || isUnmuted) {
            player.unMute();
            player.setVolume(60);
            player.playVideo();
            isUnmuted = true;
          }
        } catch {}
      },
      onStateChange: (event: any) => {
        // Loop the video when it ends.
        if (event.data === 0) {
          try {
            player.seekTo(0);
            player.playVideo();
          } catch {}
        }
        // If the desired video changed and we just got a "playing"
        // state, make sure the volume/unmute is honored.
        if (event.data === 1 && isUnmuted) {
          try {
            player.unMute();
            player.setVolume(60);
          } catch {}
        }
      },
      onError: () => {
        // Silent fail on region block etc.
      },
    },
  });
}

/** Switch the desired track. If the player is ready, swap the video
 *  immediately; otherwise onReady will pick it up. */
function setDesiredVideo(videoId: string) {
  desiredVideoId = videoId;
  if (player && isReady) {
    if (currentVideoId !== videoId) {
      try {
        player.loadVideoById(videoId);
        currentVideoId = videoId;
      } catch {}
    }
  }
}

/**
 * Unmute the already-playing muted video. MUST be called synchronously
 * inside a user gesture (click handler) for the unmute to take effect.
 * Safe to call repeatedly.
 */
function unmuteMusic() {
  wantUnmute = true;
  isUnmuted = true;
  // Also try to resume the Web Audio context (for tick sounds) inside
  // the same gesture.
  getAudioCtx();
  if (player && isReady) {
    try {
      player.unMute();
      player.setVolume(60);
      player.playVideo();
    } catch {}
  }
}

/** Start the LOADING screen music (CEK SOUND ARABIC). Call inside a
 *  user gesture so the unmute is honored. */
export function startArabicMusic() {
  setDesiredVideo(LOADING_VIDEO_ID);
  unmuteMusic();
}

/** Start the MC screen music (Ghanili Shway). Call inside a user
 *  gesture (the MC button click) so the unmute is honored. */
export function startMcMusic() {
  setDesiredVideo(MC_VIDEO_ID);
  unmuteMusic();
}

/** Stop/pause the music. */
export function stopArabicMusic() {
  try {
    if (player && isReady) {
      player.pauseVideo();
    }
  } catch {}
}

/** Preload on mount — backward-compatible alias for preloadMusic(). */
export async function initAudio() {
  try {
    await preloadMusic();
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
