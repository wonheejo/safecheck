import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {AuthStackParamList} from '../../navigation/types';
import {useAuth} from '../../hooks/useAuth';

type SignInScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;
};

export const SignInScreen: React.FC<SignInScreenProps> = ({navigation}) => {
  const {t} = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signIn, resetPassword, loading} = useAuth();

  const handleForgotPassword = () => {
    Alert.prompt(
      t('signIn.resetPassword'),
      t('signIn.resetPasswordMessage'),
      [
        {text: t('common.cancel'), style: 'cancel'},
        {
          text: t('signIn.send'),
          onPress: async (inputEmail?: string) => {
            const targetEmail = inputEmail?.trim() || email.trim();
            if (!targetEmail || !targetEmail.includes('@')) {
              Alert.alert(t('common.error'), t('signIn.invalidEmail'));
              return;
            }
            const {error} = await resetPassword(targetEmail);
            if (error) {
              Alert.alert(t('common.error'), error.message);
            } else {
              Alert.alert(t('signIn.checkEmail'), t('signIn.resetLinkSent', {email: targetEmail}));
            }
          },
        },
      ],
      'plain-text',
      email.trim(),
    );
  };

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('signIn.enterEmail'));
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert(t('common.error'), t('signIn.enterValidEmail'));
      return false;
    }
    if (!password) {
      Alert.alert(t('common.error'), t('signIn.enterPassword'));
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const {error} = await signIn(email.trim(), password);

      if (error) {
        Alert.alert(t('signIn.signInFailed'), error.message);
        return;
      }

      // Auth state change will handle navigation
    } catch (e: any) {
      if (e.message?.includes('Network request failed')) {
        Alert.alert(
          t('common.connectionError'),
          t('common.connectionErrorMessage'),
        );
      } else {
        Alert.alert(t('signIn.signInFailed'), e.message || t('common.somethingWentWrong'));
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>{t('common.back')}</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{t('signIn.title')}</Text>
            <Text style={styles.subtitle}>
              {t('signIn.subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('signIn.email')}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={t('signIn.emailPlaceholder')}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('signIn.password')}</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={t('signIn.passwordPlaceholder')}
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoComplete="current-password"
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>{t('signIn.forgotPassword')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignIn}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? t('signIn.signingIn') : t('signIn.signIn')}
              </Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>{t('signIn.noAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>{t('signIn.signUp')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    paddingTop: 16,
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
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
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
    color: '#6B7280',
  },
  signupLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
