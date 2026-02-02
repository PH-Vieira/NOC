import type { ServiceItem } from '../../types.js';

const REQUEST_TIMEOUT_MS = 10_000;
const NUVEM_FISCAL_URL = 'https://api.nuvemfiscal.com.br';

export async function checkNuvemFiscal(): Promise<ServiceItem> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(NUVEM_FISCAL_URL, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;
    // 2xx = operational; 401 = server up but auth required
    if (res.status >= 200 && res.status < 300) {
      return {
        id: 'nuvem-fiscal',
        name: 'Nuvem Fiscal',
        status: 'operational',
        description: 'Servidor respondendo',
        statusCode: res.status,
        responseTimeMs,
      };
    }
    if (res.status === 401) {
      return {
        id: 'nuvem-fiscal',
        name: 'Nuvem Fiscal',
        status: 'operational',
        description: 'Servidor no ar (autenticação exigida)',
        statusCode: res.status,
        responseTimeMs,
      };
    }
    return {
      id: 'nuvem-fiscal',
      name: 'Nuvem Fiscal',
      status: res.status >= 500 ? 'outage' : 'degraded',
      description: `HTTP ${res.status}`,
      statusCode: res.status,
      responseTimeMs,
    };
  } catch (err) {
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;
    const message = err instanceof Error ? err.message : 'Request failed';
    return {
      id: 'nuvem-fiscal',
      name: 'Nuvem Fiscal',
      status: 'unknown',
      description: message,
      responseTimeMs,
    };
  }
}
