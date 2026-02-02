import type { ServiceItem } from '../../types.js';

const REQUEST_TIMEOUT_MS = 15_000;
const SISCOMEX_JSON_URL =
  'https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json';

export async function checkSiscomex(): Promise<ServiceItem> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(SISCOMEX_JSON_URL, { signal: controller.signal });
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;
    if (!res.ok) {
      return {
        id: 'siscomex',
        name: 'Siscomex Nomenclatura',
        status: res.status >= 500 ? 'outage' : 'degraded',
        description: `HTTP ${res.status}`,
        statusCode: res.status,
        responseTimeMs,
      };
    }
    const text = await res.text();
    try {
      JSON.parse(text);
    } catch {
      return {
        id: 'siscomex',
        name: 'Siscomex Nomenclatura',
        status: 'degraded',
        description: 'Resposta não é JSON válido',
        statusCode: res.status,
        responseTimeMs,
      };
    }
    return {
      id: 'siscomex',
      name: 'Siscomex Nomenclatura',
      status: 'operational',
      description: 'API respondendo com JSON',
      statusCode: res.status,
      responseTimeMs,
    };
  } catch (err) {
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;
    const message = err instanceof Error ? err.message : 'Request failed';
    return {
      id: 'siscomex',
      name: 'Siscomex Nomenclatura',
      status: 'unknown',
      description: message,
      responseTimeMs,
    };
  }
}
