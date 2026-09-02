import api from './client'; 

export type Platform = 'ios' | 'android';

export interface AppVersionResponse {
  platform: Platform;
  latest_version: string;
  min_supported_version: string;
  force_update: boolean;
  apk_url: string | null;
  release_notes: string;
  updated_at: string;
}

export const getAppVersion = async (platform: Platform): Promise<AppVersionResponse> => {
  const { data } = await api.get('/updates/app-version/', {
    params: { platform },
  });
  return data;
};