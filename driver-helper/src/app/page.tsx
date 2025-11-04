"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDriverStore } from "@/store/driver-store";
import { Loader2, Truck } from "lucide-react";

export default function SplashScreen() {
  const router = useRouter();
  const profile = useDriverStore((state) => state.profile);
  const isReady = useDriverStore((state) => state.isReady);
  const setProfileName = useDriverStore((state) => state.setProfileName);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isReady && profile?.name) {
      router.replace("/dashboard");
    }
  }, [isReady, profile?.name, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await setProfileName(name.trim());
    router.replace("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 text-white">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="w-full max-w-md rounded-3xl bg-white/10 p-8 shadow-2xl backdrop-blur-md"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="grid size-16 place-items-center rounded-2xl bg-white/10 shadow-inner">
              <Truck className="size-8" strokeWidth={1.8} />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Driver Helper</h1>
            <p className="text-sm text-slate-200">
              Smart offline-first co-pilot for India’s drivers. Let’s get you set up.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="text-left text-sm font-medium text-slate-200" htmlFor="driver-name">
              Enter your name
            </label>
            <input
              id="driver-name"
              className="w-full rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-base text-white outline-none transition focus:border-white"
              placeholder="e.g. Sandeep Kumar"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <button type="submit" className="button-primary w-full justify-center" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                <>Continue</>
              )}
            </button>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
