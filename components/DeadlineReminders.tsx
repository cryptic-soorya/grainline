"use client";

import { useEffect, useState } from "react";
import { saveSubscription, removeSubscription } from "@/lib/pushSubscriptions";
import { urlBase64ToUint8Array, isPushSupported, isInstalledStandalone, isIOS } from "@/lib/webPush";

/**
 * DeadlineReminders — Phase 6. Toggle to enable/disable a push notification
 * the day before a deadline is due. Lives on /hub/deadlines rather than a
 * general settings page since deadlines are the only thing that sends
 * pushes right now (see PLAN.md Phase 6).
 *
 * On iOS this only works once the app is added to the home screen — Safari
 * won't grant push permission to a page open in a regular tab — so most of
 * this component is just picking the right message for where the user is
 * in that flow, not actual subscribe logic.
 */
export function DeadlineReminders({ uid }: { uid: string }) {
  const [status, setStatus] = useState<"checking" | "unsupported" | "needs-install" | "off" | "on" | "denied">(
    "checking"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }
    if (isIOS() && !isInstalledStandalone()) {
      setStatus("needs-install");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "on" : "off"))
      .catch(() => setStatus("off"));
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Push isn't configured yet");
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      await saveSubscription(uid, subscription.toJSON());
      setStatus("on");
    } catch {
      setError("Couldn't turn on reminders. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await removeSubscription(uid, subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus("off");
    } catch {
      setError("Couldn't turn off reminders. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking" || status === "unsupported") return null;

  return (
    <div className="mb-8 font-mono text-xs uppercase tracking-wide text-parchment/60">
      {status === "needs-install" && <p>Add Grainline to your home screen to enable deadline reminders.</p>}
      {status === "denied" && <p className="text-pin-red/80">Notifications are blocked — enable them in your device settings to get deadline reminders.</p>}
      {status === "off" && (
        <button onClick={enable} disabled={busy} className="hover:text-parchment disabled:opacity-50">
          {busy ? "turning on…" : "🔔 Enable deadline reminders"}
        </button>
      )}
      {status === "on" && (
        <button onClick={disable} disabled={busy} className="hover:text-parchment disabled:opacity-50">
          {busy ? "turning off…" : "🔔 Reminders on — tap to disable"}
        </button>
      )}
      {error && <p className="text-pin-red mt-1">{error}</p>}
    </div>
  );
}
