import type { ServiceItem } from '../../types.js';

const REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_CEP = '01310100';
const VIACEP_URL = `https://viacep.com.br/ws/${DEFAULT_CEP}/json/`;

export async function checkViaCep(): Promise<ServiceItem> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(VIACEP_URL, { signal: controller.signal });
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;
    if (!res.ok) {
      return {
        id: 'viacep',
        name: 'ViaCEP',
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
        id: 'viacep',
        name: 'ViaCEP',
        status: 'degraded',
        description: 'Resposta não é JSON válido',
        statusCode: res.status,
        responseTimeMs,
      };
    }
    return {
      id: 'viacep',
      name: 'ViaCEP',
      status: 'operational',
      description: `HTTP ${res.status}`,
      statusCode: res.status,
      responseTimeMs,
    };
  } catch (err) {
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;
    const message = err instanceof Error ? err.message : 'Request failed';
    return {
      id: 'viacep',
      name: 'ViaCEP',
      status: 'unknown',
      description: message,
      responseTimeMs,
    };
  }
}
