import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { UpdateInfo } from '../../hooks/useUpdateCheck';

const TESTFLIGHT_URL = 'https://testflight.apple.com/join/GAd4btGw';

interface Props {
  updateInfo: UpdateInfo;
  onClose: () => void;
}

export default function IosUpdateModal({ updateInfo, onClose }: Props) {
  console.log('Update info:', updateInfo); // Debugging line
  const handleUpdate = () => {
    Linking.openURL(TESTFLIGHT_URL);
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

          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateButtonText}>Update on TestFlight</Text>
          </TouchableOpacity>

          {!updateInfo.isForced && (
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
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  updateButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  laterButton: { marginTop: 14 },
  laterText: { color: '#999', fontSize: 14 },
});
