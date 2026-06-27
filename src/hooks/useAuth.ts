import { useState, useEffect } from 'react';
import { getSession, sessionToAuthUser, logout } from '../utils/auth';
import type { AuthUser } from '../utils/auth';
import { supabase } from '../utils/supabaseClient';

export function useAuth() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    getSession().then(session => {
      if (session) setAuthUser(sessionToAuthUser(session));
      setAuthLoading(false);
    }).catch(err => {
      console.error('Session bootstrap failed:', err);
      setAuthLoading(false);
    });

    // Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuthUser(sessionToAuthUser(session));
      } else {
        setAuthUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async (onLogout?: () => void) => {
    await logout();
    if (onLogout) onLogout();
  };

  return { authUser, authLoading, setAuthUser, handleLogout };
}
