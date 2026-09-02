// api/authClient.ts
import axios from 'axios';

const authClient = axios.create({
  // baseURL: 'http://192.168.0.144:8000/api',
  baseURL: 'https://api.physioeye.de/api',
});

export default authClient;
