import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { getAppVersion, AppVersionResponse } from '../api/updates';

export interface UpdateInfo extends AppVersionResponse {
  currentVersion: string;
  isForced: boolean;
}

const isNewer = (remote: string, local: string) => {
  const r = remote.split('.').map(Number);
  const l = local.split('.').map(Number);
  for (let i = 0; i < Math.max(r.length, l.length); i++) {
    const a = r[i] || 0;
    const b = l[i] || 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
};

export function useUpdateCheck() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const platform = Platform.OS as 'ios' | 'android';
        console.log('[UpdateCheck] platform:', platform);

        const data = await getAppVersion(platform);
        console.log('[UpdateCheck] server response:', data);

        const currentVersion = DeviceInfo.getVersion();
        console.log('[UpdateCheck] currentVersion:', currentVersion);

        if (isNewer(data.latest_version, currentVersion)) {
          console.log('[UpdateCheck] update available!');
          const isForced = isNewer(data.min_supported_version, currentVersion);
          setUpdateInfo({ ...data, currentVersion, isForced });
        } else {
          console.log('[UpdateCheck] no update needed');
        }
      } catch (e) {
        console.log('[UpdateCheck] FAILED:', e);
      }
    };
    check();
  }, []);

  const clearUpdate = () => setUpdateInfo(null);

  return { updateInfo, clearUpdate };
}
