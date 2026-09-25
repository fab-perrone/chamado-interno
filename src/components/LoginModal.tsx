import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Wrench, HardHat, Lock, User as UserIcon, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserRole } from '../types/index.ts';

export const LoginModal: React.FC = () => {
  const { login, quickLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Por favor, informe o login e a senha.');
      return;
    }
    const result = login(username, password);
    if (!result.success) {
      setError(result.message || 'Credenciais inválidas.');
    }
  };

  const handleSelectDemo = (role: UserRole) => {
    if (role === 'operador') {
      setUsername('operador');
      setPassword('operador123');
    } else {
      setUsername('mecanico');
      setPassword('mecanico123');
    }
    quickLogin(role);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-900/50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header visual */}
        <div className="bg-slate-900 p-6 text-white text-center relative border-b border-slate-800">
          <div className="mx-auto w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 mb-3 shadow">
            <Wrench className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Portal de Chamados de Manutenção
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Controle de Ordens de Serviço · Manutenção & Operação
          </p>
        </div>

        {/* Credentials guide box */}
        <div className="p-6">
          <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Acessos pré-configurados do sistema:</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleSelectDemo('operador')}
                className="text-left p-2.5 bg-white rounded border border-slate-200 hover:border-amber-500 hover:shadow-xs transition-all group"
              >
                <div className="flex items-center gap-1.5 text-amber-700 font-semibold mb-0.5">
                  <HardHat className="w-3.5 h-3.5" />
                  <span>Operador</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Login: <span className="font-semibold text-slate-800">operador</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Senha: <span className="font-semibold text-slate-800">operador123</span>
                </div>
                <span className="text-[10px] text-amber-600 font-medium group-hover:underline mt-1.5 block">
                  Entrar com 1 clique →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemo('mecanico')}
                className="text-left p-2.5 bg-white rounded border border-slate-200 hover:border-blue-500 hover:shadow-xs transition-all group"
              >
                <div className="flex items-center gap-1.5 text-blue-700 font-semibold mb-0.5">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Mecânico</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Login: <span className="font-semibold text-slate-800">mecanico</span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Senha: <span className="font-semibold text-slate-800">mecanico123</span>
                </div>
                <span className="text-[10px] text-blue-600 font-medium group-hover:underline mt-1.5 block">
                  Entrar com 1 clique →
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Usuário / Login
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="operador ou mecanico"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-mono"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors font-mono"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <span>Autenticar no Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
