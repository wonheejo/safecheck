import {useState, useEffect, useCallback} from 'react';
import {Session, User as AuthUser} from '@supabase/supabase-js';
import {
  supabase,
  signUpWithEmail,
  signInWithEmail,
  signOut as authSignOut,
  getUserProfile,
} from '../api/supabase';
import type {User} from '../types';

interface AuthState {
  session: Session | null;
  authUser: AuthUser | null;
  userProfile: User | null;
  loading: boolean;
  initialized: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    session: null,
    authUser: null,
    userProfile: null,
    loading: true,
    initialized: false,
  });

  const fetchUserProfile = useCallback(async (userId: string) => {
    const {data} = await getUserProfile(userId);
    return data;
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({data: {session}}) => {
      let profile = null;
      if (session?.user) {
        profile = await fetchUserProfile(session.user.id);
      }
      setState({
        session,
        authUser: session?.user ?? null,
        userProfile: profile,
        loading: false,
        initialized: true,
      });
    });

    // Listen for auth changes
    const {data: {subscription}} = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        let profile = null;
        if (session?.user) {
          profile = await fetchUserProfile(session.user.id);
        }
        setState(prev => ({
          ...prev,
          session,
          authUser: session?.user ?? null,
          userProfile: profile,
          loading: false,
        }));
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setState(prev => ({...prev, loading: true}));
    const result = await signUpWithEmail(email, password, fullName);
    setState(prev => ({...prev, loading: false}));
    return result;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({...prev, loading: true}));
    const result = await signInWithEmail(email, password);
    setState(prev => ({...prev, loading: false}));
    return result;
  }, []);

  const signOut = useCallback(async () => {
    setState(prev => ({...prev, loading: true}));
    const result = await authSignOut();
    setState(prev => ({
      ...prev,
      session: null,
      authUser: null,
      userProfile: null,
      loading: false,
    }));
    return result;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (state.authUser) {
      const profile = await fetchUserProfile(state.authUser.id);
      setState(prev => ({...prev, userProfile: profile}));
    }
  }, [state.authUser, fetchUserProfile]);

  return {
    ...state,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    isAuthenticated: !!state.session,
  };
}
