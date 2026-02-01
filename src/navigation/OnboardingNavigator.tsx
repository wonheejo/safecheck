import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from './types';
import {
  AddContactsScreen,
  SetThresholdScreen,
  TestAlertScreen,
} from '../screens/onboarding';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="AddContacts" component={AddContactsScreen} />
      <Stack.Screen name="SetThreshold" component={SetThresholdScreen} />
      <Stack.Screen name="TestAlert" component={TestAlertScreen} />
    </Stack.Navigator>
  );
};
