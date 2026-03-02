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
import {useTranslation} from 'react-i18next';
import {AuthStackParamList} from '../../navigation/types';

type PrivacyPolicyScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'PrivacyPolicy'>;
};

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>{t('privacy.title')}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.doneButton}>{t('common.done')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>{t('privacy.lastUpdated')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section1Title')}</Text>
        <Text style={styles.body}>{t('privacy.section1Body')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section2Title')}</Text>
        <Text style={styles.body}>{t('privacy.section2Body')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section3Title')}</Text>
        <Text style={styles.body}>{t('privacy.section3Body')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section4Title')}</Text>
        <Text style={styles.body}>{t('privacy.section4Body')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section5Title')}</Text>
        <Text style={styles.body}>{t('privacy.section5Body')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section6Title')}</Text>
        <Text style={styles.body}>{t('privacy.section6Body')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section7Title')}</Text>
        <Text style={styles.body}>{t('privacy.section7Body')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section8Title')}</Text>
        <Text style={styles.body}>{t('privacy.section8Body')}</Text>

        <Text style={styles.sectionTitle}>{t('privacy.section9Title')}</Text>
        <Text style={styles.body}>{t('privacy.section9Body')}</Text>
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
