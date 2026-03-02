import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/types';
import {useAuth} from '../../hooks/useAuth';
import {useContacts} from '../../hooks/useContacts';
import {requestNotificationPermission, registerFcmToken} from '../../services/notifications';

type TestAlertScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'TestAlert'>;
};

export const TestAlertScreen: React.FC<TestAlertScreenProps> = ({navigation}) => {
  const {t} = useTranslation();
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
          t('onboarding.notificationsRequired'),
          t('onboarding.notificationsRequiredDesc'),
        );
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleComplete = () => {
    if (notificationGranted === false) {
      Alert.alert(
        t('onboarding.notificationsDisabled'),
        t('onboarding.notificationsDisabledDesc'),
        [
          {text: t('onboarding.enableNotifications'), onPress: handleEnableNotifications},
          {text: t('onboarding.continueAnyway'), style: 'destructive', onPress: finishOnboarding},
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
      t('onboarding.setupComplete'),
      t('onboarding.setupCompleteDesc'),
      [{text: t('common.ok')}],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.step}>{t('onboarding.step3of3')}</Text>
          <Text style={styles.title}>{t('onboarding.almostDone')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.almostDoneDesc')}
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
              <Text style={styles.checkTitle}>{t('onboarding.trustedContacts')}</Text>
              <Text style={styles.checkDescription}>
                {contacts.length > 0
                  ? t('onboarding.contactsAdded', {count: contacts.length})
                  : t('onboarding.noContactsAddedShort')}
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
              <Text style={styles.checkTitle}>{t('onboarding.alertSettings')}</Text>
              <Text style={styles.checkDescription}>
                {t('onboarding.alertSettingsDesc', {threshold: userProfile?.inactivity_threshold_hours, grace: userProfile?.grace_period_hours})}
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
              <Text style={styles.checkTitle}>{t('onboarding.pushNotifications')}</Text>
              <Text style={styles.checkDescription}>
                {notificationGranted === null
                  ? t('onboarding.notConfigured')
                  : notificationGranted
                  ? t('onboarding.enabled')
                  : t('onboarding.disabled')}
              </Text>
            </View>
            {notificationGranted !== true && (
              <TouchableOpacity
                style={styles.enableButton}
                onPress={handleEnableNotifications}
                disabled={registering}>
                <Text style={styles.enableButtonText}>
                  {registering ? t('onboarding.enabling') : t('common.enable')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{t('onboarding.whatHappensNext')}</Text>
          <Text style={styles.infoText}>
            {t('onboarding.whatHappensNextDesc')}
          </Text>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleComplete}>
            <Text style={styles.completeButtonText}>{t('onboarding.startUsing')}</Text>
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
