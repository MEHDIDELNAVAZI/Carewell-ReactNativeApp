import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { User, LogOut } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { logout } from '../../api/auth';
import { resolveMediaUrl } from '../../api/config';
import WellnessScore from './WellnessScore';
import LanguageSwitcher from '../LanguageSwitcher';

interface HeaderProps {
  name: string;
  role: string;
  ward: string;
  avatarUri?: string;
  points: number;
  wellnessScore: number;
  profileImageUri?: string | null;
}

const HEADER_HEIGHT = 210;

export default function Header({
  name,
  avatarUri,
  profileImageUri,
  points,
  wellnessScore,
}: HeaderProps) {
  const { setIsLoggedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const openLogoutModal = () => setLogoutModalVisible(true);

  const closeLogoutModal = () => {
    if (isLoggingOut) return; // don't allow closing mid-logout
    setLogoutModalVisible(false);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsLoggedIn(false);
    } finally {
      setIsLoggingOut(false);
      setLogoutModalVisible(false);
    }
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t('Good Morning')
      : hour < 18
      ? t('Good Afternoon')
      : t('Good Evening');

  const totalHeight = HEADER_HEIGHT + insets.top;

  // profileImageUri comes from the backend as a relative media path — resolve it.
  // avatarUri is kept as a fallback if it's already a full/local URI.
  const displayAvatarUri = resolveMediaUrl(profileImageUri) ?? avatarUri;

  return (
    <View style={{ height: totalHeight, paddingRight: 0, marginRight: 0 }}>
      <Svg
        width="100%"
        height={totalHeight}
        viewBox={`0 0 380 ${totalHeight}`}
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFill}
      >
        <Path
          d={`M0,0 H380 V${
            totalHeight - 50
          } C300,${totalHeight} 80,${totalHeight} 0,${totalHeight - 50} Z`}
          fill="#123C3D"
        />
        <Circle
          cx="40"
          cy={insets.top + 20}
          r="1.6"
          fill="#F0997B"
          opacity={0.8}
        />
        <Circle
          cx="70"
          cy={insets.top + 45}
          r="1.2"
          fill="#F0997B"
          opacity={0.6}
        />
        <Circle
          cx="330"
          cy={insets.top + 25}
          r="1.6"
          fill="#F0997B"
          opacity={0.8}
        />
        <Circle
          cx="300"
          cy={insets.top + 60}
          r="1.2"
          fill="#F0997B"
          opacity={0.5}
        />
        <Circle
          cx="350"
          cy={insets.top + 60}
          r="1.4"
          fill="#F0997B"
          opacity={0.7}
        />
        <Circle
          cx="20"
          cy={insets.top + 80}
          r="1.2"
          fill="#F0997B"
          opacity={0.5}
        />
      </Svg>

      <View style={[styles.content, { paddingTop: insets.top }]}>
        <View style={styles.topRow}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              {displayAvatarUri ? (
                <Image
                  source={{ uri: displayAvatarUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <User size={22} color="rgba(255,255,255,0.6)" />
              )}
            </View>
            <View style={{ flexShrink: 1 }}>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <LanguageSwitcher />
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={openLogoutModal}
              activeOpacity={0.75}
            >
              <LogOut size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <WellnessScore
            score={wellnessScore}
            status="Moderate Fatigue"
            points={points}
            date={new Date().toLocaleDateString(
              i18n.language === 'de' ? 'de-DE' : 'en-GB',
              {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              },
            )}
          />
        </View>
      </View>

      {/* Logout confirmation modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeLogoutModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {isLoggingOut ? (
              <>
                <ActivityIndicator size="large" color="#123C3D" />
                <Text style={styles.modalTitle}>{t('Logging out...')}</Text>
              </>
            ) : (
              <>
                <View style={styles.modalIconWrap}>
                  <LogOut size={26} color="#123C3D" />
                </View>
                <Text style={styles.modalTitle}>{t('Log Out')}</Text>
                <Text style={styles.modalMessage}>
                  {t('Are you sure you want to log out?')}
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnCancel]}
                    onPress={closeLogoutModal}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalBtnCancelText}>{t('Cancel')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalBtnConfirm]}
                    onPress={handleConfirmLogout}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalBtnConfirmText}>
                      {t('Log Out')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  name: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 2 },
  subline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 10,
    marginLeft: 58,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(18,60,61,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#123C3D',
    marginTop: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 13.5,
    color: '#555',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F1F1F1',
  },
  modalBtnCancelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  modalBtnConfirm: {
    backgroundColor: '#123C3D',
  },
  modalBtnConfirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
