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

type TermsOfServiceScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'TermsOfService'>;
};

export const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({
  navigation,
}) => {
  const {t} = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>{t('terms.title')}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.doneButton}>{t('common.done')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>{t('terms.lastUpdated')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section1Title')}</Text>
        <Text style={styles.body}>{t('terms.section1Body')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section2Title')}</Text>
        <Text style={styles.body}>{t('terms.section2Body')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section3Title')}</Text>
        <Text style={styles.body}>{t('terms.section3Body')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section4Title')}</Text>
        <Text style={styles.body}>{t('terms.section4Body')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section5Title')}</Text>
        <Text style={styles.body}>{t('terms.section5Body')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section6Title')}</Text>
        <Text style={styles.body}>{t('terms.section6Body')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section7Title')}</Text>
        <Text style={styles.body}>{t('terms.section7Body')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section8Title')}</Text>
        <Text style={styles.body}>{t('terms.section8Body')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section9Title')}</Text>
        <Text style={styles.body}>{t('terms.section9Body')}</Text>

        <Text style={styles.sectionTitle}>{t('terms.section10Title')}</Text>
        <Text style={styles.body}>{t('terms.section10Body')}</Text>
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
