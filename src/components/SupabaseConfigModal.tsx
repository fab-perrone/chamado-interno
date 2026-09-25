import React, { useState, useEffect } from 'react';
import {
  SUPABASE_SQL_SCHEMA,
  getStoredConfig,
  saveStoredConfig,
  clearStoredConfig,
  testSupabaseConnection,
  syncLocalToSupabase,
} from '../lib/supabase.ts';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Code2,
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableExists: boolean;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url, anonKey);
    setTestResult(res);
    setIsTesting(false);

    if (res.success) {
      saveStoredConfig(url, anonKey);
      onConfigChanged();
    }
  };

  const handleSaveWithoutTest = () => {
    saveStoredConfig(url, anonKey);
    onConfigChanged();
    onClose();
  };

  const handleClear = () => {
    clearStoredConfig();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    onConfigChanged();
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    } catch (e) {
      console.error('Falha ao copiar SQL:', e);
    }
  };

  const handleSyncLocal = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    const res = await syncLocalToSupabase();
    setIsSyncing(false);
    if (res.error) {
      setSyncResult(`Falha ao sincronizar: ${res.error}`);
    } else {
      setSyncResult(`Sucesso! ${res.count} chamados sincronizados com o Supabase.`);
      onConfigChanged();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 rounded-lg text-white">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                Integração com Banco de Dados Supabase
              </h3>
              <p className="text-xs text-slate-400">
                Armazenamento de chamados na nuvem em tempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Credenciais de Conexão</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-800 bg-white rounded-t'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Script SQL (Tabela chamados)</span>
          </button>
        </div>

        {/* Tab 1: Configuração das credenciais */}
        {activeTab === 'config' && (
          <div className="p-6 space-y-5">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">
                Como conectar com seu projeto Supabase:
              </p>
              <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                <li>
                  Acesse seu painel no <strong>Supabase</strong> (ou crie um projeto gratuito em supabase.com).
                </li>
                <li>
                  Vá na aba <strong>Project Settings → API</strong> e copie a <strong>Project URL</strong> e a <strong>anon public API key</strong>.
                </li>
                <li>
                  Cole abaixo e clique em <strong>Testar & Salvar Conexão</strong>. O sistema guardará os chamados diretamente na nuvem!
                </li>
              </ol>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block">
                    {testResult.success ? 'Conexão Estabelecida!' : 'Falha na Conexão'}
                  </span>
                  <span>{testResult.message}</span>
                  {testResult.success && !testResult.tableExists && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('sql')}
                      className="mt-1.5 block text-xs underline font-semibold text-emerald-900"
                    >
                      Clique aqui para ver e copiar o SQL da tabela →
                    </button>
                  )}
                </div>
              </div>
            )}

            {syncResult && (
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-xs">
                {syncResult}
              </div>
            )}

            <form onSubmit={handleTestAndSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="text"
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg shadow transition-colors flex items-center gap-2"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Testando conexão...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Testar & Salvar Conexão</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncLocal}
                    disabled={isSyncing || !url}
                    className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5"
                    title="Enviar chamados cadastrados localmente para a tabela no Supabase"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sincronizar chamados locais</span>
                  </button>
                </div>

                {url && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-xs text-rose-600 hover:underline"
                  >
                    Desconectar / Voltar ao Modo Local
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Script SQL pronto */}
        {activeTab === 'sql' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Script SQL Completo (Tabela + RLS + Políticas de Armazenamento/Storage)
                </span>
                <span className="text-xs text-slate-500">
                  Execute no SQL Editor do Supabase para criar tabelas, bucket 'manutencao-anexos' e todas as políticas ativadas
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopySql}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar SQL Completo</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono rounded-lg overflow-x-auto max-h-72 border border-slate-800 leading-relaxed select-all">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
              💡 <strong>Políticas de Armazenamento Ativadas:</strong> Este script ativa tanto as políticas de segurança da tabela relacional (RLS em <code>public.chamados</code>) quanto as políticas do serviço de <strong>Storage</strong> do Supabase (bucket <code>manutencao-anexos</code> em <code>storage.objects</code>) para permitir envio e visualização de fotos/anexos técnicos.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Compatível com Supabase PostgreSQL · RLS Ready
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
