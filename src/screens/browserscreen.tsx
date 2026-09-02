import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import {
  X,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react-native';

type BrowserScreenProps = {
  route: {
    params: {
      url: string;
    };
  };
  navigation: any;
};

export default function BrowserScreen({
  route,
  navigation,
}: BrowserScreenProps) {
  const { url } = route.params;
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(url);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
        >
          <X size={18} color="#111" />
        </TouchableOpacity>

        <View style={styles.urlBar}>
          <Lock size={11} color="#6B7280" />
          <Text style={styles.urlText} numberOfLines={1}>
            {currentUrl.replace(/^https?:\/\//, '')}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => webViewRef.current?.reload()}
          style={styles.iconBtn}
        >
          <RotateCw size={18} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Loading bar */}
      {loading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color="#6366F1" />
        </View>
      )}

      {/* WebView */}
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={{ flex: 1 }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={state => {
          setCanGoBack(state.canGoBack);
          setCanGoForward(state.canGoForward);
          setCurrentUrl(state.url);
        }}
      />

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={() => webViewRef.current?.goBack()}
          disabled={!canGoBack}
          style={styles.navBtn}
        >
          <ChevronLeft size={24} color={canGoBack ? '#111' : '#D1D5DB'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => webViewRef.current?.goForward()}
          disabled={!canGoForward}
          style={styles.navBtn}
        >
          <ChevronRight size={24} color={canGoForward ? '#111' : '#D1D5DB'} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.doneBtn}
        >
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  urlText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
  },

  loadingBar: {
    height: 3,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
    gap: 16,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6366F1',
  },
  doneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
