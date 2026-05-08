import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

interface KpiCard {
  readonly label: string;
  readonly value: string;
  readonly trend: string;
  readonly trendTone: 'up-bad' | 'down-good' | 'up-warn' | 'up-danger';
  readonly icon: string;
}

interface BarDatum {
  readonly day: string;
  readonly value: number;
}

interface LegendItem {
  readonly label: string;
  readonly value: string;
  readonly color: string;
}

type Severity = 'critical' | 'warning' | 'info';
type AlertStatus = 'active' | 'pending' | 'resolved';

interface AlertRow {
  readonly title: string;
  readonly severity: Severity;
  readonly source: string;
  readonly time: string;
  readonly status: AlertStatus;
  readonly dotColor: string;
}

interface StatusCard {
  readonly title: string;
  readonly statusLabel: string;
  readonly statusTone: 'ok' | 'warn' | 'danger';
  readonly percent: number;
  readonly metaLabel: string;
  readonly metaValue: string;
}

@Component({
  selector: 'app-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './demo.html',
  styleUrl: './demo.css',
})
export class DemoComponent {
  protected readonly tabs = ['Overview', 'Alerts', 'Performance', 'Network'] as const;
  protected readonly activeTab = signal<(typeof this.tabs)[number]>('Overview');

  protected setTab(tab: (typeof this.tabs)[number]): void {
    this.activeTab.set(tab);
  }

  protected readonly kpis: readonly KpiCard[] = [
    { label: 'CPU Usage', value: '78%', trend: '↑ 3.2% from last hour', trendTone: 'up-warn', icon: 'CPU' },
    { label: 'Memory Usage', value: '64%', trend: '↓ 1.8% from last hour', trendTone: 'down-good', icon: 'MEM' },
    { label: 'Network I/O', value: '2.4 GB/s', trend: '↑ 0.6 GB/s from last hour', trendTone: 'up-warn', icon: 'NET' },
    { label: 'Active Alerts', value: '12', trend: '↑ 4 new alerts', trendTone: 'up-danger', icon: 'AL' },
  ];

  protected readonly bars: readonly BarDatum[] = [
    { day: 'Mon', value: 45 },
    { day: 'Tue', value: 62 },
    { day: 'Wed', value: 38 },
    { day: 'Thu', value: 78 },
    { day: 'Fri', value: 55 },
    { day: 'Sat', value: 42 },
    { day: 'Sun', value: 68 },
  ];

  protected readonly maxBar = computed(() =>
    this.bars.reduce((max, b) => (b.value > max ? b.value : max), 0),
  );

  protected barHeight(value: number): string {
    const pct = (value / this.maxBar()) * 100;
    return `${pct}%`;
  }

  protected readonly legend: readonly LegendItem[] = [
    { label: 'Compute', value: '45%', color: '#E53E3E' },
    { label: 'Storage', value: '28%', color: '#FC8181' },
    { label: 'Network', value: '17%', color: '#C53030' },
    { label: 'Idle', value: '10%', color: '#2D2D2D' },
  ];

  protected readonly alerts: readonly AlertRow[] = [
    {
      title: 'CPU Spike Detected',
      severity: 'critical',
      source: 'prod-server-01.us-east',
      time: '2 minutes ago',
      status: 'active',
      dotColor: '#E53E3E',
    },
    {
      title: 'Memory Threshold',
      severity: 'warning',
      source: 'db-cluster-03.eu-west',
      time: '15 minutes ago',
      status: 'pending',
      dotColor: '#ECC94B',
    },
    {
      title: 'Disk Space Low',
      severity: 'info',
      source: 'storage-node-07.ap-south',
      time: '1 hour ago',
      status: 'resolved',
      dotColor: '#48BB78',
    },
    {
      title: 'Network Latency',
      severity: 'critical',
      source: 'cdn-edge-12.us-west',
      time: '3 hours ago',
      status: 'active',
      dotColor: '#E53E3E',
    },
  ];

  protected readonly statusCards: readonly StatusCard[] = [
    {
      title: 'API Gateway',
      statusLabel: 'Operational',
      statusTone: 'ok',
      percent: 98,
      metaLabel: 'Uptime',
      metaValue: '99.98%',
    },
    {
      title: 'Database',
      statusLabel: 'Degraded',
      statusTone: 'warn',
      percent: 72,
      metaLabel: 'Latency',
      metaValue: '142ms',
    },
    {
      title: 'Cache Layer',
      statusLabel: 'Operational',
      statusTone: 'ok',
      percent: 91,
      metaLabel: 'Hit Rate',
      metaValue: '94.2%',
    },
    {
      title: 'Message Queue',
      statusLabel: 'Critical',
      statusTone: 'danger',
      percent: 34,
      metaLabel: 'Backlog',
      metaValue: '12.4k',
    },
  ];

  protected statusBarWidth(percent: number): string {
    return `${percent}%`;
  }

  protected statusBarColor(tone: StatusCard['statusTone']): string {
    switch (tone) {
      case 'ok':
        return '#48BB78';
      case 'warn':
        return '#ECC94B';
      case 'danger':
        return '#E53E3E';
    }
  }

  protected severityLabel(severity: Severity): string {
    switch (severity) {
      case 'critical':
        return 'Critical';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
    }
  }

  protected statusLabel(status: AlertStatus): string {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending':
        return 'Pending';
      case 'resolved':
        return 'Resolved';
    }
  }
}
