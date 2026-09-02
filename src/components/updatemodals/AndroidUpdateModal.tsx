import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  NativeModules,
} from 'react-native';
import RNFS from 'react-native-fs';
import { UpdateInfo } from '../../hooks/useUpdateCheck';

const { ApkInstaller } = NativeModules;

interface Props {
  updateInfo: UpdateInfo;
  onClose: () => void;
}

export default function AndroidUpdateModal({ updateInfo, onClose }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpdate = async () => {
    if (!updateInfo.apk_url) {
      Alert.alert('Error', 'No APK file available for this update.');
      return;
    }

    console.log('Downloading from URL:', updateInfo.apk_url);

    setDownloading(true);

    setDownloading(true);
    setProgress(0);

    const localFile = `${RNFS.CachesDirectoryPath}/update.apk`;

    try {
      const download = RNFS.downloadFile({
        fromUrl: updateInfo.apk_url,
        toFile: localFile,
        progressDivider: 5,
        progress: res => {
          setProgress(res.bytesWritten / res.contentLength);
        },
      });

      const result = await download.promise;

      if (result.statusCode === 200) {
        await ApkInstaller.installApk(localFile);
      } else {
        throw new Error(`Download failed with status ${result.statusCode}`);
      }
    } catch (e) {
      console.log('APK download/install error', e);
      Alert.alert('Update failed', 'Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.version}>
            Version {updateInfo.latest_version} is now available
          </Text>
          {!!updateInfo.release_notes && (
            <Text style={styles.notes}>{updateInfo.release_notes}</Text>
          )}

          {downloading ? (
            <View style={styles.progressWrap}>
              <ActivityIndicator size="small" color="#3ddc84" />
              <Text style={styles.progressText}>
                {Math.round(progress * 100)}%
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
            >
              <Text style={styles.updateButtonText}>Download & Install</Text>
            </TouchableOpacity>
          )}

          {!updateInfo.isForced && !downloading && (
            <TouchableOpacity onPress={onClose} style={styles.laterButton}>
              <Text style={styles.laterText}>Later</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  version: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    textAlign: 'center',
  },
  notes: { fontSize: 13, color: '#777', marginBottom: 20, textAlign: 'center' },
  updateButton: {
    backgroundColor: '#3ddc84',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  updateButtonText: { color: '#0a2e1a', fontWeight: '700', fontSize: 15 },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressText: { fontSize: 14, color: '#333' },
  laterButton: { marginTop: 14 },
  laterText: { color: '#999', fontSize: 14 },
});
