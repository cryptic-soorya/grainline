/**
 * worker/index.js
 *
 * Custom service worker code for Phase 6 push notifications. next-pwa
 * (@ducanh2912/next-pwa) bundles this file and imports it into the
 * Workbox-generated public/sw.js at build time — this is the mechanism
 * that lets us add our own `push`/`notificationclick` listeners without
 * hand-writing the whole service worker (Workbox still owns offline
 * caching for everything else).
 *
 * `self` here is the service worker's global scope, same as in any
 * hand-written service worker file.
 */

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Grainline", body: event.data.text() };
  }

  const title = payload.title || "Grainline";
  const options = {
    body: payload.body,
    // Falls back to a maskable icon that already exists for the PWA
    // manifest, so this doesn't need its own dedicated notification icon.
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    // Carried through to notificationclick so we know where to route the
    // tap — e.g. straight to the deadline that's due.
    data: { url: payload.url || "/hub/deadlines" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Tapping the notification should focus an already-open Grainline tab if
// one exists, instead of always opening a new one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/hub/deadlines";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
