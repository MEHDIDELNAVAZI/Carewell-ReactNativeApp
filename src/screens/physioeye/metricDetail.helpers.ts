import { MetricKey } from '../../components/physioeye/types';
import { PhysioMetricResponse } from '../../api/physioeye.api';

export function getScoreStatus(score: number | null) {
  if (score === null) {
    return 'No data';
  }

  if (score >= 85) {
    return 'Excellent';
  }

  if (score >= 70) {
    return 'Strong';
  }

  if (score >= 55) {
    return 'Moderate';
  }

  return 'Needs attention';
}

export function getMetricData(
  metric: MetricKey,
  response: PhysioMetricResponse,
) {
  switch (metric) {
    case 'posture':
      if ('posture' in response) {
        return response.posture;
      }
      return null;

    case 'alignment':
      if ('alignment' in response) {
        return response.alignment;
      }
      return null;

    case 'upperBody':
      if ('upper_body' in response) {
        return response.upper_body;
      }
      return null;

    case 'lowerBody':
      if ('lower_body' in response) {
        return response.lower_body;
      }
      return null;

    case 'functional':
      if ('functional_movement' in response) {
        return response.functional_movement;
      }
      return null;

    case 'walking':
      if ('walking' in response) {
        return response.walking;
      }
      return null;

    default:
      return null;
  }
}

export function getApiMetric(metric: MetricKey) {
  switch (metric) {
    case 'posture':
      return 'posture';

    case 'alignment':
      return 'alignment';

    case 'upperBody':
      return 'upper_body';

    case 'lowerBody':
      return 'lower_body';

    case 'functional':
      return 'functional_movement';

    case 'walking':
      return 'walking';

    default:
      return null;
  }
}

export function formatProgressDate(date: string | null) {
  if (!date) {
    return {
      date: 'Unknown',
      time: '',
    };
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      date: 'Unknown',
      time: '',
    };
  }

  const dateLabel = parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const timeLabel = parsedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return {
    date: dateLabel,
    time: timeLabel,
  };
}
