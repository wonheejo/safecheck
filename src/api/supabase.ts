import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import type {User, TrustedContact, CheckIn, AlertLog} from '../types';

const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      trusted_contacts: {
        Row: TrustedContact;
        Insert: Omit<TrustedContact, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TrustedContact, 'id' | 'created_at' | 'updated_at'>>;
      };
      check_ins: {
        Row: CheckIn;
        Insert: Omit<CheckIn, 'id' | 'created_at'>;
        Update: never;
      };
      alerts_log: {
        Row: AlertLog;
        Insert: Omit<AlertLog, 'id' | 'created_at'>;
        Update: Partial<Omit<AlertLog, 'id' | 'created_at'>>;
      };
    };
  };
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Auth helpers
export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  const {data, error} = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  return {data, error};
};

export const signInWithEmail = async (email: string, password: string) => {
  const {data, error} = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return {data, error};
};

export const signOut = async () => {
  const {error} = await supabase.auth.signOut();
  return {error};
};

export const getCurrentUser = async () => {
  const {data: {user}} = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const {data: {session}} = await supabase.auth.getSession();
  return session;
};

// User profile helpers
export const getUserProfile = async (userId: string) => {
  const {data, error} = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return {data, error};
};

export const updateUserProfile = async (userId: string, updates: Database['public']['Tables']['users']['Update']) => {
  const {data, error} = await supabase
    .from('users')
    .update({...updates, updated_at: new Date().toISOString()})
    .eq('id', userId)
    .select()
    .single();
  return {data, error};
};

export const updateFcmToken = async (userId: string, fcmToken: string) => {
  return updateUserProfile(userId, {fcm_token: fcmToken});
};

// Check-in helpers
export const performCheckIn = async (userId: string, source: CheckIn['source'] = 'manual') => {
  const now = new Date().toISOString();

  // Update last_seen_at and reset alert status
  const {error: userError} = await supabase
    .from('users')
    .update({
      last_seen_at: now,
      alert_status: 'ok',
      updated_at: now,
    })
    .eq('id', userId);

  if (userError) {
    return {error: userError};
  }

  // Log the check-in
  const {data, error} = await supabase
    .from('check_ins')
    .insert({
      user_id: userId,
      source,
    })
    .select()
    .single();

  return {data, error};
};

// Trusted contacts helpers
export const getTrustedContacts = async (userId: string) => {
  const {data, error} = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {ascending: true});
  return {data, error};
};

export const addTrustedContact = async (
  userId: string,
  name: string,
  phoneNumber: string,
  countryCode: string
) => {
  const {data, error} = await supabase
    .from('trusted_contacts')
    .insert({
      user_id: userId,
      name,
      phone_number: phoneNumber,
      country_code: countryCode,
    })
    .select()
    .single();
  return {data, error};
};

export const updateTrustedContact = async (
  contactId: string,
  updates: {name?: string; phone_number?: string; country_code?: string}
) => {
  const {data, error} = await supabase
    .from('trusted_contacts')
    .update({...updates, updated_at: new Date().toISOString()})
    .eq('id', contactId)
    .select()
    .single();
  return {data, error};
};

export const deleteTrustedContact = async (contactId: string) => {
  const {error} = await supabase
    .from('trusted_contacts')
    .delete()
    .eq('id', contactId);
  return {error};
};

// Alert log helpers
export const getAlertHistory = async (userId: string, limit = 20) => {
  const {data, error} = await supabase
    .from('alerts_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {ascending: false})
    .limit(limit);
  return {data, error};
};
