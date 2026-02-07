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

type TermsOfServiceScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'TermsOfService'>;
};

export const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({
  navigation,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.doneButton}>Done</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Last updated: February 2026</Text>

        <Text style={styles.sectionTitle}>1. Service Description</Text>
        <Text style={styles.body}>
          SafeCheck is a personal safety monitoring application that tracks your
          check-in activity and alerts your designated trusted contacts via SMS
          if you fail to check in within your configured time window. The service
          is intended to provide an additional layer of personal safety and peace
          of mind.
        </Text>

        <Text style={styles.sectionTitle}>2. Eligibility</Text>
        <Text style={styles.body}>
          You must be at least 18 years old to use SafeCheck. By creating an
          account, you represent that you meet this age requirement and have the
          legal capacity to enter into these terms.
        </Text>

        <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
        <Text style={styles.body}>
          You are responsible for maintaining the security of your account and
          for all activity that occurs under your account. You agree to:{'\n\n'}
          - Keep your account credentials secure{'\n'}
          - Provide accurate contact information for your trusted contacts{'\n'}
          - Obtain consent from your trusted contacts before adding their phone
          numbers{'\n'}
          - Check in regularly according to your configured schedule{'\n'}
          - Keep push notifications enabled for the app to function properly
        </Text>

        <Text style={styles.sectionTitle}>4. SMS Consent & Messaging</Text>
        <Text style={styles.body}>
          By using SafeCheck, you authorize the service to send SMS messages to
          your trusted contacts on your behalf when an inactivity alert is
          triggered. These messages will identify you by name and inform your
          contacts that you have not checked in. Standard messaging rates may
          apply to your trusted contacts. You are responsible for informing your
          contacts that they may receive these messages.
        </Text>

        <Text style={styles.sectionTitle}>5. Push Notifications</Text>
        <Text style={styles.body}>
          SafeCheck requires push notification permissions to send you check-in
          reminders and inactivity warnings. Disabling push notifications may
          prevent the service from functioning as intended. SafeCheck is not
          liable for missed alerts due to disabled notifications.
        </Text>

        <Text style={styles.sectionTitle}>6. Limitations of Service</Text>
        <Text style={styles.body}>
          SafeCheck is not an emergency service and should not be used as a
          substitute for calling emergency services (e.g., 911, 112, 119). The
          service depends on internet connectivity, push notification delivery,
          and third-party SMS providers. We do not guarantee that alerts will be
          delivered in all circumstances.{'\n\n'}
          SafeCheck is provided "as is" without warranties of any kind, express
          or implied. We do not warrant that the service will be uninterrupted,
          timely, secure, or error-free.
        </Text>

        <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
        <Text style={styles.body}>
          To the fullest extent permitted by law, SafeCheck and its operators
          shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or any loss of profits or
          revenues, whether incurred directly or indirectly, arising from your
          use of the service.
        </Text>

        <Text style={styles.sectionTitle}>8. Account Termination</Text>
        <Text style={styles.body}>
          You may delete your account at any time through the app settings. Upon
          deletion, your personal data and trusted contact information will be
          removed from our systems. We reserve the right to suspend or terminate
          accounts that violate these terms or engage in abusive behavior.
        </Text>

        <Text style={styles.sectionTitle}>9. Changes to Terms</Text>
        <Text style={styles.body}>
          We may update these Terms of Service from time to time. If we make
          material changes, we will notify you through the app. Your continued
          use of SafeCheck after changes are posted constitutes your acceptance
          of the revised terms.
        </Text>

        <Text style={styles.sectionTitle}>10. Contact</Text>
        <Text style={styles.body}>
          If you have questions about these Terms of Service, please contact us
          through the app's support channel.
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
});
