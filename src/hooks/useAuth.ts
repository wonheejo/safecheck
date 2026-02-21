import {useState, useEffect, useCallback} from 'react';
import {Session, User as AuthUser} from '@supabase/supabase-js';
import {
  supabase,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle as authSignInWithGoogle,
  signInWithApple as authSignInWithApple,
  signOut as authSignOut,
  getUserProfile,
  resetPassword as authResetPassword,
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
    const timeout = new Promise<null>((resolve) => setTimeout(() => {

      resolve(null);
    }, 5000));
    const fetch = getUserProfile(userId).then(({data}) => data);
    return Promise.race([fetch, timeout]);
  }, []);

  useEffect(() => {
    // Get initial session with timeout to prevent infinite loading
    const initTimeout = setTimeout(() => {
      setState(prev => {
        if (!prev.initialized) {
          return {...prev, loading: false, initialized: true};
        }
        return prev;
      });
    }, 10000);

    supabase.auth.getSession().then(async ({data: {session}}) => {
      clearTimeout(initTimeout);
      let profile = null;
      if (session?.user) {
        try {
          profile = await fetchUserProfile(session.user.id);
        } catch (_) {
          // Profile fetch failed — continue without profile
        }
      }
      setState({
        session,
        authUser: session?.user ?? null,
        userProfile: profile,
        loading: false,
        initialized: true,
      });
    }).catch(() => {
      clearTimeout(initTimeout);
      setState({
        session: null,
        authUser: null,
        userProfile: null,
        loading: false,
        initialized: true,
      });
    });

    // Listen for auth changes
    const {data: {subscription}} = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        let profile = null;
        if (session?.user) {
          try {
            profile = await fetchUserProfile(session.user.id);
          } catch (_) {
            // Profile fetch failed — continue without profile
          }
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
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setState(prev => ({...prev, loading: true}));
    const result = await signUpWithEmail(email, password, fullName);
    // Don't set loading: false here — onAuthStateChange will handle it after profile is fetched
    if (result.error) {
      setState(prev => ({...prev, loading: false}));
    }
    return result;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState(prev => ({...prev, loading: true}));
    const result = await signInWithEmail(email, password);
    if (result.error) {
      setState(prev => ({...prev, loading: false}));
    }
    return result;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setState(prev => ({...prev, loading: true}));
    try {
      const result = await authSignInWithGoogle();
      if (result.error) {
        setState(prev => ({...prev, loading: false}));
      }
      return result;
    } catch (error: any) {
      setState(prev => ({...prev, loading: false}));
      return {data: null, error: {message: error.message}};
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setState(prev => ({...prev, loading: true}));
    try {
      const result = await authSignInWithApple();
      if (result.error) {
        setState(prev => ({...prev, loading: false}));
      }
      return result;
    } catch (error: any) {
      setState(prev => ({...prev, loading: false}));
      return {data: null, error: {message: error.message}};
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const result = await authResetPassword(email);
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
    signInWithGoogle,
    signInWithApple,
    signOut,
    resetPassword,
    refreshProfile,
    isAuthenticated: !!state.session,
  };
}
