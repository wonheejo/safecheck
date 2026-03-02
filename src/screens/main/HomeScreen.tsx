import React, {useEffect, useCallback} from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useFocusEffect} from '@react-navigation/native';
import {CheckInButton} from '../../components';
import {useAuth} from '../../hooks/useAuth';
import {useCheckIn} from '../../hooks/useCheckIn';
import {registerFcmToken, setupNotificationListeners, setNotificationHandler} from '../../services/notifications';

export const HomeScreen: React.FC = () => {
  const {t} = useTranslation();
  const {userProfile, authUser, refreshProfile} = useAuth();
  const {checkIn: rawCheckIn, loading, error} = useCheckIn({
    userId: authUser?.id,
    autoCheckInOnAppOpen: true,
  });

  const checkIn = async () => {
    const result = await rawCheckIn();
    if (result) {
      await refreshProfile();
    }
    return result;
  };

  // Refresh profile when tab is focused (picks up settings changes)
  useFocusEffect(
    useCallback(() => {
      if (authUser?.id) {
        refreshProfile();
      }
    }, [authUser?.id, refreshProfile]),
  );

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
      return {status: t('common.loading'), color: '#6B7280'};
    }

    switch (userProfile.alert_status) {
      case 'ok':
        return {
          status: t('home.allGood'),
          description: t('home.allGoodDesc'),
          color: '#22C55E',
        };
      case 'warning_sent':
        return {
          status: t('home.warningSent'),
          description: t('home.warningSentDesc'),
          color: '#F59E0B',
        };
      case 'alert_sent':
        return {
          status: t('home.alertSent'),
          description: t('home.alertSentDesc'),
          color: '#EF4444',
        };
      default:
        return {status: t('home.unknown'), color: '#6B7280'};
    }
  };

  const statusInfo = getStatusInfo();

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      const mins = Math.round(hours * 60);
      return t('time.minutes', {count: mins});
    }
    return t('time.hours', {count: hours});
  };

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
      return t('home.hoursAgo', {hours: diffHours, mins: diffMins});
    }
    return t('home.minutesAgo', {mins: diffMins});
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.greeting}>
            {t('home.hello', {name: userProfile?.full_name?.split(' ')[0] || t('home.defaultName')})}
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
          <Text style={styles.infoTitle}>{t('home.monitoringSettings')}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('home.alertAfter')}</Text>
            <Text style={styles.infoValue}>
              {t('home.ofInactivity', {duration: formatDuration(userProfile?.inactivity_threshold_hours || 24)})}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('home.gracePeriod')}</Text>
            <Text style={styles.infoValue}>
              {formatDuration(userProfile?.grace_period_hours || 2)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('home.quietHours')}</Text>
            <Text style={styles.infoValue}>
              {userProfile?.sleep_start_time && userProfile?.sleep_end_time
                ? `${userProfile.sleep_start_time.slice(0, 5)} – ${userProfile.sleep_end_time.slice(0, 5)}`
                : t('home.notSet')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('home.status')}</Text>
            <Text style={[styles.infoValue, {color: userProfile?.monitoring_enabled ? '#22C55E' : '#EF4444'}]}>
              {userProfile?.monitoring_enabled ? t('home.active') : t('home.paused')}
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
