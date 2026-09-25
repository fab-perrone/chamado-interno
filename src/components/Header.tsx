import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Wrench, HardHat, LogOut } from 'lucide-react';

interface HeaderProps {
  onOpenNovoChamado?: () => void;
  onOpenSupabaseConfig?: () => void;
  supabaseConnected?: boolean;
  supabaseUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNovoChamado,
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark with industrial emblem */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-amber-500 rounded-lg flex items-center justify-center text-slate-950 font-bold shadow-sm">
              <Wrench className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">
                SISTEMA DE CHAMADOS
              </span>
              <span className="text-[11px] text-slate-400 font-mono tracking-wider uppercase block">
                Manutenção Industrial
              </span>
            </div>
          </div>

          {/* Zone 2: Primary actions & User account */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {user.role === 'operador' && onOpenNovoChamado && (
                  <button
                    onClick={onOpenNovoChamado}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-md shadow transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>+ Abrir Chamado</span>
                  </button>
                )}

                <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-800/80 rounded-md border border-slate-700/80">
                  <div className="w-6 h-6 rounded flex items-center justify-center bg-slate-700 text-slate-200">
                    {user.role === 'operador' ? (
                      <HardHat className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <Wrench className="w-3.5 h-3.5 text-blue-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-medium text-slate-200 leading-tight">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono capitalize">
                      {user.role} · {user.registro || user.username}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                  title="Sair do sistema"
                  aria-label="Sair do sistema"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
