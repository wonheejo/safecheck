import {useState, useCallback, useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {performCheckIn} from '../api/supabase';
import type {CheckIn} from '../types';

interface UseCheckInOptions {
  userId: string | undefined;
  autoCheckInOnAppOpen?: boolean;
}

export function useCheckIn({userId, autoCheckInOnAppOpen = true}: UseCheckInOptions) {
  const [loading, setLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState<CheckIn | null>(null);
  const [error, setError] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);
  const hasAutoCheckedIn = useRef(false);

  const checkIn = useCallback(
    async (source: CheckIn['source'] = 'manual') => {
      if (!userId) {
        setError('User not authenticated');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const {data, error: checkInError} = await performCheckIn(userId, source);

        if (checkInError) {
          setError(checkInError.message);
          return null;
        }

        setLastCheckIn(data ?? null);
        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to check in';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  // Auto check-in when app opens/becomes active
  useEffect(() => {
    if (!autoCheckInOnAppOpen || !userId) {
      return;
    }

    // Initial check-in when hook mounts (app opens)
    if (!hasAutoCheckedIn.current) {
      hasAutoCheckedIn.current = true;
      checkIn('app_open');
    }

    // Listen for app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkIn('app_open');
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [autoCheckInOnAppOpen, userId, checkIn]);

  const manualCheckIn = useCallback(() => {
    return checkIn('manual');
  }, [checkIn]);

  const notificationCheckIn = useCallback(() => {
    return checkIn('notification');
  }, [checkIn]);

  return {
    checkIn: manualCheckIn,
    notificationCheckIn,
    loading,
    lastCheckIn,
    error,
  };
}
