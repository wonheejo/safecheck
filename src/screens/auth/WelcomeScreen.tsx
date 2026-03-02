import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {AuthStackParamList} from '../../navigation/types';
import {useAuth} from '../../hooks/useAuth';

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({navigation}) => {
  const {t} = useTranslation();
  const {signInWithGoogle, signInWithApple, loading} = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const {error} = await signInWithGoogle();
      if (error) {
        Alert.alert(t('welcome.signInFailed'), error.message);
      }
    } catch (e: any) {
      Alert.alert(t('welcome.signInFailed'), e.message || t('common.somethingWentWrong'));
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setAppleLoading(true);
    try {
      const {error} = await signInWithApple();
      if (error) {
        Alert.alert(t('welcome.signInFailed'), error.message);
      }
    } catch (e: any) {
      Alert.alert(t('welcome.signInFailed'), e.message || t('common.somethingWentWrong'));
    } finally {
      setAppleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>JIC</Text>
          </View>
          <Text style={styles.title}>JustInCase</Text>
          <Text style={styles.subtitle}>
            {t('welcome.subtitle')}
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>*</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('welcome.stayConnected')}</Text>
              <Text style={styles.featureDesc}>
                {t('welcome.stayConnectedDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>!</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('welcome.automaticAlerts')}</Text>
              <Text style={styles.featureDesc}>
                {t('welcome.automaticAlertsDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>~</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('welcome.simplePrivate')}</Text>
              <Text style={styles.featureDesc}>
                {t('welcome.simplePrivateDesc')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.buttons}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.appleButton, (loading || appleLoading) && styles.buttonDisabled]}
              onPress={handleAppleSignIn}
              disabled={loading || appleLoading}>
              <Text style={styles.appleButtonText}>
                {appleLoading ? t('common.signingIn') : t('welcome.signInWithApple')}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.googleButton, (loading || googleLoading) && styles.buttonDisabled]}
            onPress={handleGoogleSignIn}
            disabled={loading || googleLoading}>
            <Text style={styles.googleButtonText}>
              {googleLoading ? t('common.signingIn') : t('welcome.continueWithGoogle')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.emailButton}
            onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.emailButtonText}>{t('welcome.signUpWithEmail')}</Text>
          </TouchableOpacity>

          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>{t('welcome.alreadyHaveAccount')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signinLink}>{t('welcome.signIn')}</Text>
            </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  features: {
    gap: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  featureIcon: {
    fontSize: 24,
    width: 40,
    height: 40,
    textAlign: 'center',
    lineHeight: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  buttons: {
    gap: 12,
  },
  appleButton: {
    backgroundColor: '#000000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emailButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  emailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  signinText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signinLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
