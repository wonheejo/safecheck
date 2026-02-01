import messaging, {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';
import {updateFcmToken} from '../../api/supabase';

export type NotificationHandler = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
) => void;

let notificationHandler: NotificationHandler | null = null;

export const setNotificationHandler = (handler: NotificationHandler) => {
  notificationHandler = handler;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  // iOS
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  return enabled;
};

export const getFcmToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
};

export const registerFcmToken = async (userId: string): Promise<boolean> => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return false;
    }

    const token = await getFcmToken();
    if (!token) {
      return false;
    }

    const {error} = await updateFcmToken(userId, token);
    if (error) {
      console.error('Failed to save FCM token:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to register FCM token:', error);
    return false;
  }
};

export const setupNotificationListeners = () => {
  // Handle foreground messages
  const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification received:', remoteMessage);
    if (notificationHandler) {
      notificationHandler(remoteMessage);
    }
  });

  // Handle background/quit state message open
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened app:', remoteMessage);
    if (notificationHandler) {
      notificationHandler(remoteMessage);
    }
  });

  // Check if app was opened from quit state via notification
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from quit state via notification:', remoteMessage);
        if (notificationHandler) {
          notificationHandler(remoteMessage);
        }
      }
    });

  // Handle token refresh
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
    console.log('FCM token refreshed:', token);
    // Token will be re-registered on next app open
  });

  return () => {
    unsubscribeForeground();
    unsubscribeTokenRefresh();
  };
};

// Background message handler - must be registered at app root level
export const setBackgroundMessageHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message received:', remoteMessage);
    // Background messages are handled by the system
    // The notification will be shown automatically
  });
};

// Handle notification actions (snooze, check-in)
export interface NotificationAction {
  action: 'check_in' | 'snooze';
  snoozeMinutes?: number;
}

export const parseNotificationAction = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): NotificationAction | null => {
  const data = remoteMessage.data;
  if (!data) {
    return null;
  }

  if (data.action === 'check_in') {
    return {action: 'check_in'};
  }

  if (data.action === 'snooze' && data.snooze_minutes) {
    return {
      action: 'snooze',
      snoozeMinutes: parseInt(data.snooze_minutes as string, 10),
    };
  }

  return null;
};
