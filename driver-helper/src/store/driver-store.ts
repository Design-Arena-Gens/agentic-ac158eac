"use client";

import { formatISO } from "date-fns";
import { create } from "zustand";
import { v4 as uuid } from "uuid";
import type {
  CommunityPost,
  DriverProfile,
  HealthMetric,
  MoneyEntry,
  Note,
  Reminder,
  SOSContact,
  SOSEvent,
  SyncQueueItem,
  SyncStatus,
} from "@/types";
import {
  addCommunityPost,
  addHealthMetric,
  addMoneyEntry,
  addNote,
  addReminder,
  addSOSContact,
  addSOSEvent,
  enqueueSync,
  getSyncQueue,
  loadSnapshot,
  persistDatabase,
  removeSyncItem,
  toggleReminder,
  upsertProfile,
} from "@/lib/database";

type Summary = {
  todayIncome: number;
  todayExpenses: number;
  pendingReminders: number;
};

interface DriverStoreState {
  isReady: boolean;
  profile: DriverProfile | null;
  earnings: MoneyEntry[];
  expenses: MoneyEntry[];
  notes: Note[];
  health: HealthMetric[];
  community: CommunityPost[];
  reminders: Reminder[];
  sosContacts: SOSContact[];
  sosEvents: SOSEvent[];
  queue: SyncQueueItem[];
  syncStatus: SyncStatus;
  lastSyncAt?: string;
  summary: Summary;
  error?: string;
  load: () => Promise<void>;
  refreshQueue: () => Promise<void>;
  setProfileName: (name: string) => Promise<void>;
  addIncome: (payload: Omit<MoneyEntry, "id">) => Promise<void>;
  addExpense: (payload: Omit<MoneyEntry, "id">) => Promise<void>;
  addNote: (payload: Omit<Note, "id" | "created_at">) => Promise<void>;
  addHealthRecord: (payload: Omit<HealthMetric, "id">) => Promise<void>;
  addCommunityPost: (message: string) => Promise<void>;
  addReminder: (payload: Omit<Reminder, "id">) => Promise<void>;
  toggleReminder: (id: string, completed: boolean) => Promise<void>;
  addSOSContact: (payload: Omit<SOSContact, "id">) => Promise<void>;
  recordSOSEvent: (payload: Partial<SOSEvent>) => Promise<void>;
  setSyncStatus: (status: SyncStatus) => void;
  markSynced: (ids: string[]) => Promise<void>;
  setError: (message?: string) => void;
  syncNow: () => Promise<void>;
}

function computeSummary(earnings: MoneyEntry[], expenses: MoneyEntry[], reminders: Reminder[]): Summary {
  const today = formatISO(new Date(), { representation: "date" });
  const todayIncome = earnings
    .filter((item) => item.recorded_on?.slice(0, 10) === today)
    .reduce((sum, entry) => sum + (entry.amount ?? 0), 0);
  const todayExpenses = expenses
    .filter((item) => item.recorded_on?.slice(0, 10) === today)
    .reduce((sum, entry) => sum + (entry.amount ?? 0), 0);
  const pendingReminders = reminders.filter((rem) => !rem.completed).length;
  return { todayIncome, todayExpenses, pendingReminders };
}

async function queueChange(table: string, action: "create" | "update" | "delete", data: unknown) {
  const item: SyncQueueItem = {
    id: uuid(),
    table_name: table,
    action,
    payload: JSON.stringify(data),
    created_at: new Date().toISOString(),
  };
  await enqueueSync(item);
  return item;
}

