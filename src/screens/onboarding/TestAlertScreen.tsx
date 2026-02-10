import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/types';
import {useAuth} from '../../hooks/useAuth';
import {useContacts} from '../../hooks/useContacts';
import {requestNotificationPermission, registerFcmToken} from '../../services/notifications';

type TestAlertScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'TestAlert'>;
};

export const TestAlertScreen: React.FC<TestAlertScreenProps> = ({navigation}) => {
  const {authUser, userProfile} = useAuth();
  const {contacts} = useContacts(authUser?.id);
  const [notificationGranted, setNotificationGranted] = useState<boolean | null>(null);
  const [registering, setRegistering] = useState(false);

  const handleEnableNotifications = async () => {
    setRegistering(true);
    try {
      const granted = await requestNotificationPermission();
      setNotificationGranted(granted);

      if (granted && authUser?.id) {
        await registerFcmToken(authUser.id);
      }

      if (!granted) {
        Alert.alert(
          'Notifications Required',
          'JustInCase needs notifications to remind you to check in and warn you before alerting your contacts. Please enable notifications in Settings.',
        );
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleComplete = () => {
    if (notificationGranted === false) {
      Alert.alert(
        'Notifications Disabled',
        'Without notifications, you may miss important reminders and warnings. Are you sure you want to continue?',
        [
          {text: 'Enable Notifications', onPress: handleEnableNotifications},
          {text: 'Continue Anyway', style: 'destructive', onPress: finishOnboarding},
        ],
      );
      return;
    }
    finishOnboarding();
  };

  const finishOnboarding = () => {
    // Navigation will be handled by the root navigator checking onboarding status
    // For now, we'll just show a success message
    Alert.alert(
      'Setup Complete!',
      'JustInCase is now monitoring your activity. Remember to check in regularly!',
      [{text: 'OK'}],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{'<'} Back</Text>
          </TouchableOpacity>
          <Text style={styles.step}>Step 3 of 3</Text>
          <Text style={styles.title}>Almost Done!</Text>
          <Text style={styles.subtitle}>
            Let's make sure everything is set up correctly.
          </Text>
        </View>

        <View style={styles.checklistSection}>
          <View style={styles.checkItem}>
            <View
              style={[
                styles.checkCircle,
                contacts.length > 0 && styles.checkCircleComplete,
              ]}>
              {contacts.length > 0 && <Text style={styles.checkMark}>v</Text>}
            </View>
            <View style={styles.checkContent}>
              <Text style={styles.checkTitle}>Trusted Contacts</Text>
              <Text style={styles.checkDescription}>
                {contacts.length > 0
                  ? `${contacts.length} contact${contacts.length > 1 ? 's' : ''} added`
                  : 'No contacts added'}
              </Text>
            </View>
          </View>

          <View style={styles.checkItem}>
            <View
              style={[
                styles.checkCircle,
                userProfile?.monitoring_enabled && styles.checkCircleComplete,
              ]}>
              {userProfile?.monitoring_enabled && (
                <Text style={styles.checkMark}>v</Text>
              )}
            </View>
            <View style={styles.checkContent}>
              <Text style={styles.checkTitle}>Alert Settings</Text>
              <Text style={styles.checkDescription}>
                {userProfile?.inactivity_threshold_hours}h threshold,{' '}
                {userProfile?.grace_period_hours}h grace period
              </Text>
            </View>
          </View>

          <View style={styles.checkItem}>
            <View
              style={[
                styles.checkCircle,
                notificationGranted && styles.checkCircleComplete,
              ]}>
              {notificationGranted && <Text style={styles.checkMark}>v</Text>}
            </View>
            <View style={styles.checkContent}>
              <Text style={styles.checkTitle}>Push Notifications</Text>
              <Text style={styles.checkDescription}>
                {notificationGranted === null
                  ? 'Not configured yet'
                  : notificationGranted
                  ? 'Enabled'
                  : 'Disabled'}
              </Text>
            </View>
            {notificationGranted !== true && (
              <TouchableOpacity
                style={styles.enableButton}
                onPress={handleEnableNotifications}
                disabled={registering}>
                <Text style={styles.enableButtonText}>
                  {registering ? 'Enabling...' : 'Enable'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <Text style={styles.infoText}>
            1. You'll receive reminder notifications to check in{'\n'}
            2. If you miss check-ins past your threshold, we send a warning{'\n'}
            3. If you don't respond to the warning, your contacts get an SMS
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}>
            <Text style={styles.completeButtonText}>Start Using JustInCase</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  step: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  checklistSection: {
    gap: 16,
    marginBottom: 32,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkCircleComplete: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkContent: {
    flex: 1,
  },
  checkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  checkDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  enableButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  enableButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 22,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  completeButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
