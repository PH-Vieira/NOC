export type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'unknown';

export interface ServiceItem {
  id: string;
  name: string;
  status: ServiceStatus;
  description?: string;
  responseTimeMs?: number;
  /** Código HTTP quando disponível (ex.: 200, 422, 500) */
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface ResponseTimePoint {
  time: string;
  responseTimeMs: number;
}

export interface StatusResponse {
  updatedAt: string;
  services: ServiceItem[];
}
