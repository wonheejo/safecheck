import React, {useEffect, useState} from 'react';
import {StatusBar, LogBox, Linking} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {RootNavigator} from './src/navigation';
import {setBackgroundMessageHandler} from './src/services/notifications';
import {supabase} from './src/api/supabase';
import {ResetPasswordScreen} from './src/screens/auth/ResetPasswordScreen';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

// Set up background message handler
setBackgroundMessageHandler();

const App: React.FC = () => {
  const [showResetPassword, setShowResetPassword] = useState(false);

  useEffect(() => {
    // Handle deep links for password reset
    const handleDeepLink = async (url: string) => {
      if (url.includes('reset-password') || url.includes('type=recovery')) {
        // Extract tokens from URL fragment
        const params = new URLSearchParams(
          url.includes('#') ? url.split('#')[1] : url.split('?')[1],
        );
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          setShowResetPassword(true);
        }
      }
    };

    // Check if app was opened via deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is open
    const subscription = Linking.addEventListener('url', ({url}) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (showResetPassword) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ResetPasswordScreen onComplete={() => setShowResetPassword(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <RootNavigator />
    </SafeAreaProvider>
  );
};

export default App;
