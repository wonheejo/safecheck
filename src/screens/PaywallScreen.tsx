import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useSubscription} from '../hooks/useSubscription';

export const PaywallScreen: React.FC = () => {
  const {t} = useTranslation();
  const {purchase, restore, error, isLoading} = useSubscription();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await purchase();
    } catch {
      Alert.alert(t('common.error'), t('paywall.purchaseError'));
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restore();
    } catch {
      Alert.alert(t('common.error'), t('paywall.restoreError'));
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>JIC</Text>
          </View>
          <Text style={styles.title}>{t('paywall.title')}</Text>
          <Text style={styles.subtitle}>
            {t('paywall.subtitle')}
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>*</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('paywall.automaticMonitoring')}</Text>
              <Text style={styles.featureDesc}>
                {t('paywall.automaticMonitoringDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>!</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('paywall.smsAlerts')}</Text>
              <Text style={styles.featureDesc}>
                {t('paywall.smsAlertsDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>~</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{t('paywall.upTo3Contacts')}</Text>
              <Text style={styles.featureDesc}>
                {t('paywall.upTo3ContactsDesc')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.price}>{t('paywall.price')}</Text>

          <Text style={styles.terms}>
            {t('paywall.subscriptionTerms')}
          </Text>

          <View style={styles.links}>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() =>
                Linking.openURL(
                  'https://wonheejo.github.io/safecheck/terms-of-service.html',
                )
              }>
              <Text style={styles.linkText}>{t('paywall.termsOfService')}</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>|</Text>
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() =>
                Linking.openURL(
                  'https://wonheejo.github.io/safecheck/privacy-policy.html',
                )
              }>
              <Text style={styles.linkText}>{t('paywall.privacyPolicy')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.subscribeButton, (purchasing || isLoading) && styles.buttonDisabled]}
            onPress={handlePurchase}
            disabled={purchasing || isLoading}>
            {purchasing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.subscribeButtonText}>{t('paywall.subscribe')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={restoring || isLoading}>
            <Text style={styles.restoreButtonText}>
              {restoring ? t('paywall.restoring') : t('paywall.restorePurchase')}
            </Text>
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
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  links: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  linkButton: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  linkText: {
    fontSize: 14,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  linkSeparator: {
    fontSize: 14,
    color: '#D1D5DB',
  },
});
