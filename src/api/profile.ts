import api from './client';

export async function fetchProfile() {
  const response = await api.get('/core/profile/');
  console.log(response.data);
  return response.data;
}

export async function uploadProfileAvatar(file: {
  uri: string;
  name: string;
  type: string;
}): Promise<string> {
  // TODO: replace with real endpoint, e.g. POST /api/profile/avatar/
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const res = await api.post('/uploads/profile/', formData, {
    // headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.avatar_url; // adjust to your response shape
}
