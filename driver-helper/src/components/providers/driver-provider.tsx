"use client";

import { useEffect } from "react";
import { useDriverStore } from "@/store/driver-store";

type Props = {
  children: React.ReactNode;
};

export function DriverProvider({ children }: Props) {
  const load = useDriverStore((state) => state.load);
  const refreshQueue = useDriverStore((state) => state.refreshQueue);
  const syncNow = useDriverStore((state) => state.syncNow);
  const queueLength = useDriverStore((state) => state.queue.length);

  useEffect(() => {
    void load().then(() => refreshQueue());
  }, [load, refreshQueue]);

  useEffect(() => {
    if (!queueLength) {
      return;
    }
    const runSync = () => {
      if (navigator.onLine) {
        void syncNow();
      }
    };

    const syncTimer: ReturnType<typeof setInterval> = setInterval(runSync, 20_000);
    runSync();
    window.addEventListener("online", runSync);

    return () => {
      clearInterval(syncTimer);
      window.removeEventListener("online", runSync);
    };
  }, [queueLength, syncNow]);

  return <>{children}</>;
}
