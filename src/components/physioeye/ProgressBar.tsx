import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

let gradientCounter = 0;

interface Props {
  /** 0–100 */
  value: number;
  /** One colour = solid fill. Two or more = left-to-right gradient across the whole track. */
  colors: string[];
  trackColor: string;
  height?: number;
  /** Round handle at the end of the fill */
  showThumb?: boolean;
  thumbBorderColor?: string;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  value,
  colors,
  trackColor,
  height = 8,
  showThumb = false,
  thumbBorderColor = '#FFFFFF',
  delay = 0,
  duration = 900,
  style,
}: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const progress = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const gradientId = useMemo(() => `progress-gradient-${++gradientCounter}`, []);
  const thumbSize = height + 8;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: clamped / 100,
      duration: reduceMotion ? 0 : duration,
      delay: reduceMotion ? 0 : delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // animating width
    });
    animation.start();
    return () => animation.stop();
  }, [clamped, delay, duration, progress, reduceMotion]);

  const onLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);

  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth],
  });
  const thumbLeft = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(trackWidth - thumbSize, 0)],
  });

  const isGradient = colors.length > 1;

  return (
    <View
      style={[{ height: showThumb ? thumbSize : height, justifyContent: 'center' }, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped) }}
    >
      <View
        onLayout={onLayout}
        style={[
          styles.track,
          { height, borderRadius: height / 2, backgroundColor: trackColor },
        ]}
      >
        <Animated.View
          style={{
            height,
            width: fillWidth,
            borderRadius: height / 2,
            overflow: 'hidden',
            backgroundColor: isGradient ? 'transparent' : colors[0],
          }}
        >
          {isGradient && trackWidth > 0 && (
            <Svg width={trackWidth} height={height}>
              <Defs>
                <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                  {colors.map((c, i) => (
                    <Stop key={i} offset={i / (colors.length - 1)} stopColor={c} />
                  ))}
                </LinearGradient>
              </Defs>
              <Rect width={trackWidth} height={height} fill={`url(#${gradientId})`} />
            </Svg>
          )}
        </Animated.View>
      </View>

      {showThumb && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              borderColor: colors[colors.length - 1],
              left: thumbLeft,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  thumb: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
  },
});
