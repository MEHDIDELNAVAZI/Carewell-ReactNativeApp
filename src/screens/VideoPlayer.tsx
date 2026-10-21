import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation-locker';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  VideoPlayer: {
    uri: string;
    title?: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'VideoPlayer'>;

export default function VideoPlayer({ route, navigation }: Props) {
  const { uri, title } = route.params;

  const [loading, setLoading] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const closePlayer = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      // Start in portrait while the video metadata is loading.
      Orientation.lockToPortrait();

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          closePlayer();
          return true;
        },
      );

      return () => {
        subscription.remove();

        // Restore the app's default orientation when leaving.
        Orientation.lockToPortrait();
      };
    }, [closePlayer]),
  );

  const handleVideoLoad = useCallback(
    (data: {
      naturalSize: {
        width: number;
        height: number;
      };
    }) => {
      const { width, height } = data.naturalSize;

      if (width > 0 && height > 0) {
        if (width > height) {
          // Landscape video: rotate the screen horizontally.
          Orientation.lockToLandscape();
        } else {
          // Portrait or square video: keep the screen vertical.
          Orientation.lockToPortrait();
        }
      }

      setLoading(false);
      setBuffering(false);
      setError(false);
    },
    [],
  );

  const retryPlayback = useCallback(() => {
    setError(false);
    setLoading(true);
    setBuffering(false);

    // Recreate the Video component and inspect its dimensions again.
    Orientation.lockToPortrait();
    setRetryKey(current => current + 1);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {!error && (
        <Video
          key={retryKey}
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
          controls={false}
          paused={false}
          repeat={false}
          playInBackground={false}
          playWhenInactive={false}
          onLoad={handleVideoLoad}
          onBuffer={({ isBuffering }) => {
            setBuffering(isBuffering);
          }}
          onError={videoError => {
            console.error('[VideoPlayer] Playback error:', videoError);
            setLoading(false);
            setBuffering(false);
            setError(true);
          }}
        />
      )}

      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={closePlayer}
          style={styles.iconButton}
          accessibilityRole="button"
          accessibilityLabel="Close video"
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {!!title && (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      {(loading || buffering) && !error && (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#FFFFFF" />

            <Text style={styles.loadingTitle}>
              {loading ? 'Loading video' : 'Buffering video'}
            </Text>

            <Text style={styles.loadingSubtitle}>Please wait a moment</Text>
          </View>
        </View>
      )}

      {error && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorIconText}>!</Text>
          </View>

          <Text style={styles.errorTitle}>Unable to play video</Text>

          <Text style={styles.errorSubtitle}>
            Check your connection and try again.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={retryPlayback}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={closePlayer}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>Go back</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 12,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(35,35,35,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeText: {
    color: '#FFFFFF',
    fontSize: 23,
    lineHeight: 27,
  },

  title: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingCard: {
    minWidth: 170,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
    paddingHorizontal: 28,
    borderRadius: 20,
    backgroundColor: 'rgba(25,25,25,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  loadingTitle: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  loadingSubtitle: {
    marginTop: 7,
    color: '#A7A7A7',
    fontSize: 13,
  },

  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#000000',
  },

  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#555555',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  errorIconText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '500',
  },

  errorTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },

  errorSubtitle: {
    marginTop: 10,
    marginBottom: 24,
    color: '#AAAAAA',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },

  retryButton: {
    minWidth: 150,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },

  retryText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '700',
  },

  backButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  backText: {
    color: '#BBBBBB',
    fontSize: 14,
    fontWeight: '500',
  },
});
