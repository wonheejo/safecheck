import React, {useEffect} from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import {CheckInButton} from '../../components';
import {useAuth} from '../../hooks/useAuth';
import {useCheckIn} from '../../hooks/useCheckIn';
import {registerFcmToken, setupNotificationListeners, setNotificationHandler} from '../../services/notifications';

export const HomeScreen: React.FC = () => {
  const {userProfile, authUser} = useAuth();
  const {checkIn, loading, error} = useCheckIn({
    userId: authUser?.id,
    autoCheckInOnAppOpen: true,
  });

  useEffect(() => {
    if (authUser?.id) {
      // Register FCM token
      registerFcmToken(authUser.id);

      // Set up notification listeners
      const cleanup = setupNotificationListeners();

      // Handle notification check-ins
      setNotificationHandler(async () => {
        await checkIn();
      });

      return cleanup;
    }
  }, [authUser?.id, checkIn]);

  const getStatusInfo = () => {
    if (!userProfile) {
      return {status: 'Loading...', color: '#6B7280'};
    }

    switch (userProfile.alert_status) {
      case 'ok':
        return {
          status: 'All Good',
          description: 'Your contacts will be notified if you miss a check-in',
          color: '#22C55E',
        };
      case 'warning_sent':
        return {
          status: 'Warning Sent',
          description: 'Please check in soon to let your contacts know you are safe',
          color: '#F59E0B',
        };
      case 'alert_sent':
        return {
          status: 'Alert Sent',
          description: 'Your contacts have been notified. Check in to reset.',
          color: '#EF4444',
        };
      default:
        return {status: 'Unknown', color: '#6B7280'};
    }
  };

  const statusInfo = getStatusInfo();

  const getTimeSinceLastCheckIn = () => {
    if (!userProfile?.last_seen_at) {
      return null;
    }

    const lastSeen = new Date(userProfile.last_seen_at);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m ago`;
    }
    return `${diffMins}m ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Hello, {userProfile?.full_name?.split(' ')[0] || 'there'}
          </Text>
          <View style={[styles.statusBadge, {backgroundColor: statusInfo.color}]}>
            <Text style={styles.statusText}>{statusInfo.status}</Text>
          </View>
        </View>

        {statusInfo.description && (
          <Text style={styles.statusDescription}>{statusInfo.description}</Text>
        )}

        <View style={styles.buttonContainer}>
          <CheckInButton
            onPress={checkIn}
            loading={loading}
            disabled={!authUser}
            lastCheckInTime={userProfile?.last_seen_at}
          />
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Monitoring Settings</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Alert after</Text>
            <Text style={styles.infoValue}>
              {userProfile?.inactivity_threshold_hours || 24} hours of inactivity
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Grace period</Text>
            <Text style={styles.infoValue}>
              {userProfile?.grace_period_hours || 2} hours
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quiet hours</Text>
            <Text style={styles.infoValue}>
              {userProfile?.sleep_start_time && userProfile?.sleep_end_time
                ? `${userProfile.sleep_start_time.slice(0, 5)} – ${userProfile.sleep_end_time.slice(0, 5)}`
                : 'Not set'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, {color: userProfile?.monitoring_enabled ? '#22C55E' : '#EF4444'}]}>
              {userProfile?.monitoring_enabled ? 'Active' : 'Paused'}
            </Text>
          </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 32,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    textAlign: 'center',
    color: '#EF4444',
    fontSize: 14,
    marginTop: 16,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
});
