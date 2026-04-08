import posthog from "posthog-js";

const PAGEVIEW_EVENT = "$pageview";
const ACB_CALC_PATHNAME = "/anet-acb";

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
  api_host: "/ingest",
  ui_host: "https://us.posthog.com",
  defaults: "2026-01-30",
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
  before_send: (event) => {
    if (!event) return event;

    const pathname =
      typeof event.properties?.$pathname === "string"
        ? event.properties.$pathname
        : typeof window !== "undefined"
          ? window.location.pathname
          : null;

    if (pathname === ACB_CALC_PATHNAME && event.event !== PAGEVIEW_EVENT) {
      return null;
    }

    return event;
  },
});
