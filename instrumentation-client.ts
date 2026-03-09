// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isSentryEnabled = () => {
  // Pastikan kode jalan di browser (client-side)
  if (typeof window === "undefined") {
    return false;
  }

  // Ambil status yang disimpan oleh layout.tsx
  const status = localStorage.getItem("SENTRY_CONFIG_STATUS");

  // Jika belum ada nilai (masih loading pertama kali), default-nya TRUE (aman)
  // Atau FALSE jika Anda ingin benar-benar mati sampai API merespons
  if (status === null) {
    return true;
  }

  return status === "true";
};

if (isSentryEnabled()) {
  Sentry.init({
    dsn: "https://c542aafc3547f532030b162bb378ff51@o4510989957726208.ingest.us.sentry.io/4510989958905856",

    // Add optional integrations for additional features
    integrations: [Sentry.replayIntegration()],

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 0.1,
    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Define how likely Replay events are sampled.
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,

    // Define how likely Replay events are sampled when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    // Enable sending user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    maxBreadcrumbs: 50,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
