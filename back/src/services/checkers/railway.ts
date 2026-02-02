import type { ServiceItem } from '../../types.js';

const REQUEST_TIMEOUT_MS = 10_000;
const RAILWAY_SUMMARY_URL = 'https://status.railway.com/summary.json';

interface RailwaySummary {
  page?: { status?: string };
  activeIncidents?: Array<{ impact?: string }>;
  activeMaintenances?: unknown[];
}

export async function checkRailway(): Promise<ServiceItem> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(RAILWAY_SUMMARY_URL, { signal: controller.signal });
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;
    if (!res.ok) {
      return {
        id: 'railway',
        name: 'Railway',
        status: res.status >= 500 ? 'outage' : 'degraded',
        description: `HTTP ${res.status}`,
        statusCode: res.status,
        responseTimeMs,
      };
    }
    const data = (await res.json()) as RailwaySummary;
    const pageStatus = data?.page?.status?.toUpperCase();
    const incidents = data?.activeIncidents ?? [];
    const hasMajorOutage = incidents.some(
      (i) => i.impact?.toUpperCase() === 'MAJOROUTAGE'
    );
    if (pageStatus === 'UP' && !hasMajorOutage) {
      return {
        id: 'railway',
        name: 'Railway',
        status: incidents.length > 0 ? 'degraded' : 'operational',
        description:
          pageStatus === 'UP'
            ? incidents.length > 0
              ? `${incidents.length} incidente(s) ativo(s)`
              : 'Todos os sistemas operacionais'
            : pageStatus ?? 'Unknown',
        responseTimeMs,
      };
    }
    return {
      id: 'railway',
      name: 'Railway',
      status: hasMajorOutage ? 'outage' : 'degraded',
      description:
        pageStatus !== 'UP' ? `Status: ${pageStatus ?? 'Unknown'}` : 'Incidentes ativos',
      responseTimeMs,
    };
  } catch (err) {
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;
    const message = err instanceof Error ? err.message : 'Request failed';
    return {
      id: 'railway',
      name: 'Railway',
      status: 'unknown',
      description: message,
      responseTimeMs,
    };
  }
}
