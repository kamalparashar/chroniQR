export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

type UserRecord = {
  id: string;
  name: string;
  hash: string;
};

const SESSION_KEY = 'chroniqr_session';
const STORE_KEY   = 'chroniqr_user_store';

// ── Session helpers ────────────────────────────────────────────────────────

export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: AuthUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ── User store ─────────────────────────────────────────────────────────────

function getStore(): Record<string, UserRecord> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, UserRecord>): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

/** Simple deterministic hash (not secure — mock only) */
function hashPassword(password: string): string {
  return btoa(encodeURIComponent(password + '_chroniqr_salt'));
}

// ── Auth actions ───────────────────────────────────────────────────────────

/**
 * Create a new user account. Returns the created AuthUser or throws if email
 * is already taken.
 *
 * Future: replace body with POST /auth/signup
 */
export function signUp(name: string, email: string, password: string): AuthUser {
  const store = getStore();
  const key   = email.toLowerCase().trim();

  if (store[key]) {
    throw new Error('An account with this email already exists.');
  }

  const user: AuthUser = {
    id:    crypto.randomUUID(),
    name:  name.trim(),
    email: key,
  };

  store[key] = { id: user.id, name: user.name, hash: hashPassword(password) };
  saveStore(store);
  setSession(user);
  return user;
}

/**
 * Authenticate with email + password. Returns the AuthUser or null if invalid.
 *
 * Future: replace body with POST /auth/login
 */
export function login(email: string, password: string): AuthUser | null {
  const store  = getStore();
  const key    = email.toLowerCase().trim();
  const record = store[key];

  if (!record || record.hash !== hashPassword(password)) {
    return null;
  }

  const user: AuthUser = { id: record.id, name: record.name, email: key };
  setSession(user);
  return user;
}
