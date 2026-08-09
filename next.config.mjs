import withPWAInit from "@ducanh2912/next-pwa";

// This is the whole PWA trick, config-wise: this plugin generates a service
// worker at build time that caches your pages/assets, which is what makes
// the app installable and usable offline. See PLAN.md "How the PWA install
// actually works" for the full explanation.
const withPWA = withPWAInit({
  dest: "public", // service worker file gets written to /public
  disable: process.env.NODE_ENV === "development", // don't cache during dev, it'll hide your changes
  register: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
