"use client";

import { FormEvent, useState } from "react";
import { NotebookPen, StickyNote } from "lucide-react";
import { format } from "date-fns";
import { useDriverStore } from "@/store/driver-store";

export default function NotesPage() {
  const { notes, addNote, isReady } = useDriverStore((state) => ({
    notes: state.notes,
    addNote: state.addNote,
    isReady: state.isReady,
  }));
  const [form, setForm] = useState({ title: "", body: "" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.body.trim()) return;
    await addNote({
      title: form.title || "Untitled note",
      body: form.body.trim(),
    });
    setForm({ title: "", body: "" });
  };

  if (!isReady) {
    return <div className="card">Loading notes…</div>;
  }

  return (
    <div className="space-y-6">
      <section className="card bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-white/15 p-3">
            <NotebookPen size={24} />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">Road Notes</h1>
            <p className="text-sm text-white/80">
              Jot customer details, delivery instructions, toll info or reminders in one place.
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="card space-y-3">
        <input
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          placeholder="Title"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
        />
        <textarea
          className="min-h-[140px] rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          placeholder="Write notes. Offline safe, auto-sync when connected."
          value={form.body}
          onChange={(event) => setForm((prev) => ({ ...prev, body: event.target.value }))}
          required
        />
        <button className="button-primary justify-center" type="submit">
          Save Note
        </button>
      </form>

      <section className="grid gap-3">
        {notes.map((note) => (
          <article key={note.id} className="card">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="inline-flex items-center gap-2 text-slate-700">
                <StickyNote size={16} />
                {note.title}
              </span>
              <span>{format(new Date(note.created_at), "d MMM, h:mm a")}</span>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{note.body}</p>
          </article>
        ))}
        {notes.length === 0 && (
          <div className="card border border-dashed border-slate-300 text-center text-sm text-slate-500">
            No notes stored yet. Add your first note to start syncing road intelligence.
          </div>
        )}
      </section>
    </div>
  );
}
