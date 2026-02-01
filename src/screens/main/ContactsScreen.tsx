import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import {useAuth} from '../../hooks/useAuth';
import {useContacts} from '../../hooks/useContacts';
import {ContactForm} from '../../components';
import type {TrustedContact, CountryCode} from '../../types';
import {COUNTRIES} from '../../types';

export const ContactsScreen: React.FC = () => {
  const {authUser} = useAuth();
  const {
    contacts,
    loading,
    addContact,
    updateContact,
    removeContact,
    canAddMore,
    maxContacts,
  } = useContacts(authUser?.id);

  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleAddContact = () => {
    setEditingContact(null);
    setShowForm(true);
  };

  const handleEditContact = (contact: TrustedContact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDeleteContact = (contact: TrustedContact) => {
    Alert.alert(
      'Remove Contact',
      `Are you sure you want to remove ${contact.name} from your trusted contacts?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const result = await removeContact(contact.id);
            if (result.error) {
              Alert.alert('Error', result.error);
            }
          },
        },
      ],
    );
  };

  const handleFormSubmit = async (
    name: string,
    phoneNumber: string,
    countryCode: CountryCode,
  ) => {
    setFormLoading(true);

    try {
      if (editingContact) {
        const result = await updateContact(editingContact.id, {
          name,
          phone_number: phoneNumber,
          country_code: countryCode,
        });
        if (result.error) {
          Alert.alert('Error', result.error);
          return;
        }
      } else {
        const result = await addContact(name, phoneNumber, countryCode);
        if (result.error) {
          Alert.alert('Error', result.error);
          return;
        }
      }
      setShowForm(false);
      setEditingContact(null);
    } finally {
      setFormLoading(false);
    }
  };

  const getCountryInfo = (countryCode: string) => {
    return COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0];
  };

  const formatPhoneNumber = (phone: string, countryCode: string) => {
    const country = getCountryInfo(countryCode);
    // Remove the dial code from the stored E.164 number for display
    const localNumber = phone.replace(country.dialCode, '');
    return `${country.dialCode} ${localNumber}`;
  };

  const renderContact = ({item}: {item: TrustedContact}) => {
    const country = getCountryInfo(item.country_code);

    return (
      <View style={styles.contactCard}>
        <View style={styles.contactInfo}>
          <View style={styles.contactHeader}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text style={styles.contactFlag}>{country.flag}</Text>
          </View>
          <Text style={styles.contactPhone}>
            {formatPhoneNumber(item.phone_number, item.country_code)}
          </Text>
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEditContact(item)}>
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteContact(item)}>
            <Text style={styles.deleteButtonText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No Trusted Contacts</Text>
      <Text style={styles.emptyDescription}>
        Add up to {maxContacts} trusted contacts who will be notified if you
        don't check in.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Trusted Contacts</Text>
          <Text style={styles.subtitle}>
            {contacts.length}/{maxContacts} contacts
          </Text>
        </View>

        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={item => item.id}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={contacts.length === 0 ? styles.emptyContainer : undefined}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {canAddMore && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddContact}>
            <Text style={styles.addButtonText}>+ Add Contact</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ContactForm
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingContact(null);
              }}
              initialValues={
                editingContact
                  ? {
                      name: editingContact.name,
                      phoneNumber: editingContact.phone_number.replace(
                        getCountryInfo(editingContact.country_code).dialCode,
                        '',
                      ),
                      countryCode: editingContact.country_code as CountryCode,
                    }
                  : undefined
              }
              isEditing={!!editingContact}
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
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  contactFlag: {
    fontSize: 16,
  },
  contactPhone: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addButtonText: {
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
