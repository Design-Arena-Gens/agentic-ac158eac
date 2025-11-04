"use client";

import { useDriverStore } from "@/store/driver-store";
import clsx from "classnames";
import { useMemo } from "react";

const statusLabel: Record<string, string> = {
  idle: "All changes synced",
  syncing: "Syncing with cloud…",
  error: "Sync failed. Retrying…",
};

export function SyncIndicator() {
  const { syncStatus, lastSyncAt, queueLength, error } = useDriverStore((state) => ({
    syncStatus: state.syncStatus,
    lastSyncAt: state.lastSyncAt,
    queueLength: state.queue.length,
    error: state.error,
  }));

  const message = useMemo(() => {
    if (syncStatus === "idle" && queueLength === 0) {
      return lastSyncAt ? `Synced at ${new Date(lastSyncAt).toLocaleTimeString()}` : "All caught up";
    }
    return statusLabel[syncStatus] ?? "Syncing…";
  }, [lastSyncAt, queueLength, syncStatus]);

  const shouldShow = syncStatus !== "idle" || queueLength > 0 || error;

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      className={clsx(
        "fixed top-2 left-1/2 z-50 -translate-x-1/2 rounded-full border px-4 py-2 text-sm shadow-md transition-colors",
        {
          "border-emerald-200 bg-emerald-50 text-emerald-700": syncStatus === "idle" && !error,
          "border-blue-200 bg-blue-50 text-blue-700": syncStatus === "syncing",
          "border-amber-200 bg-amber-50 text-amber-700": syncStatus === "error" || !!error,
        }
      )}
    >
      <span>{error ?? message}</span>
      {queueLength > 0 && (
        <span className="ml-2 rounded-full bg-black/10 px-2 py-0.5 text-xs">
          {queueLength} pending
        </span>
      )}
    </div>
  );
}
