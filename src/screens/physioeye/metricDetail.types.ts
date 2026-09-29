import { ReactNode } from 'react';

export type MetricIcon = ReactNode;

export interface SubMetric {
  title: string;
  score: number | null;
  icon: MetricIcon;
}

export interface MetricVisualConfig {
  title: string;
  subtitle: string;
  icon: MetricIcon;
  metrics: {
    key: string;
    title: string;
    icon: MetricIcon;
  }[];
}

export interface ProgressItem {
  value: number;
  date: string | null;
  sessionId: number;
}
