import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface AdminUser {
  name: string;
  role: string;
  inGameName: string;
  inGameUid: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (adminName: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Validate existing stored token on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('ego_admin_token');
    const savedAdmin = localStorage.getItem('ego_admin_user');

    if (!savedToken) {
      setIsCheckingAuth(false);
      return;
    }

    try {
      if (savedAdmin) {
        setAdmin(JSON.parse(savedAdmin));
        setToken(savedToken);
      }
    } catch {
      // ignore parse error
    }

    // Verify token with server
    fetch('/api/admin/verify', {
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Invalid token');
      })
      .then((data) => {
        if (data.valid && data.admin) {
          setAdmin(data.admin);
          setToken(savedToken);
          localStorage.setItem('ego_admin_user', JSON.stringify(data.admin));
        } else {
          setAdmin(null);
          setToken(null);
          localStorage.removeItem('ego_admin_token');
          localStorage.removeItem('ego_admin_user');
        }
      })
      .catch(() => {
        setAdmin(null);
        setToken(null);
        localStorage.removeItem('ego_admin_token');
        localStorage.removeItem('ego_admin_user');
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  const login = useCallback(async (adminName: string, password: string) => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminName, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Failed to authenticate admin.',
        };
      }

      setAdmin(data.admin);
      setToken(data.token);
      localStorage.setItem('ego_admin_token', data.token);
      localStorage.setItem('ego_admin_user', JSON.stringify(data.admin));

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error communicating with server.',
      };
    }
  }, []);

  const logout = useCallback(async () => {
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // ignore error
      }
    }

    setAdmin(null);
    setToken(null);
    localStorage.removeItem('ego_admin_token');
    localStorage.removeItem('ego_admin_user');
  }, [token]);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!admin && !!token,
        isCheckingAuth,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return ctx;
};
