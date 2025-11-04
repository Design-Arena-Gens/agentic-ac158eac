"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowUpCircle, Bot, HeartPulse, Users, NotebookPen, LifeBuoy } from "lucide-react";
import { useDriverStore } from "@/store/driver-store";
import { format } from "date-fns";

const DASHBOARD_LINKS = [
  {
    title: "SOS Help",
    href: "/sos",
    description: "Quick emergency access, live location, trusted contacts.",
    icon: LifeBuoy,
    accent: "from-rose-500/90 to-rose-600/80",
  },
  {
    title: "Income & Expense",
    href: "/earnings",
    description: "Track trips, fuel, tolls and settlements.",
    icon: ArrowUpCircle,
    accent: "from-blue-500/90 to-blue-600/85",
  },
  {
    title: "Community",
    href: "/community",
    description: "Updates from drivers near you. Share, support, unite.",
    icon: Users,
    accent: "from-amber-500/90 to-amber-600/85",
  },
  {
    title: "Health",
    href: "/health",
    description: "Keep a check on sleep, hydration, meals and vitals.",
    icon: HeartPulse,
    accent: "from-emerald-500/90 to-emerald-600/85",
  },
  {
    title: "Notes",
    href: "/notes",
    description: "Log trip notes, customer preferences, reminders.",
    icon: NotebookPen,
    accent: "from-indigo-500/90 to-indigo-600/80",
  },
  {
    title: "AI Assistant",
    href: "/assistant",
    description: "Gemini powered chat, translation and smart search.",
    icon: Bot,
    accent: "from-purple-500/90 to-purple-600/85",
  },
];

export default function DashboardPage() {
  const { profile, summary, earnings, expenses, reminders, isReady } = useDriverStore((state) => ({
    profile: state.profile,
    summary: state.summary,
    earnings: state.earnings,
    expenses: state.expenses,
    reminders: state.reminders,
    isReady: state.isReady,
  }));

  const today = useMemo(() => format(new Date(), "EEEE, d MMM"), []);

  const latestEarning = earnings[0];
  const latestExpense = expenses[0];

  if (!isReady) {
    return <div className="card">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <header className="card bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="flex flex-col gap-4">
          <span className="badge bg-white/10 text-xs uppercase tracking-wide text-white/90">
            {today}
          </span>
          <div>
            <h1 className="text-3xl font-semibold">
              Hello {profile?.name?.split(" ")[0] ?? "Driver"} 👋
            </h1>
            <p className="mt-2 text-sm text-white/75">
              Stay sharp on the road. Your co-pilot has you covered offline or online.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs uppercase tracking-wide text-white/70">Today’s Earnings</p>
              <p className="mt-2 text-2xl font-semibold">
                ₹{summary.todayIncome.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
              {latestEarning?.description && (
                <p className="mt-1 truncate text-xs text-white/70">{latestEarning.description}</p>
              )}
            </div>
            <div className="rounded-2xl bg-white/8 p-4">
              <p className="text-xs uppercase tracking-wide text-white/70">Today’s Expenses</p>
              <p className="mt-2 text-2xl font-semibold">
                ₹{summary.todayExpenses.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
              {latestExpense?.description && (
                <p className="mt-1 truncate text-xs text-white/70">{latestExpense.description}</p>
              )}
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-white/70">Reminders Pending</p>
              <p className="mt-2 text-2xl font-semibold">{summary.pendingReminders}</p>
              <p className="mt-1 text-xs text-white/60">
                {summary.pendingReminders > 0
                  ? "Tap to check reminders"
                  : "All reminders handled"}
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {DASHBOARD_LINKS.map((link) => (
          <Link href={link.href} key={link.href}>
            <article className="card hover:shadow-xl transition-shadow">
              <div
                className={`mb-4 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r ${link.accent} px-4 py-3 text-white shadow-lg`}
              >
                <link.icon size={20} strokeWidth={1.8} />
                <strong>{link.title}</strong>
              </div>
              <p className="text-sm text-slate-600">{link.description}</p>
            </article>
          </Link>
        ))}
      </section>

      <section className="card">
        <div className="section-title">
          <h2>Reminders</h2>
          <span>{reminders.length ? `${reminders.length} saved` : "Add your first reminder"}</span>
        </div>
        <div className="grid gap-3">
          {reminders.length === 0 && (
            <p className="text-sm text-slate-500">
              Keep track of permit renewals, service dates, challans and more from the profile tab.
            </p>
          )}
          {reminders.slice(0, 3).map((reminder) => (
            <div
              key={reminder.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200/70 p-3"
            >
              <div>
                <p className="font-medium text-slate-800">{reminder.title}</p>
                <p className="text-xs text-slate-500">
                  Due {format(new Date(reminder.due_on), "d MMM, h:mm a")}
                </p>
              </div>
              <span className="pill">{reminder.completed ? "Done" : "Pending"}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
