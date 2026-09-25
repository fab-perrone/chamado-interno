import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Chamado } from '../types/index.ts';
import { X, Wrench, CheckCircle2, Clock, PackageCheck, AlertCircle } from 'lucide-react';

interface EncerrarChamadoModalProps {
  chamado: Chamado | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, updates: Partial<Chamado>) => Promise<void>;
}

export const EncerrarChamadoModal: React.FC<EncerrarChamadoModalProps> = ({
  chamado,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuth();

  const [solucaoDescricao, setSolucaoDescricao] = useState('');
  const [causaRaiz, setCausaRaiz] = useState('');
  const [pecasUtilizadas, setPecasUtilizadas] = useState('');
  const [tempoGastoMinutos, setTempoGastoMinutos] = useState<number>(45);
  const [testesRealizados, setTestesRealizados] = useState(
    'Teste de funcionamento contínuo a vazio e teste com carga operacional realizado com sucesso.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !chamado) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!solucaoDescricao.trim()) {
      setError('A descrição do que foi feito pelo mecânico é obrigatória.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(chamado.id, {
        status: 'encerrado',
        solucao_descricao: solucaoDescricao.trim(),
        causa_raiz: causaRaiz.trim() || 'Desgaste operacional comum',
        pecas_utilizadas: pecasUtilizadas.trim() || undefined,
        tempo_gasto_minutos: Number(tempoGastoMinutos) || 30,
        testes_realizados: testesRealizados.trim(),
        encerrado_por: `${user?.name || 'Mecânico'} (${user?.username || 'mecanico'})`,
        encerrado_em: new Date().toISOString(),
      });

      // Clear
      setSolucaoDescricao('');
      setCausaRaiz('');
      setPecasUtilizadas('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao encerrar chamado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                Encerramento de Chamado #{chamado.numero}
              </h3>
              <p className="text-xs text-slate-400">
                Mecânico Responsável: {user?.name || 'Mecânico'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Resumo do Chamado aberto pelo Operador */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs">
          <div className="flex items-center justify-between font-mono text-slate-500 mb-1">
            <span>Equipamento: <strong className="text-slate-800">{chamado.equipamento}</strong></span>
            <span>Setor: <strong className="text-slate-800">{chamado.setor}</strong></span>
          </div>
          <div className="mt-2 text-slate-700 bg-white p-2.5 rounded border border-slate-200">
            <span className="font-semibold text-slate-900 block mb-0.5">Problema Relatado pelo Operador:</span>
            <p className="text-slate-600 italic">"{chamado.descricao_problema}"</p>
            {chamado.sintomas && (
              <p className="mt-1 text-slate-500 text-[11px]">
                <strong>Sintomas:</strong> {chamado.sintomas}
              </p>
            )}
          </div>
        </div>

        {/* Formulário do Mecânico */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* O que foi feito */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              O que foi feito? (Descrição Técnica da Ação Corretiva) <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={solucaoDescricao}
              onChange={(e) => setSolucaoDescricao(e.target.value)}
              placeholder="Descreva detalhadamente a intervenção realizada: regulagem efetuada, componentes desmontados, retentores substituídos, sangria de ar, ajustes mecânicos, etc."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Causa Raiz */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Causa Raiz da Falha
              </label>
              <input
                type="text"
                value={causaRaiz}
                onChange={(e) => setCausaRaiz(e.target.value)}
                placeholder="Ex: Desgaste do anel de vedação, fadiga mecânica"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Tempo gasto */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Tempo Gasto de Manutenção (Minutos)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={tempoGastoMinutos}
                  onChange={(e) => setTempoGastoMinutos(Number(e.target.value))}
                  className="w-full pl-3.5 pr-14 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono tabular-nums"
                  required
                />
                <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">
                  minutos
                </span>
              </div>
            </div>
          </div>

          {/* Peças Utilizadas */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Peças, Componentes ou Insumos Utilizados (se houver)
            </label>
            <input
              type="text"
              value={pecasUtilizadas}
              onChange={(e) => setPecasUtilizadas(e.target.value)}
              placeholder="Ex: 1x Rolamento NSK 6205, 2L Óleo ISO VG 68, 1x Retentor Sabó 35x50x10"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Testes e Condições de Liberação */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Testes Realizados antes da Liberação da Máquina
            </label>
            <input
              type="text"
              value={testesRealizados}
              onChange={(e) => setTestesRealizados(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg shadow transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Salvando encerramento...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Concluir e Encerrar Chamado</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
