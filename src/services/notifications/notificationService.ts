import notifee, {
  AndroidImportance,
  TriggerType,
  RepeatFrequency,
  TimestampTrigger,
} from '@notifee/react-native';
import { Platform } from 'react-native';

const CHANNEL_ID = 'wellcare-reminders';

export async function setupNotifications() {
  await notifee.requestPermission();

  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'WellCare Reminders',
      importance: AndroidImportance.HIGH,
    });
  }
}

async function scheduleDaily(
  id: string,
  hour: number,
  minute: number,
  title: string,
  body: string,
) {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() < Date.now()) {
    date.setDate(date.getDate() + 1);
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
  };

  await notifee.createTriggerNotification(
    {
      id,
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default' },
      },
      ios: {
        sound: 'default',
      },
    },
    trigger,
  );
}

export async function scheduleWellCareReminders() {
  // Morning - 08:00
  await scheduleDaily(
    'morning',
    8,
    0,
    '🌞 Dein zukünftiges Ich hat dir geschrieben',
    'Deine heutige Mission wartet schon auf dich. Es dauert nur wenige Minuten – aber dein zukünftiges Ich wird es dir danken.',
  );

  //  Mid-Morning - 11:00
  await scheduleDaily(
    'mid_morning',
    11,
    0,
    '☕️ Zeit für einen kleinen Energie-Boost',
    'Kaffee ist super. Ein gesunder Rücken ist noch besser. Schau kurz in die App und gönn deinem Körper zwei Minuten.',
  );

  //  Afternoon - 14:00
  await scheduleDaily(
    'afternoon',
    14,
    0,
    '💪 Dein Körper hat eine Nachricht für dich',
    '„Ein bisschen Bewegung wäre jetzt perfekt.“ Öffne die App und erledige deine nächste Mini-Challenge.',
  );

  //  Late Afternoon - 17:00
  await scheduleDaily(
    'late_afternoon',
    17,
    0,
    '🚀 Fast geschafft!',
    'Du bist heute schon weit gekommen. Eine letzte kleine Aufgabe wartet noch auf dich.',
  );

  // 🌙 Evening - 20:00
  await scheduleDaily(
    'night',
    20,
    0,
    '🌙 Bevor der Tag zu Ende geht…',
    'Schließe deine heutige Aufgabe und deine kurze Reflexion ab. Morgen beginnt mit den Entscheidungen von heute.',
  );
}

export async function cancelAllReminders() {
  await notifee.cancelAllNotifications();
}
