import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {useSubscription} from '../hooks/useSubscription';

export const PaywallScreen: React.FC = () => {
  const {purchase, restore, error, isLoading} = useSubscription();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await purchase();
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restore();
    } catch {
      Alert.alert('Error', 'Could not restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  if (error) {
    // Show error inline but don't block — user can still try
    console.warn('Subscription error:', error);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>JIC</Text>
          </View>
          <Text style={styles.title}>JustInCase Premium</Text>
          <Text style={styles.subtitle}>
            Keep your loved ones informed with automatic safety check-ins
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>*</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Automatic Monitoring</Text>
              <Text style={styles.featureDesc}>
                24/7 inactivity detection with customizable thresholds
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>!</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>SMS Alerts</Text>
              <Text style={styles.featureDesc}>
                Your trusted contacts are notified via SMS if you don't check in
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>~</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Up to 3 Contacts</Text>
              <Text style={styles.featureDesc}>
                Add trusted contacts across 8 supported countries
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.price}>₩5,000 / month</Text>

          <TouchableOpacity
            style={[styles.subscribeButton, (purchasing || isLoading) && styles.buttonDisabled]}
            onPress={handlePurchase}
            disabled={purchasing || isLoading}>
            {purchasing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={restoring || isLoading}>
            <Text style={styles.restoreButtonText}>
              {restoring ? 'Restoring...' : 'Restore Purchase'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            Payment will be charged to your Apple ID account at confirmation of
            purchase. Subscription automatically renews unless it is canceled at
            least 24 hours before the end of the current period. Your account
            will be charged for renewal within 24 hours prior to the end of the
            current period.
          </Text>

          <View style={styles.links}>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  'https://wonheejo.github.io/safecheck/terms-of-service.html',
                )
              }>
              <Text style={styles.linkText}>Terms of Service</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>|</Text>
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  'https://wonheejo.github.io/safecheck/privacy-policy.html',
                )
              }>
              <Text style={styles.linkText}>Privacy Policy</Text>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
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
  bottom: {
    alignItems: 'center',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  subscribeButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  restoreButton: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  terms: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkText: {
    fontSize: 12,
    color: '#3B82F6',
  },
  linkSeparator: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});
