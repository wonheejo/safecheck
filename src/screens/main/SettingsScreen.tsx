import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../hooks/useAuth';
import {updateUserProfile} from '../../api/supabase';
import {ThresholdPicker, TimePicker} from '../../components';
import {
  INACTIVITY_THRESHOLDS,
  GRACE_PERIODS,
  REMINDER_FREQUENCIES,
} from '../../types';

export const SettingsScreen: React.FC = () => {
  const {t} = useTranslation();
  const {userProfile, authUser, signOut, refreshProfile} = useAuth();

  const [inactivityThreshold, setInactivityThreshold] = useState(
    userProfile?.inactivity_threshold_hours || 24,
  );
  const [gracePeriod, setGracePeriod] = useState(
    userProfile?.grace_period_hours || 2,
  );
  const [reminderFrequency, setReminderFrequency] = useState(
    userProfile?.reminder_frequency_hours || 4,
  );
  const [sleepStart, setSleepStart] = useState(
    userProfile?.sleep_start_time || null,
  );
  const [sleepEnd, setSleepEnd] = useState(
    userProfile?.sleep_end_time || null,
  );
  const [monitoringEnabled, setMonitoringEnabled] = useState(
    userProfile?.monitoring_enabled ?? true,
  );
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state when userProfile loads or changes
  useEffect(() => {
    if (userProfile) {
      setInactivityThreshold(userProfile.inactivity_threshold_hours ?? 24);
      setGracePeriod(userProfile.grace_period_hours ?? 2);
      setReminderFrequency(userProfile.reminder_frequency_hours ?? 4);
      setSleepStart(userProfile.sleep_start_time ?? null);
      setSleepEnd(userProfile.sleep_end_time ?? null);
      setMonitoringEnabled(userProfile.monitoring_enabled ?? true);
      setHasChanges(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      const changed =
        inactivityThreshold !== userProfile.inactivity_threshold_hours ||
        gracePeriod !== userProfile.grace_period_hours ||
        reminderFrequency !== userProfile.reminder_frequency_hours ||
        sleepStart !== userProfile.sleep_start_time ||
        sleepEnd !== userProfile.sleep_end_time ||
        monitoringEnabled !== userProfile.monitoring_enabled;
      setHasChanges(changed);
    }
  }, [
    inactivityThreshold,
    gracePeriod,
    reminderFrequency,
    sleepStart,
    sleepEnd,
    monitoringEnabled,
    userProfile,
  ]);

  const handleSave = async () => {
    if (!authUser?.id) {
      return;
    }

    setSaving(true);
    try {
      const {error} = await updateUserProfile(authUser.id, {
        inactivity_threshold_hours: inactivityThreshold,
        grace_period_hours: gracePeriod,
        reminder_frequency_hours: reminderFrequency,
        sleep_start_time: sleepStart,
        sleep_end_time: sleepEnd,
        monitoring_enabled: monitoringEnabled,
      });

      if (error) {
        Alert.alert(t('common.error'), t('settings.failedToSave'));
        return;
      }

      await refreshProfile();
      setHasChanges(false);
      Alert.alert(t('settings.success'), t('settings.settingsSaved'));
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      t('settings.signOut'),
      t('settings.signOutConfirm'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('settings.signOut'),
          style: 'destructive',
          onPress: signOut,
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>

        {/* Monitoring Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>{t('settings.monitoringActive')}</Text>
              <Text style={styles.toggleDescription}>
                {t('settings.monitoringDisabledDesc')}
              </Text>
            </View>
            <Switch
              value={monitoringEnabled}
              onValueChange={setMonitoringEnabled}
              trackColor={{false: '#D1D5DB', true: '#BBF7D0'}}
              thumbColor={monitoringEnabled ? '#22C55E' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Alert Timing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.alertTiming')}</Text>

          <ThresholdPicker
            label={t('settings.inactivityThreshold')}
            description={t('settings.inactivityThresholdDesc')}
            options={INACTIVITY_THRESHOLDS}
            selectedValue={inactivityThreshold}
            onSelect={setInactivityThreshold}
          />

          <ThresholdPicker
            label={t('settings.gracePeriod')}
            description={t('settings.gracePeriodDesc')}
            options={GRACE_PERIODS}
            selectedValue={gracePeriod}
            onSelect={setGracePeriod}
          />
        </View>

        {/* Reminder Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.reminders')}</Text>

          <ThresholdPicker
            label={t('settings.reminderFrequency')}
            description={t('settings.reminderFrequencyDesc')}
            options={REMINDER_FREQUENCIES}
            selectedValue={reminderFrequency}
            onSelect={setReminderFrequency}
          />

          <Text style={styles.subsectionTitle}>{t('settings.quietHours')}</Text>
          <Text style={styles.subsectionDescription}>
            {t('settings.quietHoursDesc')}
          </Text>

          <View style={styles.timePickerRow}>
            <View style={styles.timePickerContainer}>
              <TimePicker
                label={t('settings.start')}
                value={sleepStart}
                onSelect={setSleepStart}
                placeholder={t('settings.startPlaceholder')}
              />
            </View>
            <View style={styles.timePickerContainer}>
              <TimePicker
                label={t('settings.end')}
                value={sleepEnd}
                onSelect={setSleepEnd}
                placeholder={t('settings.endPlaceholder')}
              />
            </View>
          </View>

          {(sleepStart || sleepEnd) && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setSleepStart(null);
                setSleepEnd(null);
              }}>
              <Text style={styles.clearButtonText}>{t('settings.clearQuietHours')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Save Button */}
        {hasChanges && (
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}>
            <Text style={styles.saveButtonText}>
              {saving ? t('common.saving') : t('settings.saveChanges')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>

          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>{t('settings.email')}</Text>
            <Text style={styles.accountValue}>{authUser?.email}</Text>
          </View>

          <TouchableOpacity
            style={styles.manageSubscriptionButton}
            onPress={() => {
              const url = Platform.select({
                ios: 'https://apps.apple.com/account/subscriptions',
                android: 'https://play.google.com/store/account/subscriptions',
              });
              if (url) {
                Linking.openURL(url);
              }
            }}>
            <Text style={styles.manageSubscriptionText}>{t('settings.manageSubscription')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>{t('settings.signOut')}</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.footer}>
          <Text style={styles.version}>{t('settings.version', {version: '1.0.1'})}</Text>
        </View>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  toggleDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  subsectionDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  timePickerRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timePickerContainer: {
    flex: 1,
  },
  clearButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  accountInfo: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  accountLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 16,
    color: '#111827',
  },
  manageSubscriptionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
  },
  manageSubscriptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  signOutButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
  },
  version: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
