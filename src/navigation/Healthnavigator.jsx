import * as React from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { useLinkBuilder, useTheme } from '@react-navigation/native';
import { PlatformPressable } from '@react-navigation/elements';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTranslation } from 'react-i18next'; // ✅ ADD THIS
import colors from '../theme/colors';
import VitalSignesScreen from '../screens/Health/VitalSignesScreen';

function Fatigue() {
  const { t } = useTranslation(); // ✅ ADD THIS

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.textPrimary }}>{t('Fatigue Screen')}</Text>{' '}
      {/* ✅ UPDATED */}
    </View>
  );
}

function PhysioEye() {
  const { t } = useTranslation(); // ✅ ADD THIS

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}
    >
      <Text
        style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}
      >
        {t('PhysioEye')} {/* ✅ UPDATED */}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: '#9ca3af',
          textAlign: 'center',
          paddingHorizontal: 40,
        }}
      >
        {t('Nothing here yet — this feature is coming soon!')}{' '}
        {/* ✅ UPDATED */}
      </Text>
    </View>
  );
}

function MyTabBar({ state, descriptors, navigation, position }) {
  const { buildHref } = useLinkBuilder();
  const { t } = useTranslation(); // ✅ ADD THIS

  return (
    <View
      style={{
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 10,
        marginTop: 10,
        backgroundColor: colors.gray150,
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        const inputRange = state.routes.map((_, i) => i);
        const opacity = position.interpolate({
          inputRange,
          outputRange: inputRange.map(i => (i === index ? 1 : 0.5)),
        });

        // ✅ Translate tab labels
        const translatedLabel = t(label);

        return (
          <PlatformPressable
            key={route.key}
            href={buildHref(route.name, route.params)}
            aria-label={options.tabBarAccessibilityLabel}
            aria-selected={isFocused}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              alignItems: 'center',
              backgroundColor: colors.gray150,
              height: 60,
              justifyContent: 'center',
            }}
            android_ripple={{ color: 'transparent' }}
          >
            <Animated.Text
              style={{
                opacity,
                color: isFocused ? '#000000' : '#6b7280',
                backgroundColor: isFocused ? '#ffffff' : 'transparent',
                borderRadius: 10,
                paddingVertical: 14,
                width: '95%',
                fontWeight: isFocused ? '700' : '500',
                textAlign: 'center',
              }}
            >
              {translatedLabel} {/* ✅ UPDATED */}
            </Animated.Text>
          </PlatformPressable>
        );
      })}
    </View>
  );
}

const Tab = createMaterialTopTabNavigator();

export default function HealthNavigator() {
  const { t } = useTranslation(); // ✅ ADD THIS

  return (
    <Tab.Navigator
      style={{ flex: 1 }}
      tabBar={props => <MyTabBar {...props} />}
    >
      <Tab.Screen
        name="Vitals"
        component={VitalSignesScreen}
        options={{ title: t('Vitals') }} // ✅ ADDED
      />
      <Tab.Screen
        name="PhysioEye"
        component={PhysioEye}
        options={{ title: t('PhysioEye') }} // ✅ ADDED
      />
    </Tab.Navigator>
  );
}
