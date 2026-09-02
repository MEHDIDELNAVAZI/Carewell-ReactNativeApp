import AsyncStorage from '@react-native-async-storage/async-storage';
import authClient from './authClient';
import { triggerLogout } from '../context/AuthContext';

export const loginuser = async (username, password, role) => {
  const response = await authClient.post('/users/login/', {
    username,
    password,
    role,
  });
  return response.data;
};

export const registeruser = async data => {
  const response = await authClient.post('/users/register/', data);
  return response.data;
};

export const isLogedIn = async () => {
  const token = await AsyncStorage.getItem('access');
  return !!token;
};

// get token
export const getToken = async () => {
  return await AsyncStorage.getItem('access');
};

export const logout = async () => {
  await AsyncStorage.removeItem('access');
  await AsyncStorage.removeItem('refresh');
  triggerLogout();
};
