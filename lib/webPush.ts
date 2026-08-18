/**
 * lib/webPush.ts
 *
 * Small browser-side helpers for the Push API. Kept separate from
 * components/DeadlineReminders.tsx so the base64 <-> Uint8Array conversion
 * (which the Push API requires but nothing else in the app needs) doesn't
 * clutter the component.
 */

// pushManager.subscribe() wants the VAPID public key as a Uint8Array, but
// env vars can only hold strings — this is the standard conversion for the
// URL-safe base64 format `web-push generate-vapid-keys` outputs.
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

// iOS only accepts the Web Push permission prompt from a PWA that's been
// added to the home screen — never from a plain Safari tab. `standalone`
// is Safari's non-standard flag for "running as an installed PWA";
// `display-mode: standalone` is the standard equivalent other browsers use.
export function isInstalledStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
