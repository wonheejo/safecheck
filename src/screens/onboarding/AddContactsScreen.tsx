import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {OnboardingStackParamList} from '../../navigation/types';
import {useAuth} from '../../hooks/useAuth';
import {useContacts} from '../../hooks/useContacts';
import {ContactForm} from '../../components';
import type {TrustedContact, CountryCode} from '../../types';
import {COUNTRIES} from '../../types';

type AddContactsScreenProps = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'AddContacts'>;
};

export const AddContactsScreen: React.FC<AddContactsScreenProps> = ({
  navigation,
}) => {
  const {authUser} = useAuth();
  const {contacts, addContact, removeContact, canAddMore, maxContacts} =
    useContacts(authUser?.id);

  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleAddContact = async (
    name: string,
    phoneNumber: string,
    countryCode: CountryCode,
  ) => {
    setFormLoading(true);
    try {
      const result = await addContact(name, phoneNumber, countryCode);
      if (result.error) {
        Alert.alert('Error', result.error);
        return;
      }
      setShowForm(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveContact = (contact: TrustedContact) => {
    Alert.alert('Remove Contact', `Remove ${contact.name}?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeContact(contact.id),
      },
    ]);
  };

  const handleContinue = () => {
    if (contacts.length === 0) {
      Alert.alert(
        'No Contacts Added',
        'You need at least one trusted contact to continue. They will be notified if you don\'t check in.',
        [{text: 'OK'}],
      );
      return;
    }
    navigation.navigate('SetThreshold');
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Adding Contacts?',
      'Without trusted contacts, JustInCase cannot alert anyone if you don\'t check in. Are you sure?',
      [
        {text: 'Go Back', style: 'cancel'},
        {
          text: 'Skip Anyway',
          onPress: () => navigation.navigate('SetThreshold'),
        },
      ],
    );
  };

  const getCountryInfo = (countryCode: string) => {
    return COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];
  };

  const renderContact = ({item}: {item: TrustedContact}) => {
    const country = getCountryInfo(item.country_code);
    return (
      <View style={styles.contactCard}>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>
            {item.name} {country.flag}
          </Text>
          <Text style={styles.contactPhone}>{item.phone_number}</Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveContact(item)}>
          <Text style={styles.removeButtonText}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.step}>Step 1 of 3</Text>
          <Text style={styles.title}>Add Trusted Contacts</Text>
          <Text style={styles.subtitle}>
            These people will be notified via SMS if you don't check in within
            your configured time window.
          </Text>
        </View>

        <View style={styles.contactsSection}>
          <View style={styles.contactsHeader}>
            <Text style={styles.contactsTitle}>Your Contacts</Text>
            <Text style={styles.contactsCount}>
              {contacts.length}/{maxContacts}
            </Text>
          </View>

          {contacts.length > 0 ? (
            <FlatList
              data={contacts}
              renderItem={renderContact}
              keyExtractor={item => item.id}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              style={styles.contactsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No contacts added yet</Text>
            </View>
          )}

          {canAddMore && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowForm(true)}>
              <Text style={styles.addButtonText}>+ Add Contact</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              contacts.length === 0 && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ContactForm
              onSubmit={handleAddContact}
              onCancel={() => setShowForm(false)}
              loading={formLoading}
            />
          </View>
        </View>
      </Modal>
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
    paddingTop: 24,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 32,
  },
  step: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 8,
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
    lineHeight: 24,
  },
  contactsSection: {
    flex: 1,
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  contactsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactsList: {
    flex: 1,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: 'bold',
  },
  separator: {
    height: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  addButton: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#3B82F6',
  },
  continueButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
