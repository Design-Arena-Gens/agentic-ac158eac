"use client";

import { FormEvent, useState } from "react";
import { HeartPulse, Droplet, BedSingle, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useDriverStore } from "@/store/driver-store";

const presetMetrics = [
  { metric: "Sleep Hours", unit: "hrs", icon: BedSingle },
  { metric: "Water Intake", unit: "litres", icon: Droplet },
  { metric: "Blood Pressure", unit: "mmHg", icon: HeartPulse },
  { metric: "Steps Walked", unit: "steps", icon: Sparkles },
];

export default function HealthPage() {
  const { health, addHealthRecord, profile, isReady } = useDriverStore((state) => ({
    health: state.health,
    addHealthRecord: state.addHealthRecord,
    profile: state.profile,
    isReady: state.isReady,
  }));
  const [form, setForm] = useState({
    metric: presetMetrics[0].metric,
    value: "",
    unit: presetMetrics[0].unit,
    notes: "",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await addHealthRecord({
      metric: form.metric,
      value: Number(form.value),
      unit: form.unit,
      notes: form.notes,
      recorded_on: new Date().toISOString(),
    });
    setForm((prev) => ({ ...prev, value: "", notes: "" }));
  };

  if (!isReady) {
    return <div className="card">Loading health logs…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="card bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
        <div className="flex flex-col gap-3">
          <span className="badge bg-white/10 text-white/85">Driver Wellness</span>
          <h1 className="text-2xl font-semibold">
            Take care, {profile?.name?.split(" ")[0] ?? "champ"}! Health keeps the wheels moving.
          </h1>
          <p className="text-sm text-white/80">
            Track rest, hydration and vitals. Offline logs self-sync to the cloud when signal returns.
          </p>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="card space-y-3">
        <div className="grid gap-2 md:grid-cols-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Metric
            <select
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              value={form.metric}
              onChange={(event) => {
                const preset = presetMetrics.find((item) => item.metric === event.target.value);
                setForm((prev) => ({
                  ...prev,
                  metric: event.target.value,
                  unit: preset?.unit ?? prev.unit,
                }));
              }}
            >
              {presetMetrics.map((preset) => (
                <option key={preset.metric} value={preset.metric}>
                  {preset.metric}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Value ({form.unit})
            <input
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              placeholder={`Enter value in ${form.unit}`}
              type="number"
              step="any"
              value={form.value}
              onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
              required
            />
          </label>
        </div>

        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Notes
          <textarea
            className="mt-2 min-h-[90px] rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-400"
            placeholder="Optional details – e.g. meals, medication, rest quality"
            value={form.notes}
            onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          />
        </label>

        <button className="button-primary justify-center bg-white text-emerald-600 hover:bg-slate-50" type="submit">
          Log Health Metric
        </button>
      </form>

      <section className="card space-y-4">
        <div className="section-title">
          <h2>Recent Logs</h2>
          <span>{health.length ? `${health.length} entries` : "Nothing tracked yet"}</span>
        </div>
        <div className="grid gap-3">
          {health.map((record) => {
            const icon = presetMetrics.find((preset) => preset.metric === record.metric)?.icon ?? Sparkles;
            const Icon = icon;
            return (
              <article
                key={record.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200/80 p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-700">
                      {record.metric} • {record.value} {record.unit}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(new Date(record.recorded_on), "d MMM, h:mm a")}
                    </p>
                    {record.notes && (
                      <p className="mt-1 text-xs text-slate-600">{record.notes}</p>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
