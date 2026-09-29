import { PhysioData } from '../components/physioeye/types';

export const mockPhysioData: PhysioData = {
  userName: 'Elke Ziaja',
  score: 78,
  metrics: [
    { key: 'posture', title: 'Posture', score: 82, delta: 6 },
    { key: 'alignment', title: 'Alignment', score: 71, delta: 4 },
    { key: 'upperBody', title: 'Upper-Body ', score: 84, delta: 5 },
    { key: 'lowerBody', title: 'Lower-Body ', score: 68, delta: 11 },
    { key: 'functional', title: 'Functional', score: 79, delta: 8 },
    { key: 'walking', title: 'Walking', score: 87, delta: 3 },
  ],
  history: [
    { label: 'First assessment', value: 61 },
    { label: 'Week 2', value: 63 },
    { label: 'Week 3', value: 64 },
    { label: 'Week 4', value: 66 },
    { label: 'Week 5', value: 69 },
    { label: 'Week 6', value: 71 },
    { label: 'Week 7', value: 74 },
    { label: 'Today', value: 78 },
  ],
};
