import Config from 'react-native-config';

export const API_BASE_URL = `${Config.API_BASE_URL}`;
export const MEDIA_BASE_URL = `${API_BASE_URL}/media/`;

console.log('MEDIA_BASE_URL', MEDIA_BASE_URL);
export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${MEDIA_BASE_URL}${path}`;
}
