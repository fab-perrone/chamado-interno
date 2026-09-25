import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/Header.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { NovoChamadoModal } from './components/NovoChamadoModal.tsx';
import { EncerrarChamadoModal } from './components/EncerrarChamadoModal.tsx';
import { ChamadoDetalhesModal } from './components/ChamadoDetalhesModal.tsx';
import { SupabaseConfigModal } from './components/SupabaseConfigModal.tsx';
import { StatsOverview } from './components/StatsOverview.tsx';
import { ChamadoCard } from './components/ChamadoCard.tsx';
import {
  fetchAllChamados,
  insertChamado,
  updateChamadoStatus,
  getStoredConfig,
  getSupabaseClient,
} from './lib/supabase.ts';
import { Chamado, ChamadoStatus, ChamadoPrioridade } from './types/index.ts';
import {
  Search,
  Plus,
  Filter,
  Wrench,
  HardHat,
  Database,
  RefreshCw,
  AlertCircle,
  FileQuestion,
  CheckCircle,
} from 'lucide-react';

function MainDashboard() {
  const { user, quickLogin } = useAuth();

  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>('local');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | ChamadoStatus>('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState<'todas' | ChamadoPrioridade>('todas');

  // Modals state
  const [isNovoModalOpen, setIsNovoModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [detalhesChamado, setDetalhesChamado] = useState<Chamado | null>(null);
  const [encerrarChamado, setEncerrarChamado] = useState<Chamado | null>(null);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setIsLoading(true);
    const result = await fetchAllChamados();
    setChamados(result.chamados);
    setDataSource(result.source);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNovoChamado = async (novo: Omit<Chamado, 'id' | 'numero'>) => {
    const res = await insertChamado(novo);
    setChamados((prev) => [res.chamado, ...prev.filter((c) => c.id !== res.chamado.id)]);
    showToast(
      `Chamado #${res.chamado.numero} registrado com sucesso (${res.source === 'supabase' ? 'Salvo no Supabase' : 'Salvo localmente'})!`
    );
  };

  const handleIniciarAtendimento = async (id: string) => {
    if (!user) return;
    const res = await updateChamadoStatus(id, {
      status: 'em_atendimento',
      em_atendimento_por: `${user.name} (${user.username})`,
      em_atendimento_em: new Date().toISOString(),
    });
    setChamados((prev) => prev.map((c) => (c.id === id ? res.chamado : c)));
    showToast(`Chamado #${res.chamado.numero} colocado em atendimento!`);
  };

  const handleEncerrarChamado = async (id: string, updates: Partial<Chamado>) => {
    const res = await updateChamadoStatus(id, updates);
    setChamados((prev) => prev.map((c) => (c.id === id ? res.chamado : c)));
    showToast(`Chamado #${res.chamado.numero} concluído e encerrado com sucesso!`);
  };

  const cfg = getStoredConfig();
  const supabaseConnected = dataSource === 'supabase' || !!(cfg.url && cfg.anonKey && getSupabaseClient());

  // Filtered Chamados
  const filteredChamados = useMemo(() => {
    return chamados.filter((c) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = c.titulo.toLowerCase().includes(q);
        const matchEquip = c.equipamento.toLowerCase().includes(q);
        const matchNum = c.numero.toString().includes(q);
        const matchDesc = c.descricao_problema.toLowerCase().includes(q);
        const matchSetor = c.setor.toLowerCase().includes(q);
        if (!matchTitle && !matchEquip && !matchNum && !matchDesc && !matchSetor) {
          return false;
        }
      }

      // Status match
      if (statusFilter !== 'todos' && c.status !== statusFilter) {
        return false;
      }

      // Priority match
      if (prioridadeFilter !== 'todas' && c.prioridade !== prioridadeFilter) {
        return false;
      }

      return true;
    });
  }, [chamados, searchQuery, statusFilter, prioridadeFilter]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <LoginModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        onOpenNovoChamado={() => setIsNovoModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Role Banner & Quick Switch Assistant */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                user.role === 'operador' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}
            >
              {user.role === 'operador' ? <HardHat className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Módulo Ativo
                </span>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs font-semibold text-slate-700 capitalize">
                  Perfil {user.role}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {user.role === 'operador'
                  ? 'Painel do Operador · Registro e Acompanhamento de Falhas'
                  : 'Fila Técnica do Mecânico · Diagnóstico e Encerramento de O.S.'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden lg:inline">Alternar perfil de teste:</span>
            <button
              onClick={() => quickLogin(user.role === 'operador' ? 'mecanico' : 'operador')}
              className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium transition-colors flex items-center gap-1.5"
            >
              {user.role === 'operador' ? (
                <>
                  <Wrench className="w-3.5 h-3.5 text-blue-600" />
                  <span>Trocar para Mecânico</span>
                </>
              ) : (
                <>
                  <HardHat className="w-3.5 h-3.5 text-amber-600" />
                  <span>Trocar para Operador</span>
                </>
              )}
            </button>
            {user.role === 'operador' && (
              <button
                onClick={() => setIsNovoModalOpen(true)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Abrir Chamado</span>
              </button>
            )}
          </div>
        </div>

        {/* Statistical Overview */}
        <StatsOverview
          chamados={chamados}
          currentFilter={statusFilter}
          onFilterChange={(f) => setStatusFilter(f)}
        />

        {/* Search & Filtering Toolbar */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por equipamento, título, #OS, setor ou problema..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
              />
            </div>

            {/* Filter Tabs & Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
                {(
                  [
                    { id: 'todos', label: 'Todos' },
                    { id: 'aberto', label: 'Abertos' },
                    { id: 'em_atendimento', label: 'Em Atendimento' },
                    { id: 'encerrado', label: 'Encerrados' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      statusFilter === tab.id
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Priority Filter */}
              <select
                value={prioridadeFilter}
                onChange={(e) => setPrioridadeFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                aria-label="Filtrar por prioridade"
              >
                <option value="todas">Prioridade: Todas</option>
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica (Parada)</option>
              </select>

              <button
                onClick={loadData}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                title="Atualizar lista"
                aria-label="Atualizar lista"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Chamados Grid or Empty State */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-slate-400" />
            <p className="text-xs">Carregando ordens de serviço...</p>
          </div>
        ) : filteredChamados.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              Nenhum chamado encontrado
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Não existem chamados correspondentes aos filtros selecionados.
            </p>
            {user.role === 'operador' && (
              <button
                onClick={() => setIsNovoModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Abrir Novo Chamado</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChamados.map((c) => (
              <ChamadoCard
                key={c.id}
                chamado={c}
                userRole={user.role}
                onVerDetalhes={(item) => setDetalhesChamado(item)}
                onIniciarAtendimento={(id) => handleIniciarAtendimento(id)}
                onEncerrar={(item) => setEncerrarChamado(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs py-2.5 px-4 rounded-lg shadow-xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <NovoChamadoModal
        isOpen={isNovoModalOpen}
        onClose={() => setIsNovoModalOpen(false)}
        onSubmit={handleNovoChamado}
      />

      <EncerrarChamadoModal
        chamado={encerrarChamado}
        isOpen={!!encerrarChamado}
        onClose={() => setEncerrarChamado(null)}
        onSubmit={handleEncerrarChamado}
      />

      <ChamadoDetalhesModal
        chamado={detalhesChamado}
        isOpen={!!detalhesChamado}
        onClose={() => setDetalhesChamado(null)}
        onIniciarAtendimento={handleIniciarAtendimento}
        onEncerrar={(item) => setEncerrarChamado(item)}
        userRole={user.role}
      />

      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onConfigChanged={() => loadData()}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}
