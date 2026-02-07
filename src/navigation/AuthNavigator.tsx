import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackParamList} from './types';
import {
  WelcomeScreen,
  SignUpScreen,
  SignInScreen,
  ConsentScreen,
  TermsOfServiceScreen,
  PrivacyPolicyScreen,
} from '../screens/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Consent" component={ConsentScreen} />
      <Stack.Screen
        name="TermsOfService"
        component={TermsOfServiceScreen}
        options={{presentation: 'modal'}}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{presentation: 'modal'}}
      />
    </Stack.Navigator>
  );
};
