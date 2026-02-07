import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {createClient} from '@supabase/supabase-js';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {SUPABASE_URL, SUPABASE_ANON_KEY, GOOGLE_CLIENT_ID, GOOGLE_IOS_CLIENT_ID} from '@env';
import type {User, TrustedContact, CheckIn, AlertLog} from '../types';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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

// Google Sign-In
GoogleSignin.configure({
  iosClientId: GOOGLE_IOS_CLIENT_ID,
  webClientId: GOOGLE_CLIENT_ID,
  offlineAccess: true,
});

export const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();

  if (!response.data?.idToken) {
    throw new Error('Google Sign-In failed: no idToken returned');
  }

  const {data, error} = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: response.data.idToken,
  });

  return {data, error};
};

// Password reset
export const resetPassword = async (email: string) => {
  const {data, error} = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'safecheck://reset-password',
  });
  return {data, error};
};

// User profile helpers
export const getUserProfile = async (userId: string) => {
  const {data, error} = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return {data: data as User | null, error};
};

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const {data, error} = await supabase
    .from('users')
    .update({...updates, updated_at: new Date().toISOString()})
    .eq('id', userId)
    .select()
    .single();
  return {data: data as User | null, error};
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
    return {data: null, error: userError};
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

  return {data: data as CheckIn | null, error};
};

// Trusted contacts helpers
export const getTrustedContacts = async (userId: string) => {
  const {data, error} = await supabase
    .from('trusted_contacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', {ascending: true});
  return {data: data as TrustedContact[] | null, error};
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
  return {data: data as TrustedContact | null, error};
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
  return {data: data as TrustedContact | null, error};
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
  return {data: data as AlertLog[] | null, error};
};
