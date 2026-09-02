import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import {
  House,
  Heart,
  Activity,
  Bookmark,
  Users,
  User,
} from 'lucide-react-native';

// Screens
import HomeScreen from '../screens/Home/HomeScreen';
import HealthScreen from '../screens/Health/HealthScreen';
import ProgramsScreen from '../screens/Programs/ProgramsScreen';
import LearnScreen from '../screens/Learn/LearnScreen';
import CommunityScreen from '../screens/Community/CommunityScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const ACTIVE_COLOR = '#2d6a4f';
const INACTIVE_COLOR = '#9ca3af';

const tabs = [
  { name: 'HomeTab', Icon: House, screen: HomeScreen },
  { name: 'Health', Icon: Heart, screen: HealthScreen },
  { name: 'Programs', Icon: Activity, screen: ProgramsScreen },
  { name: 'Learn', Icon: Bookmark, screen: LearnScreen },
  { name: 'Community', Icon: Users, screen: CommunityScreen },
  { name: 'Profile', Icon: User, screen: ProfileScreen },
];

export default function AppNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const tab = tabs.find(t => t.name === route.name);
          const IconComponent = tab?.Icon;

          return {
            headerShown: false,
            tabBarShowLabel: false, // we render our own label inside the icon slot
            tabBarStyle: [
              styles.tabBar,
              {
                height: 60 + insets.bottom,
                paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
              },
            ],
            tabBarItemStyle: styles.tabItem,
            tabBarIcon: ({ focused }) => {
              const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;
              return (
                <View style={styles.iconBlock}>
                  {IconComponent && (
                    <IconComponent
                      size={22}
                      color={color}
                      strokeWidth={focused ? 2.2 : 1.8}
                    />
                  )}
                </View>
              );
            },
            tabBarLabel: ({ focused }) => {
              return (
                <Text
                  style={[
                    styles.label,
                    { color: focused ? ACTIVE_COLOR : INACTIVE_COLOR },
                  ]}
                >
                  {route.name}
                </Text>
              );
            },
          };
        }}
      >
        {tabs.map(tab => (
          <Tab.Screen key={tab.name} name={tab.name} component={tab.screen} />
        ))}
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 6,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 30,
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
