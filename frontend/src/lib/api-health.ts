export type HealthPayload = {
  ok: boolean;
  app?: string;
  slug?: string;
};

export type HealthResult =
  | { ok: true; data: HealthPayload; baseUrl: string }
  | { ok: false; message: string; baseUrl: string };

function getApiBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
  return raw.replace(/\/$/, "");
}

export async function fetchApiHealth(): Promise<HealthResult> {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
    if (!res.ok) {
      return {
        ok: false,
        message: `API returned ${res.status}`,
        baseUrl,
      };
    }
    const data = (await res.json()) as HealthPayload;
    return { ok: true, data, baseUrl };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not reach API";
    return { ok: false, message, baseUrl };
  }
}
