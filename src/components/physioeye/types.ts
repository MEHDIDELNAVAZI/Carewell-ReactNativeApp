export type MetricKey =
  | 'posture'
  | 'alignment'
  | 'upperBody'
  | 'lowerBody'
  | 'functional'
  | 'walking';

export interface Metric {
  key: MetricKey;
  title: string;
  /** 0–100 */
  score: number;
  /** Points gained (or lost) since the first assessment */
  delta: number;
}

export interface ProgressPoint {
  label: string;
  value: number;
}

export interface PhysioData {
  userName?: string;
  /** Overall movement score, 0–100 */
  score: number;
  /** Optional. If omitted it is derived from the first point of `history`. */
  delta?: number;
  metrics: Metric[];
  history: ProgressPoint[];
}
