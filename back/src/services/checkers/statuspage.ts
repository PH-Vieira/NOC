import type { ServiceItem, ServiceStatus, StatuspageSummary } from '../../types.js';

const REQUEST_TIMEOUT_MS = 10_000;

function mapIndicatorToStatus(indicator: string): ServiceStatus {
  switch (indicator) {
    case 'none':
      return 'operational';
    case 'minor':
    case 'major':
      return 'degraded';
    case 'critical':
      return 'outage';
    default:
      return 'unknown';
  }
}

export async function checkStatuspage(
  id: string,
  name: string,
  summaryUrl: string
): Promise<ServiceItem> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(summaryUrl, { signal: controller.signal });
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;
    if (!res.ok) {
      return {
        id,
        name,
        status: 'unknown',
        description: `HTTP ${res.status}`,
        responseTimeMs,
      };
    }
    const data = (await res.json()) as StatuspageSummary;
    const status = data?.status;
    if (!status) {
      return {
        id,
        name,
        status: 'unknown',
        description: 'Invalid response',
        responseTimeMs,
      };
    }
    return {
      id,
      name,
      status: mapIndicatorToStatus(status.indicator ?? ''),
      description: status.description ?? undefined,
      responseTimeMs,
      details: { incidents: data.incidents, components: data.components },
    };
  } catch (err) {
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;
    const message = err instanceof Error ? err.message : 'Request failed';
    return {
      id,
      name,
      status: 'unknown',
      description: message,
      responseTimeMs,
    };
  }
}
