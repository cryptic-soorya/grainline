/**
 * lib/haptics.ts
 *
 * Native iOS apps get real haptic feedback (different "textures" of buzz)
 * through Apple's Haptic Engine — that's not exposed to websites, PWA or
 * not. What the web DOES have is the Vibration API: navigator.vibrate(ms),
 * which iOS Safari (17.4+) added support for in Home Screen PWAs. It's a
 * single buzz of a given duration, not fine-grained taps — but it's enough
 * to make a tap feel "felt" instead of purely visual, which is most of what
 * "feels native" actually means to a user.
 *
 * Older iOS versions, or a browser tab that isn't installed as a PWA, may
 * not support this at all — so every call here is wrapped so it just does
 * nothing instead of throwing an error.
 */

type HapticStyle = "light" | "medium" | "success" | "error";

const PATTERNS: Record<HapticStyle, number | number[]> = {
  light: 10, // quick tap — button presses, card taps
  medium: 25, // a slightly more deliberate action
  success: [15, 40, 15], // two short buzzes — "that worked"
  error: [30, 60, 30, 60, 30], // longer pattern — "something's wrong"
};

export function triggerHaptic(style: HapticStyle = "light") {
  if (typeof window === "undefined") return; // guard against server-side render
  if (!("vibrate" in navigator)) return; // silently no-op if unsupported

  try {
    navigator.vibrate(PATTERNS[style]);
  } catch {
    // Some browsers throw if called outside a direct user gesture — safe to ignore.
  }
}
