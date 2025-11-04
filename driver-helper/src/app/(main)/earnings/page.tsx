"use client";

import { FormEvent, useMemo, useState } from "react";
import { format } from "date-fns";
import { useDriverStore } from "@/store/driver-store";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const categories = ["Daily Trip", "Rental", "Airport", "Corporate", "Fuel", "Toll", "Maintenance"];

export default function EarningsPage() {
  const { earnings, expenses, addIncome, addExpense, isReady } = useDriverStore((state) => ({
    earnings: state.earnings,
    expenses: state.expenses,
    addIncome: state.addIncome,
    addExpense: state.addExpense,
    isReady: state.isReady,
  }));

  const [earningForm, setEarningForm] = useState({
    amount: "",
    category: categories[0],
    description: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    category: categories[4],
    description: "",
  });

  const totals = useMemo(() => {
    const totalEarnings = earnings.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);
    const totalExpenses = expenses.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0);
    return {
      totalEarnings,
      totalExpenses,
      balance: totalEarnings - totalExpenses,
    };
  }, [earnings, expenses]);

  const submitEarning = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await addIncome({
      amount: Number(earningForm.amount),
      category: earningForm.category,
      description: earningForm.description,
      recorded_on: new Date().toISOString(),
    });
    setEarningForm({ amount: "", category: categories[0], description: "" });
  };

  const submitExpense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await addExpense({
      amount: Number(expenseForm.amount),
      category: expenseForm.category,
      description: expenseForm.description,
      recorded_on: new Date().toISOString(),
    });
    setExpenseForm({ amount: "", category: categories[4], description: "" });
  };

  if (!isReady) {
    return <div className="card">Loading earnings data…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="card bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/80">Total Earnings</p>
            <p className="mt-2 text-2xl font-semibold">
              ₹{totals.totalEarnings.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/80">Total Expenses</p>
            <p className="mt-2 text-2xl font-semibold">
              ₹{totals.totalExpenses.toLocaleString("en-IN")}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/80">Net Balance</p>
            <p className="mt-2 text-2xl font-semibold">
              ₹{totals.balance.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <form onSubmit={submitEarning} className="card space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
              <ArrowUpCircle size={20} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Add Income</h2>
              <p className="text-xs text-slate-500">Log cash, UPI or card collections instantly.</p>
            </div>
          </div>

          <input
            type="number"
            min="0"
            step="1"
            required
            value={earningForm.amount}
            onChange={(event) =>
              setEarningForm((prev) => ({ ...prev, amount: event.target.value }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="Amount (₹)"
          />

          <select
            value={earningForm.category}
            onChange={(event) =>
              setEarningForm((prev) => ({ ...prev, category: event.target.value }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            {categories.slice(0, 4).map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>

          <textarea
            value={earningForm.description}
            onChange={(event) =>
              setEarningForm((prev) => ({ ...prev, description: event.target.value }))
            }
            className="min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="Short note (ride, distance, payment mode)"
          />

          <button className="button-primary justify-center" type="submit">
            Save Income
          </button>
        </form>

        <form onSubmit={submitExpense} className="card space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-rose-100 p-2 text-rose-600">
              <ArrowDownCircle size={20} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-800">Add Expense</h2>
              <p className="text-xs text-slate-500">Record fuel, maintenance, challans & more.</p>
            </div>
          </div>

          <input
            type="number"
            min="0"
            step="1"
            required
            value={expenseForm.amount}
            onChange={(event) =>
              setExpenseForm((prev) => ({ ...prev, amount: event.target.value }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="Amount (₹)"
          />

          <select
            value={expenseForm.category}
            onChange={(event) =>
              setExpenseForm((prev) => ({ ...prev, category: event.target.value }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
          >
            {categories.slice(3).map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>

          <textarea
            value={expenseForm.description}
            onChange={(event) =>
              setExpenseForm((prev) => ({ ...prev, description: event.target.value }))
            }
            className="min-h-[80px] rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400"
            placeholder="Short note (fuel station, toll booth, etc.)"
          />

          <button className="button-primary justify-center bg-rose-500 hover:bg-rose-600" type="submit">
            Save Expense
          </button>
        </form>
      </section>

      <section className="card space-y-4">
        <div className="section-title">
          <h2>Recent Activity</h2>
          <span>Earnings & expenses history</span>
        </div>

        <div className="grid gap-3">
          {[...earnings.slice(0, 5).map((item) => ({ ...item, type: "earning" as const })), 
            ...expenses.slice(0, 5).map((item) => ({ ...item, type: "expense" as const }))]
            .sort((a, b) => (a.recorded_on > b.recorded_on ? -1 : 1))
            .slice(0, 10)
            .map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200/70 p-3"
              >
                <div>
                  <p className="font-semibold text-slate-700">
                    {entry.type === "earning" ? "Income" : "Expense"} • {entry.category}
                  </p>
                  <p className="text-xs text-slate-500">
                    {format(new Date(entry.recorded_on), "d MMM, h:mm a")}
                  </p>
                  {entry.description && (
                    <p className="mt-1 text-xs text-slate-600">{entry.description}</p>
                  )}
                </div>
                <span
                  className={`pill ${entry.type === "earning" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                >
                  {entry.type === "earning" ? "+" : "-"}₹{Number(entry.amount).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
