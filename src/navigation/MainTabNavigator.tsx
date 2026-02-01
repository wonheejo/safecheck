import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, StyleSheet} from 'react-native';
import {MainTabParamList} from './types';
import {
  HomeScreen,
  ContactsScreen,
  AlertHistoryScreen,
  SettingsScreen,
} from '../screens/main';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({name, focused}: {name: string; focused: boolean}) => {
  const icons: Record<string, string> = {
    Home: 'o',
    Contacts: '@',
    History: '#',
    Settings: '*',
  };

  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {icons[name]}
    </Text>
  );
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused}) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{tabBarLabel: 'Contacts'}}
      />
      <Tab.Screen
        name="History"
        component={AlertHistoryScreen}
        options={{tabBarLabel: 'History'}}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{tabBarLabel: 'Settings'}}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    paddingBottom: 8,
    height: 64,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  icon: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  iconFocused: {
    color: '#3B82F6',
  },
});
