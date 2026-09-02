import { NativeModules, Platform } from 'react-native';

const { HealthPermissionModule } = NativeModules;


console.log("MODULE =", HealthPermissionModule);
export async function requestHealthPermissions() {
    if (Platform.OS !== 'android') {
        console.warn('[HealthPermissions] Only supported on Android');
        return [];
    }

    if (!HealthPermissionModule) {
        console.error('[HealthPermissions] Native module not found!');
        return [];
    }

    try {
        // This will now properly wait for the result
        const granted = await HealthPermissionModule.requestPermissions();
        if (granted.length === 0) {
        // User denied all — show a message, don't crash
        console.error('No health permissions granted. Please allow access in Health Connect settings.');
        return;
        }
        console.log('[HealthPermissions] Granted permissions:', granted);
        return granted;
    } catch (e:any) {
        console.error('[HealthPermissions] Error:', e.message);
        return [];
    }
}

export async function checkHealthPermissions() {
    if (Platform.OS !== 'android') return [];
    if (!HealthPermissionModule) return [];

    try {
        const granted = await HealthPermissionModule.checkPermissions();
        return granted;
    } catch (e:any) {
        console.error('[HealthPermissions] Check error:', e.message);
        return [];
    }
}