import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/types';
import {useAuth} from '../../hooks/useAuth';
import {updateUserProfile} from '../../api/supabase';
import {ThresholdPicker} from '../../components';
import {INACTIVITY_THRESHOLDS, GRACE_PERIODS, REMINDER_FREQUENCIES} from '../../types';

type SetThresholdScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'SetThreshold'>;
};

export const SetThresholdScreen: React.FC<SetThresholdScreenProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();
  const {authUser, userProfile, refreshProfile} = useAuth();

  const [inactivityThreshold, setInactivityThreshold] = useState(
    userProfile?.inactivity_threshold_hours ?? 24,
  );
  const [gracePeriod, setGracePeriod] = useState(
    userProfile?.grace_period_hours ?? 2,
  );
  const [reminderFrequency, setReminderFrequency] = useState(
    userProfile?.reminder_frequency_hours ?? 4,
  );
  const [saving, setSaving] = useState(false);

  const handleContinue = async () => {
    if (!authUser?.id) {
      return;
    }

    setSaving(true);
    try {
      const {error} = await updateUserProfile(authUser.id, {
        inactivity_threshold_hours: inactivityThreshold,
        grace_period_hours: gracePeriod,
        reminder_frequency_hours: reminderFrequency,
        monitoring_enabled: true,
      });

      if (error) {
        Alert.alert(t('common.error'), t('onboarding.failedToSave'));
        return;
      }

      await refreshProfile();
      navigation.navigate('TestAlert');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.step}>{t('onboarding.step2of3')}</Text>
          <Text style={styles.title}>{t('onboarding.configureAlerts')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.configureAlertsDesc')}
          </Text>
        </View>

        <View style={styles.content}>
          <ThresholdPicker
            label={t('onboarding.inactivityThreshold')}
            description={t('onboarding.inactivityThresholdDesc')}
            options={INACTIVITY_THRESHOLDS}
            selectedValue={inactivityThreshold}
            onSelect={setInactivityThreshold}
          />

          <ThresholdPicker
            label={t('onboarding.gracePeriod')}
            description={t('onboarding.gracePeriodDesc')}
            options={GRACE_PERIODS}
            selectedValue={gracePeriod}
            onSelect={setGracePeriod}
          />

          <ThresholdPicker
            label={t('onboarding.reminderFrequency')}
            description={t('onboarding.reminderFrequencyDesc')}
            options={REMINDER_FREQUENCIES}
            selectedValue={reminderFrequency}
            onSelect={setReminderFrequency}
          />

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>{t('onboarding.alertFlow')}</Text>
            <View style={styles.flowStep}>
              <View style={styles.flowDot} />
              <Text style={styles.flowText}>
                {t('onboarding.alertFlowReminder', {hours: reminderFrequency})}
              </Text>
            </View>
            <View style={styles.flowLine} />
            <View style={styles.flowStep}>
              <View style={[styles.flowDot, {backgroundColor: '#F59E0B'}]} />
              <Text style={styles.flowText}>
                {t('onboarding.alertFlowWarning', {hours: inactivityThreshold})}
              </Text>
            </View>
            <View style={styles.flowLine} />
            <View style={styles.flowStep}>
              <View style={[styles.flowDot, {backgroundColor: '#EF4444'}]} />
              <Text style={styles.flowText}>
                {t('onboarding.alertFlowSms', {hours: gracePeriod})}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, saving && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={saving}>
          <Text style={styles.continueButtonText}>
            {saving ? t('common.saving') : t('common.continue')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
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
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  flowStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flowDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    marginRight: 12,
  },
  flowLine: {
    width: 2,
    height: 24,
    backgroundColor: '#D1D5DB',
    marginLeft: 5,
    marginVertical: 4,
  },
  flowText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
