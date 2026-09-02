import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadProfileAvatar } from '../../api/profile';
import { resolveMediaUrl } from '../../api/config';
import { Camera, Coins, Trophy, Compass } from 'lucide-react-native';

type Props = {
  name: string;
  role: string;
  ward: string;
  totalPoints: number;
  achievements: number;
  stageLabel: string;
  avatarUri?: string | null;
  onAvatarUpdated?: (newUri: string) => void;
};

export default function ProfileHeroCard({
  name,
  role,
  ward,
  totalPoints,
  achievements,
  stageLabel,
  avatarUri,
  onAvatarUpdated,
}: Props) {
  const { t } = useTranslation();
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // localPreview is already a full device URI (from image picker) — don't resolve it.
  // avatarUri may come from the backend as a relative media path — resolve it to a full URL.
  const displayUri = localPreview ?? resolveMediaUrl(avatarUri) ?? undefined;
  console.log(
    'displayUri =',
    displayUri,
    'localPreview =',
    localPreview,
    'avatarUri =',
    avatarUri,
  );
  const handlePickAvatar = async () => {
    if (uploading) return;

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
      selectionLimit: 1,
    });

    if (result.didCancel) return;

    if (result.errorCode) {
      Alert.alert(
        t('profileHeroCard.uploadErrorTitle'),
        result.errorMessage || t('profileHeroCard.uploadErrorGeneric'),
      );
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    // Show it immediately, optimistic preview
    setLocalPreview(asset.uri);
    setUploading(true);

    try {
      const uploadedUrl = await uploadProfileAvatar({
        uri: asset.uri,
        name: asset.fileName ?? 'avatar.jpg',
        type: asset.type ?? 'image/jpeg',
      });

      onAvatarUpdated?.(uploadedUrl);
    } catch (e) {
      console.error('Avatar upload failed:', e);
      setLocalPreview(null); // revert preview on failure
      Alert.alert(
        t('profileHeroCard.uploadErrorTitle'),
        t('profileHeroCard.uploadErrorGeneric'),
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#173b4a', '#2d6a4f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* Avatar with glow ring — tappable */}
      <TouchableOpacity
        style={styles.avatarGlow}
        activeOpacity={0.8}
        onPress={handlePickAvatar}
        disabled={uploading}
      >
        <View style={styles.avatarRing}>
          {displayUri ? (
            <Image source={{ uri: displayUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}

          {uploading && (
            <View style={styles.avatarOverlay}>
              <ActivityIndicator color="#ffffff" size="small" />
            </View>
          )}
        </View>

        {/* Camera badge with Lucide icon */}
        {!uploading && (
          <View style={styles.cameraBadge}>
            <Camera size={16} color="#ffffff" strokeWidth={2.5} />
          </View>
        )}
      </TouchableOpacity>

      {/* Name + role | shift */}
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.roleLine}>
        {role} <Text style={styles.dot}>|</Text> {ward}
      </Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Stats with Lucide icons */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabelTop}>
            {t('profileHeroCard.totalPoints')}
          </Text>
          <View style={styles.statValueRow}>
            <Coins size={18} color="#f4a261" strokeWidth={2} />
            <Text style={styles.statValue}>{totalPoints.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <Text style={styles.statLabelTop}>
            {t('profileHeroCard.achievements')}
          </Text>
          <View style={styles.statValueRow}>
            <Trophy size={18} color="#f4a261" strokeWidth={2} />
            <Text style={styles.statValue}>{achievements}</Text>
          </View>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.stat}>
          <Text style={styles.statLabelTop}>
            {t('profileHeroCard.currentStage')}
          </Text>
          <View style={styles.statValueRow}>
            <Compass size={18} color="#f4a261" strokeWidth={2} />
            <Text style={[styles.statValue, styles.stageValue]}>
              {stageLabel}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const RING_SIZE = 100;
const AVATAR_SIZE = 88;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginHorizontal: 10,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarGlow: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#7ee8c7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10,
    paddingTop: 15,
  },
  avatarRing: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(126,232,199,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: AVATAR_SIZE / 2,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f4a261',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#173b4a',
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  roleLine: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: 18,
  },
  dot: {
    color: 'rgba(255,255,255,0.4)',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabelTop: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 20,
    fontSize: 30,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f4a261',
  },
  stageValue: {
    fontSize: 15,
  },
  statDivider: {
    width: 1,
    height: 38,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 2,
  },
});
