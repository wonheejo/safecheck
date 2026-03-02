import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';

interface CheckInButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  lastCheckInTime?: string | null;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
  lastCheckInTime,
}) => {
  const {t} = useTranslation();

  const formatLastCheckIn = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return t('checkIn.justNow');
    }
    if (diffMins < 60) {
      return t('checkIn.minutesAgo', {count: diffMins});
    }
    if (diffHours < 24) {
      return t('checkIn.hoursAgo', {count: diffHours});
    }
    return t('checkIn.daysAgo', {count: diffDays});
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          loading && styles.buttonLoading,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator size="large" color="#FFFFFF" />
        ) : (
          <>
            <Text style={styles.buttonText}>{t('checkIn.imOk')}</Text>
            <Text style={styles.buttonSubtext}>{t('checkIn.tapToCheckIn')}</Text>
          </>
        )}
      </TouchableOpacity>

      {lastCheckInTime && (
        <Text style={styles.lastCheckIn}>
          {t('checkIn.lastCheckIn', {time: formatLastCheckIn(lastCheckInTime)})}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowColor: '#9CA3AF',
  },
  buttonLoading: {
    backgroundColor: '#16A34A',
  },
  buttonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 4,
  },
  lastCheckIn: {
    marginTop: 24,
    fontSize: 14,
    color: '#6B7280',
  },
});
