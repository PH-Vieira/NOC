<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import type { StatusResponse, ResponseTimePoint } from '@/types';
import ServiceChartCard from './ServiceChartCard.vue';
import { Button } from '@/components/ui/button';

const POLL_INTERVAL_MS = 12_000; // 12 segundos (entre 10 e 15)
const MAX_HISTORY = 10;

/** Em produção (Vercel), use VITE_API_URL apontando para o back (Railway). Em dev, proxy usa /api. */
const API_BASE = import.meta.env.VITE_API_URL ?? '';
const API_STATUS_URL = `${API_BASE}/api/status`;

const data = ref<StatusResponse | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const historyByService = ref<Record<string, ResponseTimePoint[]>>({});
let pollTimer: ReturnType<typeof setInterval> | null = null;

function pushHistory(res: StatusResponse) {
  const next = { ...historyByService.value };
  for (const s of res.services) {
    if (s.responseTimeMs == null) continue;
    const arr = next[s.id] ?? [];
    arr.push({ time: res.updatedAt, responseTimeMs: s.responseTimeMs });
    if (arr.length > MAX_HISTORY) arr.shift();
    next[s.id] = arr;
  }
  historyByService.value = next;
}

async function fetchStatus() {
  try {
    error.value = null;
    const res = await fetch(API_STATUS_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: StatusResponse = await res.json();
    data.value = json;
    pushHistory(json);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Falha ao carregar status';
    if (!data.value) data.value = null;
  } finally {
    loading.value = false;
  }
}

function refresh() {
  loading.value = true;
  fetchStatus();
}

onMounted(() => {
  fetchStatus();
  pollTimer = setInterval(() => {
    if (!loading.value) fetchStatus();
  }, POLL_INTERVAL_MS);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
</script>

<template>
  <div class="dashboard flex flex-col flex-1 min-h-0 w-full">
    <header class="dashboard-header flex-shrink-0">
      <div class="header-inner">
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight">NOC — Monitoramento</h1>
        <p class="text-muted-foreground text-xs sm:text-sm mt-0.5">
          Status e tempo de resposta dos serviços
        </p>
      </div>
      <div class="header-actions">
        <span v-if="data?.updatedAt" class="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
          Última: {{ formatDate(data.updatedAt) }}
        </span>
        <Button variant="outline" size="sm" :disabled="loading" @click="refresh">
          {{ loading ? '…' : 'Atualizar' }}
        </Button>
      </div>
    </header>

    <p v-if="error && !data" class="flex-1 flex items-center justify-center text-destructive rounded-lg bg-destructive/10 text-sm p-4">{{ error }}</p>
    <div v-else-if="loading && !data" class="flex-1 flex items-center justify-center text-muted-foreground text-sm">Carregando…</div>
    <section
      v-else-if="data"
      class="grid flex-1 min-h-0 gap-2 sm:gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[minmax(0,1fr)]"
    >
      <ServiceChartCard
        v-for="service in data.services"
        :key="service.id"
        :service="service"
        :history="historyByService[service.id] ?? []"
      />
    </section>

    <p v-if="error && data" class="flex-shrink-0 text-xs text-destructive rounded bg-destructive/10 px-2 py-1 mt-1">{{ error }}</p>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 100%;
}

.dashboard-header {
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid hsl(var(--border));
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5rem;
}

.header-inner {
  flex: 1;
  min-width: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
</style>
