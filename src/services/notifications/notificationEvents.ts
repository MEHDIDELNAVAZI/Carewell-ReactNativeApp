import notifee, { EventType } from '@notifee/react-native';
import { navigationRef } from '../../navigation/navigationRef';

export function registerForegroundHandler() {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      handlePress(detail.notification?.id);
    }
  });
}

export async function registerBackgroundHandler() {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
      handlePress(detail.notification?.id);
    }
  });
}

function handlePress(id?: string) {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate('Home' as never);
}