export const useDriverStore = create<DriverStoreState>((set, get) => ({
  isReady: false,
  profile: null,
  earnings: [],
  expenses: [],
  notes: [],
  health: [],
  community: [],
  reminders: [],
  sosContacts: [],
  sosEvents: [],
  queue: [],
  syncStatus: "idle",
  summary: { todayIncome: 0, todayExpenses: 0, pendingReminders: 0 },
  load: async () => {
    const snapshot = await loadSnapshot();
    set({
      ...snapshot,
      isReady: true,
      summary: computeSummary(snapshot.earnings, snapshot.expenses, snapshot.reminders),
    });
  },
  refreshQueue: async () => {
    const queue = await getSyncQueue();
    set({ queue });
  },
  setProfileName: async (name: string) => {
    await upsertProfile(name);
    const queueItem = await queueChange("driver_profile", "update", { name });
    const profile: DriverProfile = { id: 1, name, created_at: new Date().toISOString() };
    set((state) => ({
      profile,
      queue: [...state.queue.filter((item) => item.id !== queueItem.id), queueItem],
    }));
  },
  addIncome: async (payload) => {
    const id = uuid();
    const entry: MoneyEntry = {
      id,
      amount: payload.amount,
      category: payload.category,
      description: payload.description,
      recorded_on: payload.recorded_on ?? new Date().toISOString(),
      source: payload.source,
      payment_mode: payload.payment_mode,
    };
    await addMoneyEntry("earnings", entry);
    const queueItem = await queueChange("earnings", "create", entry);
    set((state) => {
      const earnings = [entry, ...state.earnings];
      return {
        earnings,
        summary: computeSummary(earnings, state.expenses, state.reminders),
        queue: [...state.queue.filter((item) => item.id !== queueItem.id), queueItem],
      };
    });
  },
  addExpense: async (payload) => {
    const id = uuid();
    const entry: MoneyEntry = {
      id,
      amount: payload.amount,
      category: payload.category,
      description: payload.description,
      recorded_on: payload.recorded_on ?? new Date().toISOString(),
      payment_mode: payload.payment_mode,
    };
    await addMoneyEntry("expenses", entry);
    const queueItem = await queueChange("expenses", "create", entry);
    set((state) => {
      const expenses = [entry, ...state.expenses];
      return {
        expenses,
        summary: computeSummary(state.earnings, expenses, state.reminders),
        queue: [...state.queue.filter((item) => item.id !== queueItem.id), queueItem],
      };
    });
  },
  addNote: async (payload) => {
    const note: Note = {
      id: uuid(),
      title: payload.title,
      body: payload.body,
      created_at: new Date().toISOString(),
    };
    await addNote(note);
    const queueItem = await queueChange("notes", "create", note);
    set((state) => ({
      notes: [note, ...state.notes],
      queue: [...state.queue.filter((item) => item.id !== queueItem.id), queueItem],
    }));
  },
  addHealthRecord: async (payload) => {
    const record: HealthMetric = {
      id: uuid(),
      metric: payload.metric,
      value: payload.value,
      unit: payload.unit,
      recorded_on: payload.recorded_on ?? new Date().toISOString(),
      notes: payload.notes,
    };
    await addHealthMetric(record);
    const queueItem = await queueChange("health_logs", "create", record);
    set((state) => ({
      health: [record, ...state.health],
      queue: [...state.queue.filter((item) => item.id !== queueItem.id), queueItem],
    }));
  },
  addCommunityPost: async (message: string) => {
    const post: CommunityPost = {
      id: uuid(),
      author: get().profile?.name ?? "Driver Helper",
      message,
      created_at: new Date().toISOString(),
      location: "",
      reactions: 0,
    };
    await addCommunityPost(post);
    const queueItem = await queueChange("community_posts", "create", post);
    set((state) => ({
      community: [post, ...state.community],
      queue: [...state.queue.filter((item) => item.id !== queueItem.id), queueItem],
    }));
  },
  addReminder: async (payload) => {
    const reminder: Reminder = {
      id: uuid(),
      title: payload.title,
      due_on: payload.due_on,
      completed: payload.completed ?? false,
    };
    await addReminder(reminder);
    const queueItem = await queueChange("reminders", "create", reminder);
    set((state) => {
      const reminders = [reminder, ...state.reminders];
      return {
        reminders,
        summary: computeSummary(state.earnings, state.expenses, reminders),
        queue: [...state.queue.filter((item) => item.id !== queueItem.id), queueItem],
      };
    });
  },
  toggleReminder: async (id, completed) => {
    await toggleReminder(id, completed);
    const queueItem = await queueChange("reminders", "update", { id, completed });
    set((state) => {
      const reminders = state.reminders.map((item) =>
        item.id === id ? { ...item, completed } : item
      );
      return {
        reminders,
        summary: computeSummary(state.earnings, state.expenses, reminders),
        queue: [...state.queue.filter((item) => item.id !== queueItem.id), queueItem],
      };
    });
  },
  addSOSContact: async (payload) => {
    const contact: SOSContact = {
      id: uuid(),
      name: payload.name,
      phone: payload.phone,
      relation: payload.relation,
    };
    await addSOSContact(contact);
    const queueItem = await queueChange("sos_contacts", "create", contact);
    set((state) => ({
      sosContacts: [contact, ...state.sosContacts],
      queue: [...state.queue.filter((item) => item.id !== queueItem.id), queueItem],
    }));
  },
  recordSOSEvent: async (payload) => {
    const event: SOSEvent = {
      id: uuid(),
      triggered_at: new Date().toISOString(),
      location_lat: payload.location_lat,
      location_lng: payload.location_lng,
      notes: payload.notes,
    };
    await addSOSEvent(event);
    const queueItem = await queueChange("sos_events", "create", event);
    set((state) => ({
      sosEvents: [event, ...state.sosEvents],
      queue: [...state.queue.filter((item) => item.id !== queueItem.id), queueItem],
    }));
  },
  setSyncStatus: (status) => set({ syncStatus: status }),
  markSynced: async (ids) => {
    await Promise.all(ids.map((id) => removeSyncItem(id)));
    await persistDatabase();
    set((state) => ({
      queue: state.queue.filter((item) => !ids.includes(item.id)),
      syncStatus: "idle",
      lastSyncAt: new Date().toISOString(),
    }));
  },
  setError: (message) => set({ error: message ?? undefined }),
  syncNow: async () => {
    const state = get();
    if (!state.queue.length || typeof window === "undefined" || !navigator.onLine) {
      return;
    }
    set({ syncStatus: "syncing", error: undefined });
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: state.queue }),
      });
      if (!response.ok) {
        throw new Error(`Sync failed with status ${response.status}`);
      }
      const payload = await response.json();
      const syncedIds: string[] =
        Array.isArray(payload?.syncedIds) && payload.syncedIds.length
          ? payload.syncedIds
          : state.queue.map((item) => item.id);
      await get().markSynced(syncedIds);
    } catch (error) {
      console.error("Sync error", error);
      set({
        syncStatus: "error",
        error: error instanceof Error ? error.message : "Unable to sync with cloud backend",
      });
    }
  },
}));

export type { DriverStoreState };
