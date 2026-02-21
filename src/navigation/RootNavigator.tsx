import React from 'react';
import {ActivityIndicator, View, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from './types';
import {AuthNavigator} from './AuthNavigator';
import {OnboardingNavigator} from './OnboardingNavigator';
import {MainTabNavigator} from './MainTabNavigator';
import {PaywallScreen} from '../screens/PaywallScreen';
import {useAuth} from '../hooks/useAuth';
import {useSubscription} from '../hooks/useSubscription';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Users created before this date get permanent free access (grandfathered)
const SUBSCRIPTION_CUTOFF_DATE = '2026-02-28T00:00:00Z';

export const RootNavigator: React.FC = () => {
  const {isAuthenticated, initialized, userProfile, loading} = useAuth();
  const {isSubscribed, isLoading: subscriptionLoading} = useSubscription();

  if (!initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Show loading while checking subscription for authenticated users
  if (isAuthenticated && subscriptionLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  // Grandfathered users: created before the subscription cutoff date
  const isGrandfathered =
    userProfile?.created_at &&
    new Date(userProfile.created_at) < new Date(SUBSCRIPTION_CUTOFF_DATE);

  const hasAccess = isSubscribed || isGrandfathered;

  // Check if user needs onboarding (no profile or monitoring not enabled yet)
  const needsOnboarding = isAuthenticated && hasAccess && (!userProfile || !userProfile.monitoring_enabled);

  // Needs paywall: authenticated but no access
  const needsPaywall = isAuthenticated && !hasAccess;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : needsPaywall ? (
          <Stack.Screen name="Paywall" component={PaywallScreen} />
        ) : needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
