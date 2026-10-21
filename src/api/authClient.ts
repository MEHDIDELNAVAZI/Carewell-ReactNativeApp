import axios from 'axios';
import Config from 'react-native-config';

const authClient = axios.create({
  // baseURL: `${Config.API_BASE_URL}/api`,
  baseURL: 'https://staging.physioeye.de/api',
});

export default authClient;
