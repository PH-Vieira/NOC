<script setup lang="ts">
import type { ServiceItem } from '../types';

defineProps<{
  service: ServiceItem;
}>();

const statusClass: Record<ServiceItem['status'], string> = {
  operational: 'status-operational',
  degraded: 'status-degraded',
  outage: 'status-outage',
  unknown: 'status-unknown',
};
</script>

<template>
  <article class="card" :class="statusClass[service.status]">
    <div class="card-header">
      <span class="status-dot" :class="statusClass[service.status]" aria-hidden="true" />
      <h2 class="card-title">{{ service.name }}</h2>
    </div>
    <p v-if="service.description" class="card-description">{{ service.description }}</p>
  </article>
</template>

<style scoped>
.card {
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  text-align: left;
  border: 1px solid var(--card-border);
  transition: border-color 0.2s;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-operational .status-dot,
.status-operational.status-dot {
  background-color: #22c55e;
}

.status-degraded .status-dot,
.status-degraded.status-dot {
  background-color: #eab308;
}

.status-outage .status-dot,
.status-outage.status-dot {
  background-color: #ef4444;
}

.status-unknown .status-dot,
.status-unknown.status-dot {
  background-color: #6b7280;
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.card-description {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
}
</style>
