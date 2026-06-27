import { useState, useEffect } from 'react';
import { getSession, sessionToAuthUser, logout } from '../utils/auth';
import type { AuthUser } from '../utils/auth';
import { supabase } from '../utils/supabaseClient';
import { useToast } from '../contexts/ToastContext';

export function useAuth() {
  const toast = useToast();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    getSession().then(session => {
      if (session) setAuthUser(sessionToAuthUser(session));
      setAuthLoading(false);
    }).catch(() => {
      toast.error('Session bootstrap failed');
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
    try {
      await logout();
      if (onLogout) onLogout();
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return { authUser, authLoading, setAuthUser, handleLogout };
}
