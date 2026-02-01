import {useState, useEffect, useCallback} from 'react';
import {
  getTrustedContacts,
  addTrustedContact,
  updateTrustedContact,
  deleteTrustedContact,
} from '../api/supabase';
import type {TrustedContact} from '../types';

const MAX_CONTACTS = 3;

export function useContacts(userId: string | undefined) {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    if (!userId) {
      setContacts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {data, error: fetchError} = await getTrustedContacts(userId);

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setContacts(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch contacts';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const addContact = useCallback(
    async (name: string, phoneNumber: string, countryCode: string) => {
      if (!userId) {
        return {error: 'User not authenticated'};
      }

      if (contacts.length >= MAX_CONTACTS) {
        return {error: `Maximum of ${MAX_CONTACTS} contacts allowed`};
      }

      setLoading(true);
      setError(null);

      try {
        const {data, error: addError} = await addTrustedContact(
          userId,
          name,
          phoneNumber,
          countryCode,
        );

        if (addError) {
          setError(addError.message);
          return {error: addError.message};
        }

        if (data) {
          setContacts(prev => [...prev, data]);
        }

        return {data};
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to add contact';
        setError(message);
        return {error: message};
      } finally {
        setLoading(false);
      }
    },
    [userId, contacts.length],
  );

  const updateContact = useCallback(
    async (
      contactId: string,
      updates: {name?: string; phone_number?: string; country_code?: string},
    ) => {
      setLoading(true);
      setError(null);

      try {
        const {data, error: updateError} = await updateTrustedContact(
          contactId,
          updates,
        );

        if (updateError) {
          setError(updateError.message);
          return {error: updateError.message};
        }

        if (data) {
          setContacts(prev =>
            prev.map(c => (c.id === contactId ? data : c)),
          );
        }

        return {data};
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update contact';
        setError(message);
        return {error: message};
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const removeContact = useCallback(async (contactId: string) => {
    setLoading(true);
    setError(null);

    try {
      const {error: deleteError} = await deleteTrustedContact(contactId);

      if (deleteError) {
        setError(deleteError.message);
        return {error: deleteError.message};
      }

      setContacts(prev => prev.filter(c => c.id !== contactId));
      return {success: true};
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete contact';
      setError(message);
      return {error: message};
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    removeContact,
    refreshContacts: fetchContacts,
    canAddMore: contacts.length < MAX_CONTACTS,
    maxContacts: MAX_CONTACTS,
  };
}
