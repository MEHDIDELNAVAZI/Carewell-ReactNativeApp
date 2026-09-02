// This file is just for TypeScript — Metro uses .ios.ts and .android.ts at runtime
export {
  registerBackgroundSync,
  runHealthSync,
  sendHealthDataToDjango,
} from './healthSyncService.ios';
export const HeadlessHealthSyncTask: (event: {
  taskId: string;
}) => Promise<void> = async () => {
  console.log('[HEADLESS_TEST] ⚠️ STUB FILE RAN — Metro resolved wrong file!');
};
