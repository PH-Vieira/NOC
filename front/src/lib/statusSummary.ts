import type { ServiceStatus } from '@/types'

/** Resumo curto do significado de códigos HTTP comuns */
const HTTP_SUMMARY: Record<number, string> = {
  200: 'OK — Requisição bem-sucedida',
  201: 'Created — Recurso criado',
  204: 'No Content — Sem conteúdo',
  400: 'Bad Request — Requisição inválida',
  401: 'Unauthorized — Não autorizado',
  403: 'Forbidden — Acesso negado',
  404: 'Not Found — Não encontrado',
  422: 'Unprocessable Entity — Dados não processáveis',
  429: 'Too Many Requests — Muitas requisições',
  500: 'Internal Server Error — Erro interno do servidor',
  502: 'Bad Gateway — Gateway inválido',
  503: 'Service Unavailable — Serviço indisponível',
  504: 'Gateway Timeout — Tempo esgotado no gateway',
}

/** Resumo curto do status do serviço (operational, degraded, etc.) */
const STATUS_SUMMARY: Record<ServiceStatus, string> = {
  operational: 'Sistemas operacionais',
  degraded: 'Degradação parcial',
  outage: 'Indisponível',
  unknown: 'Status desconhecido',
}

/**
 * Retorna um resumo legível do status atual (código HTTP e/ou status do serviço).
 */
export function getStatusSummary(
  status: ServiceStatus,
  statusCode?: number,
  description?: string
): string {
  if (statusCode != null && HTTP_SUMMARY[statusCode]) {
    return HTTP_SUMMARY[statusCode]
  }
  if (statusCode != null) {
    return `${statusCode} — Código HTTP`
  }
  if (description && description.startsWith('HTTP ')) {
    const code = Number(description.replace(/^HTTP\s+/, ''))
    if (!Number.isNaN(code) && HTTP_SUMMARY[code]) return HTTP_SUMMARY[code]
    if (!Number.isNaN(code)) return `${code} — Código HTTP`
  }
  return STATUS_SUMMARY[status]
}

/** Cor CSS (border/background) por status para indicadores visuais */
export const STATUS_COLORS = {
  operational: 'border-l-green-500 bg-green-500/5',
  degraded: 'border-l-amber-500 bg-amber-500/5',
  outage: 'border-l-red-500 bg-red-500/5',
  unknown: 'border-l-zinc-400 bg-zinc-500/5',
} as const
