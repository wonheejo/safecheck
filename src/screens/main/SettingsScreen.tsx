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
} from 'react-native';
import {useAuth} from '../../hooks/useAuth';
import {updateUserProfile} from '../../api/supabase';
import {ThresholdPicker, TimePicker} from '../../components';
import {
  INACTIVITY_THRESHOLDS,
  GRACE_PERIODS,
  REMINDER_FREQUENCIES,
} from '../../types';

export const SettingsScreen: React.FC = () => {
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
        Alert.alert('Error', 'Failed to save settings');
        return;
      }

      await refreshProfile();
      setHasChanges(false);
      Alert.alert('Success', 'Settings saved successfully');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your monitoring will be paused.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
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
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Monitoring Toggle */}
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Monitoring Active</Text>
              <Text style={styles.toggleDescription}>
                When disabled, no alerts will be sent
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
          <Text style={styles.sectionTitle}>Alert Timing</Text>

          <ThresholdPicker
            label="Inactivity Threshold"
            description="How long before your contacts are alerted"
            options={INACTIVITY_THRESHOLDS}
            selectedValue={inactivityThreshold}
            onSelect={setInactivityThreshold}
          />

          <ThresholdPicker
            label="Grace Period"
            description="Time to respond after receiving a warning"
            options={GRACE_PERIODS}
            selectedValue={gracePeriod}
            onSelect={setGracePeriod}
          />
        </View>

        {/* Reminder Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders</Text>

          <ThresholdPicker
            label="Reminder Frequency"
            description="How often to remind you to check in"
            options={REMINDER_FREQUENCIES}
            selectedValue={reminderFrequency}
            onSelect={setReminderFrequency}
          />

          <Text style={styles.subsectionTitle}>Quiet Hours</Text>
          <Text style={styles.subsectionDescription}>
            No reminders during these hours (alerts still trigger)
          </Text>

          <View style={styles.timePickerRow}>
            <View style={styles.timePickerContainer}>
              <TimePicker
                label="Start"
                value={sleepStart}
                onSelect={setSleepStart}
                placeholder="e.g., 11 PM"
              />
            </View>
            <View style={styles.timePickerContainer}>
              <TimePicker
                label="End"
                value={sleepEnd}
                onSelect={setSleepEnd}
                placeholder="e.g., 7 AM"
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
              <Text style={styles.clearButtonText}>Clear Quiet Hours</Text>
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
              {saving ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.accountInfo}>
            <Text style={styles.accountLabel}>Email</Text>
            <Text style={styles.accountValue}>{authUser?.email}</Text>
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <View style={styles.footer}>
          <Text style={styles.version}>JustInCase v1.0.0</Text>
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
