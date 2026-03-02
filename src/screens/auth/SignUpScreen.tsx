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

type SignUpScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;
};

export const SignUpScreen: React.FC<SignUpScreenProps> = ({navigation}) => {
  const {t} = useTranslation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {signUp, loading} = useAuth();

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert(t('common.error'), t('signUp.enterFullName'));
      return false;
    }
    if (!email.trim()) {
      Alert.alert(t('common.error'), t('signUp.enterEmail'));
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert(t('common.error'), t('signUp.enterValidEmail'));
      return false;
    }
    if (password.length < 8) {
      Alert.alert(t('common.error'), t('signUp.passwordMinLength'));
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('common.error'), t('signUp.passwordsDoNotMatch'));
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const {error} = await signUp(email.trim(), password, fullName.trim());

      if (error) {
        Alert.alert(t('signUp.signUpFailed'), error.message);
        return;
      }

      // Navigate to consent screen after successful sign up
      navigation.navigate('Consent');
    } catch (e: any) {
      if (e.message?.includes('Network request failed')) {
        Alert.alert(
          t('common.connectionError'),
          t('common.connectionErrorMessage'),
        );
      } else {
        Alert.alert(t('signUp.signUpFailed'), e.message || t('common.somethingWentWrong'));
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
            <Text style={styles.title}>{t('signUp.title')}</Text>
            <Text style={styles.subtitle}>
              {t('signUp.subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('signUp.fullName')}</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t('signUp.fullNamePlaceholder')}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                autoComplete="name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('signUp.email')}</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder={t('signUp.emailPlaceholder')}
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('signUp.password')}</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={t('signUp.passwordPlaceholder')}
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('signUp.confirmPassword')}</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('signUp.confirmPasswordPlaceholder')}
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoComplete="new-password"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={loading}>
              <Text style={styles.buttonText}>
                {loading ? t('signUp.creatingAccount') : t('signUp.createAccount')}
              </Text>
            </TouchableOpacity>

            <View style={styles.signinContainer}>
              <Text style={styles.signinText}>{t('signUp.alreadyHaveAccount')}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={styles.signinLink}>{t('signUp.signIn')}</Text>
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
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
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
