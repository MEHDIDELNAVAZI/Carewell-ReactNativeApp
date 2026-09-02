export const API_BASE_URL = 'https://api.physioeye.de/';
export const MEDIA_BASE_URL = `${API_BASE_URL}/media/`;

export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return `${MEDIA_BASE_URL}${path}`;
}
