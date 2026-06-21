import { supabase } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

// ── Session helpers ────────────────────────────────────────────────────────

/**
 * Returns the current active Supabase session, or null if not logged in.
 */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Returns the current access token (JWT) for use as a Bearer token,
 * or null if the user is not logged in.
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token ?? null;
}

/**
 * Maps a Supabase session to our simplified AuthUser shape.
 */
export function sessionToAuthUser(session: Session): AuthUser {
  const user = session.user;
  return {
    id:    user.id,
    name:  user.user_metadata?.name || user.email?.split('@')[0] || 'User',
    email: user.email ?? '',
  };
}

// ── Auth actions ───────────────────────────────────────────────────────────

/**
 * Sign up a new user with Supabase Auth.
 * Returns the created AuthUser or throws on error.
 */
export async function signUp(name: string, email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }, // stored in user_metadata
    },
  });

  if (error) throw new Error(error.message);
  if (!data.session) {
    // Email confirmation is enabled — user must confirm before they can log in.
    throw new Error('Please check your email and confirm your account before logging in.');
  }

  return sessionToAuthUser(data.session);
}

/**
 * Log in an existing user with email + password.
 * Returns the AuthUser or throws on error.
 */
export async function login(email: string, password: string): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw new Error(error.message);
  if (!data.session) return null;

  return sessionToAuthUser(data.session);
}

/**
 * Sign out the current user and clear the local session.
 */
export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}
