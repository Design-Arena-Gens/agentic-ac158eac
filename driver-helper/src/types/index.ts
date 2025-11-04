export type SyncStatus = "idle" | "syncing" | "error";

export interface DriverProfile {
  id: number;
  name: string;
  created_at: string;
}

export interface MoneyEntry {
  id: string;
  amount: number;
  category: string;
  description?: string;
  recorded_on: string;
  source?: string;
  payment_mode?: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export interface HealthMetric {
  id: string;
  metric: string;
  value: number;
  unit: string;
  recorded_on: string;
  notes?: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  message: string;
  created_at: string;
  reactions?: number;
  location?: string;
}

export interface Reminder {
  id: string;
  title: string;
  due_on: string;
  completed: boolean;
}

export interface SOSContact {
  id: string;
  name: string;
  phone: string;
  relation?: string;
}

export interface SOSEvent {
  id: string;
  triggered_at: string;
  location_lat?: number;
  location_lng?: number;
  notes?: string;
}

export interface SyncQueueItem {
  id: string;
  table_name: string;
  action: "create" | "update" | "delete";
  payload: string;
  created_at: string;
}

export interface DriverSnapshot {
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
}
