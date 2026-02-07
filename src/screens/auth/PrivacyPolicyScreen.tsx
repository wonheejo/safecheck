import React from 'react';
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

type PrivacyPolicyScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'PrivacyPolicy'>;
};

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({
  navigation,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Last updated: February 2026</Text>

        <Text style={styles.sectionTitle}>1. Data We Collect</Text>
        <Text style={styles.body}>
          SafeCheck collects the following information:{'\n\n'}
          - <Text style={styles.bold}>Account information:</Text> Your name and
          email address (provided via Google Sign-In){'\n'}
          - <Text style={styles.bold}>Trusted contacts:</Text> Names and phone
          numbers of up to 3 contacts you designate{'\n'}
          - <Text style={styles.bold}>Check-in activity:</Text> Timestamps of
          your check-ins and app usage{'\n'}
          - <Text style={styles.bold}>Device token:</Text> A push notification
          token for sending you alerts{'\n'}
          - <Text style={styles.bold}>Preferences:</Text> Your inactivity
          threshold, grace period, and quiet hours settings
        </Text>

        <Text style={styles.sectionTitle}>2. How We Use Your Data</Text>
        <Text style={styles.body}>
          Your data is used exclusively to provide the SafeCheck service:{'\n\n'}
          - Monitor your check-in activity against your configured threshold
          {'\n'}
          - Send you push notification reminders and warnings{'\n'}
          - Send SMS alerts to your trusted contacts when triggered{'\n'}
          - Maintain an audit log of check-ins and alerts for your review
        </Text>

        <Text style={styles.sectionTitle}>3. Third-Party Services</Text>
        <Text style={styles.body}>
          SafeCheck uses the following third-party services to operate:{'\n\n'}
          - <Text style={styles.bold}>Supabase</Text> — Authentication and
          database hosting. Your account data and check-in records are stored in
          Supabase's cloud infrastructure.{'\n\n'}
          - <Text style={styles.bold}>Firebase Cloud Messaging (Google)</Text> —
          Push notification delivery. Your device token is shared with Firebase
          to deliver notifications.{'\n\n'}
          - <Text style={styles.bold}>Twilio</Text> — SMS delivery. Your trusted
          contacts' phone numbers are shared with Twilio solely for the purpose
          of sending alert messages.{'\n\n'}
          Each third-party service is governed by its own privacy policy and data
          processing terms.
        </Text>

        <Text style={styles.sectionTitle}>4. Data Storage & Security</Text>
        <Text style={styles.body}>
          Your data is stored securely in Supabase's cloud database with
          row-level security policies that ensure you can only access your own
          data. All communication between the app and our servers is encrypted
          via HTTPS/TLS. We do not sell, rent, or share your personal data with
          third parties beyond the service providers listed above.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Retention</Text>
        <Text style={styles.body}>
          Your data is retained for as long as your account is active. Check-in
          and alert logs are kept for your reference and may be periodically
          pruned. When you delete your account, all associated data (profile,
          trusted contacts, check-in history, and alert logs) is permanently
          removed from our systems.
        </Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.body}>
          You have the right to:{'\n\n'}
          - Access your personal data through the app{'\n'}
          - Correct inaccurate information in your profile or contacts{'\n'}
          - Delete your account and all associated data at any time{'\n'}
          - Withdraw consent by disabling notifications or removing trusted
          contacts{'\n\n'}
          If you are located in the EU/EEA, you may also have additional rights
          under GDPR including the right to data portability and the right to
          lodge a complaint with a supervisory authority.
        </Text>

        <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
        <Text style={styles.body}>
          SafeCheck is not intended for use by anyone under the age of 18. We do
          not knowingly collect personal data from minors. If we become aware
          that we have collected data from a minor, we will take steps to delete
          it promptly.
        </Text>

        <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
        <Text style={styles.body}>
          We may update this Privacy Policy from time to time. If we make
          material changes, we will notify you through the app. Your continued
          use of SafeCheck after changes are posted constitutes your acceptance
          of the updated policy.
        </Text>

        <Text style={styles.sectionTitle}>9. Contact</Text>
        <Text style={styles.body}>
          If you have questions about this Privacy Policy or how your data is
          handled, please contact us through the app's support channel.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
    color: '#374151',
  },
});
