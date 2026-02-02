export type ServiceStatus = 'operational' | 'degraded' | 'outage' | 'unknown';

export interface ServiceItem {
  id: string;
  name: string;
  status: ServiceStatus;
  description?: string;
  responseTimeMs?: number;
  /** HTTP status code quando disponível (ex.: 200, 422, 500) */
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface StatusResponse {
  updatedAt: string;
  services: ServiceItem[];
}

export interface StatuspageSummary {
  status: {
    indicator: 'none' | 'minor' | 'major' | 'critical';
    description: string;
  };
  incidents?: unknown[];
  components?: unknown[];
}
