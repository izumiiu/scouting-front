import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { api, ApiError, mutation, errorMessage } from '../lib/api';
interface Auth {
  user: User | null;
  loading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => void;
}
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const expire = () => setUser(null);
    window.addEventListener('scouting:session-expired', expire);
    return () => window.removeEventListener('scouting:session-expired', expire);
  }, []);
  useEffect(() => {
    let active = true;
    api<{ user: User }>('/auth/me')
      .then((x) => {
        if (active) {
          setUser(x.user);
          setError('');
        }
      })
      .catch((e) => {
        if (active && !(e instanceof ApiError && e.status === 401))
          setError(errorMessage(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  const login = async (email: string, password: string) => {
    const x = await api<{ user: User }>(
      '/auth/login',
      mutation('POST', { email, password }),
    );
    setUser(x.user);
    setError('');
  };
  const logout = async () => {
    await api('/auth/logout', mutation('POST', {}));
    setUser(null);
  };
  return (
    <Context
      value={{
        user,
        loading,
        error,
        login,
        logout,
        retry: () => {
          setLoading(true);
          setAttempt((x) => x + 1);
        },
      }}
    >
      {children}
    </Context>
  );
}
// Keep consumers in the same module; this module does not export page components.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error('AuthProvider required');
  return value;
}
