"use client";

import { FormEvent, useState } from "react";
import { format } from "date-fns";
import { ClipboardList, RefreshCw } from "lucide-react";
import { useDriverStore } from "@/store/driver-store";

export default function ProfilePage() {
  const {
    profile,
    setProfileName,
    reminders,
    addReminder,
    toggleReminder,
    syncNow,
    queueLength,
    lastSyncAt,
    summary,
    isReady,
  } = useDriverStore((state) => ({
    profile: state.profile,
    setProfileName: state.setProfileName,
    reminders: state.reminders,
    addReminder: state.addReminder,
    toggleReminder: state.toggleReminder,
    syncNow: state.syncNow,
    queueLength: state.queue.length,
    lastSyncAt: state.lastSyncAt,
    summary: state.summary,
    isReady: state.isReady,
  }));
  const [name, setName] = useState(profile?.name ?? "");
  const [reminderForm, setReminderForm] = useState({
    title: "",
    due_on: new Date().toISOString().slice(0, 16),
  });
  const [savingName, setSavingName] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);

  const updateName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    await setProfileName(name.trim());
    setSavingName(false);
  };

  const submitReminder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reminderForm.title.trim()) return;
    setSavingReminder(true);
    await addReminder({
      title: reminderForm.title.trim(),
      due_on: new Date(reminderForm.due_on).toISOString(),
      completed: false,
    });
    setSavingReminder(false);
    setReminderForm({ title: "", due_on: new Date().toISOString().slice(0, 16) });
  };

  if (!isReady) {
    return <div className="card">Loading driver profile…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="card bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="flex flex-col gap-3">
          <span className="badge bg-white/10 text-white/80">Profile</span>
          <h1 className="text-2xl font-semibold">Namaste {profile?.name ?? "Driver"}</h1>
          <p className="text-sm text-white/80">
            Offline-first data stored securely on device. {queueLength} change(s) pending sync.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">Today’s Earnings</p>
              <p className="mt-2 text-xl font-semibold">₹{summary.todayIncome.toLocaleString("en-IN")}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-white/60">Pending Reminders</p>
              <p className="mt-2 text-xl font-semibold">{summary.pendingReminders}</p>
            </div>
            <div className="flex flex-col justify-between rounded-2xl bg-white/10 p-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">Last Sync</p>
                <p className="mt-2 text-sm font-semibold">
                  {lastSyncAt ? format(new Date(lastSyncAt), "d MMM, h:mm a") : "Not synced yet"}
                </p>
              </div>
              <button
                className="button-primary mt-3 justify-center bg-white text-slate-800 hover:bg-slate-100"
                type="button"
                onClick={() => syncNow()}
              >
                <RefreshCw size={16} />
                Sync Now
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <form onSubmit={updateName} className="card space-y-3">
          <h2 className="text-base font-semibold text-slate-700">Update Driver Name</h2>
          <p className="text-xs text-slate-500">
            This name appears in greetings, community and SOS alerts.
          </p>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="Driver name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <button className="button-primary justify-center" type="submit" disabled={savingName}>
            {savingName ? "Saving…" : "Save Name"}
          </button>
        </form>

        <form onSubmit={submitReminder} className="card space-y-3">
          <h2 className="text-base font-semibold text-slate-700">Add Reminder</h2>
          <p className="text-xs text-slate-500">
            Set alerts for permit renewals, service schedules, insurance, challan follow-ups and more.
          </p>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="Reminder title"
            value={reminderForm.title}
            onChange={(event) => setReminderForm((prev) => ({ ...prev, title: event.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            type="datetime-local"
            value={reminderForm.due_on}
            onChange={(event) => setReminderForm((prev) => ({ ...prev, due_on: event.target.value }))}
            required
          />
          <button className="button-primary justify-center" type="submit" disabled={savingReminder}>
            {savingReminder ? "Saving…" : "Save Reminder"}
          </button>
        </form>
      </section>

      <section className="card space-y-4">
        <div className="section-title">
          <h2>Reminders</h2>
          <span>{reminders.length} total</span>
        </div>
        <div className="grid gap-3">
          {reminders.map((reminder) => (
            <label
              key={reminder.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200/70 p-3"
            >
              <div>
                <p className="font-semibold text-slate-700">{reminder.title}</p>
                <p className="text-xs text-slate-500">
                  Due {format(new Date(reminder.due_on), "d MMM, h:mm a")}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={reminder.completed}
                  onChange={(event) => toggleReminder(reminder.id, event.target.checked)}
                />
                <span>{reminder.completed ? "Done" : "Pending"}</span>
              </div>
            </label>
          ))}
          {reminders.length === 0 && (
            <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              <ClipboardList className="mb-2" />
              No reminders yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
