<script setup lang="ts">
import type { ChartConfig } from '@/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChartContainer } from '@/components/ui/chart'
import { VisAxis, VisLine, VisXYContainer } from '@unovis/vue'
import type { ServiceItem } from '@/types'
import type { ResponseTimePoint } from '@/types'
import { getStatusSummary, STATUS_COLORS } from '@/lib/statusSummary'
import { computed } from 'vue'

const props = defineProps<{
  service: ServiceItem
  history: ResponseTimePoint[]
}>()

const statusVariant = computed(() => {
  switch (props.service.status) {
    case 'operational':
      return 'default'
    case 'degraded':
      return 'secondary'
    case 'outage':
      return 'destructive'
    default:
      return 'outline'
  }
})

const statusSummary = computed(() =>
  getStatusSummary(
    props.service.status,
    props.service.statusCode,
    props.service.description
  )
)

const statusColorClass = computed(
  () => STATUS_COLORS[props.service.status]
)

const chartConfig = {
  responseTimeMs: {
    label: 'Tempo (ms)',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

const chartData = computed(() =>
  [...props.history]
    .map((p) => ({
      time: new Date(p.time).getTime(),
      responseTimeMs: p.responseTimeMs,
    }))
    .sort((a, b) => a.time - b.time)
)

type ChartDatum = (typeof chartData.value)[number]
</script>

<template>
  <Card
    :class="[
      'border-l-4 transition-all h-full min-h-0 flex flex-col overflow-hidden gap-0 py-2',
      statusColorClass,
    ]"
  >
    <CardHeader class="flex flex-row items-center justify-between space-y-0 py-1.5 px-4 flex-shrink-0">
      <CardTitle class="text-sm font-medium truncate">{{ service.name }}</CardTitle>
      <Badge :variant="statusVariant" class="flex-shrink-0 text-[10px]">{{ service.status }}</Badge>
    </CardHeader>
    <CardContent class="flex-1 flex flex-col min-h-0 py-2 px-4 gap-1">
      <p
        class="text-muted-foreground text-[10px] sm:text-xs rounded px-1.5 py-1 bg-muted/50 truncate flex-shrink-0"
        :title="service.description"
      >
        {{ statusSummary }}
      </p>
      <div v-if="chartData.length" class="flex-1 min-h-0 w-full">
        <ChartContainer :config="chartConfig" class="h-full w-full min-h-0">
          <VisXYContainer :data="chartData">
            <VisLine
              :x="(d: ChartDatum) => d.time"
              :y="(d: ChartDatum) => d.responseTimeMs"
              :color="chartConfig.responseTimeMs.color"
            />
            <VisAxis
              type="x"
              :x="(d: ChartDatum) => d.time"
              tick-line="false"
              domain-line="false"
              grid-line="false"
              :tick-format="() => ''"
            />
            <VisAxis
              type="y"
              :y="(d: ChartDatum) => d.responseTimeMs"
              tick-line="false"
              domain-line="false"
              grid-line="true"
              :tick-format="(d: number) => `${d} ms`"
            />
          </VisXYContainer>
        </ChartContainer>
      </div>
      <p v-else class="text-muted-foreground text-xs flex-shrink-0">Aguardando dados...</p>
    </CardContent>
  </Card>
</template>
