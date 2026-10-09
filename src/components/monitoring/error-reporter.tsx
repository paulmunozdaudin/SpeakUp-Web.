"use client";

import { useEffect } from "react";
import { reportClientError } from "@/utils/report-error";

/** Reports uncaught exceptions and unhandled promise rejections. */
export function ErrorReporter() {
  useEffect(() => {
    function onError(event: ErrorEvent) {
      reportClientError(
        "uncaught",
        `${event.message} @ ${event.filename}:${event.lineno}`,
      );
    }
    function onRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      reportClientError(
        "unhandled-rejection",
        reason instanceof Error ? reason.message : String(reason),
      );
    }
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
