import { NextResponse } from "next/server";

interface SyncItem {
  id: string;
  table_name: string;
  action: string;
  payload: string;
  created_at: string;
}

export async function POST(request: Request) {
  const body = await request.json();
  const items: SyncItem[] = Array.isArray(body?.items) ? body.items : [];

  if (!items.length) {
    return NextResponse.json({ syncedIds: [] });
  }

  const upstream = process.env.CLOUD_SYNC_URL;
  const apiKey = process.env.CLOUD_SYNC_KEY;

  if (upstream) {
    try {
      const response = await fetch(upstream, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ items }),
      });
      if (!response.ok) {
        console.error("Cloud sync failed", response.status, await response.text());
        return NextResponse.json({ error: "Upstream sync failed" }, { status: 502 });
      }
      const payload = await response.json().catch(() => null);
      const syncedIds: string[] = Array.isArray(payload?.syncedIds)
        ? payload.syncedIds
        : items.map((item) => item.id);
      return NextResponse.json({ syncedIds });
    } catch (error) {
      console.error("Cloud sync error", error);
      return NextResponse.json({ error: "Cloud sync error" }, { status: 502 });
    }
  }

  return NextResponse.json({ syncedIds: items.map((item) => item.id) });
}
