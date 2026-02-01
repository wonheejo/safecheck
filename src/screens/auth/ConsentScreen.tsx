import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../../navigation/types';

type ConsentScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Consent'>;
};

export const ConsentScreen: React.FC<ConsentScreenProps> = ({navigation}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const canContinue = acceptedTerms && acceptedPrivacy;

  const handleContinue = () => {
    if (canContinue) {
      // Navigate to onboarding
      // This will be handled by the navigation state
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Before We Start</Text>
          <Text style={styles.subtitle}>
            Please review and accept the following to continue
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How SafeCheck Works</Text>
            <Text style={styles.infoText}>
              SafeCheck monitors your check-ins and alerts your trusted contacts
              if you don't respond within your configured time window. This
              service is designed to provide peace of mind for you and your
              loved ones.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What We Need</Text>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>-</Text>
              <Text style={styles.listText}>
                Permission to send you push notifications
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>-</Text>
              <Text style={styles.listText}>
                Phone numbers of your trusted contacts
              </Text>
            </View>
            <View style={styles.listItem}>
              <Text style={styles.bullet}>-</Text>
              <Text style={styles.listText}>
                Your consent to send SMS alerts on your behalf
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAcceptedTerms(!acceptedTerms)}>
            <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
              {acceptedTerms && <Text style={styles.checkmark}>v</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to the{' '}
              <Text style={styles.link}>Terms of Service</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}>
            <View style={[styles.checkbox, acceptedPrivacy && styles.checkboxChecked]}>
              {acceptedPrivacy && <Text style={styles.checkmark}>v</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to the{' '}
              <Text style={styles.link}>Privacy Policy</Text> and consent to
              SafeCheck sending SMS messages to my trusted contacts on my behalf
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !canContinue && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!canContinue}>
            <Text style={styles.buttonText}>Continue to Setup</Text>
          </TouchableOpacity>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
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
  content: {
    flex: 1,
    gap: 20,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  listItem: {
    flexDirection: 'row',
    marginTop: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
    width: 12,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  link: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
