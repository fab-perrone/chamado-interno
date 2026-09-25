import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => { success: boolean; message?: string };
  quickLogin: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'manutencao_auth_user_v1';

const VALID_ACCOUNTS: Record<string, { password: string; user: User }> = {
  operador: {
    password: 'operador123',
    user: {
      username: 'operador',
      name: 'Carlos Silva',
      role: 'operador',
      setor: 'Produção / Estamparia',
      registro: 'OP-4821',
    },
  },
  mecanico: {
    password: 'mecanico123',
    user: {
      username: 'mecanico',
      name: 'Roberto Mendes',
      role: 'mecanico',
      setor: 'Manutenção Mecânica Central',
      registro: 'MEC-1092',
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao ler usuário salvo', e);
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (username: string, password: string) => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    const account = VALID_ACCOUNTS[cleanUser];
    if (!account) {
      return { success: false, message: 'Usuário não encontrado. Use "operador" ou "mecanico".' };
    }

    if (account.password !== cleanPass) {
      return { success: false, message: 'Senha incorreta para este usuário.' };
    }

    setUser(account.user);
    return { success: true };
  };

  const quickLogin = (role: UserRole) => {
    const account = VALID_ACCOUNTS[role];
    if (account) {
      setUser(account.user);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, quickLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }
  return context;
}
