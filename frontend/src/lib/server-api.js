import { getPublicApiBase } from "@/lib/publicApi";

export async function serverGet(path, { params, revalidate = 60 } = {}) {
  const base = getPublicApiBase();
  if (!base) throw new Error("Missing NEXT_PUBLIC_API_BASE in .env.local");

  const url = new URL(path, base);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }

  const res = await fetch(url.toString(), {
    // cache nhẹ cho home
    next: { revalidate },
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GET ${url} failed: ${res.status}. ${text}`);
  }

  return res.json();
}
