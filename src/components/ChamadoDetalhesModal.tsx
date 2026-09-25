import React from 'react';
import { Chamado } from '../types/index.ts';
import { X, Wrench, HardHat, Clock, AlertTriangle, CheckCircle2, PackageCheck, FileText, Printer } from 'lucide-react';

interface ChamadoDetalhesModalProps {
  chamado: Chamado | null;
  isOpen: boolean;
  onClose: () => void;
  onIniciarAtendimento?: (id: string) => void;
  onEncerrar?: (chamado: Chamado) => void;
  userRole?: string;
}

export const ChamadoDetalhesModal: React.FC<ChamadoDetalhesModalProps> = ({
  chamado,
  isOpen,
  onClose,
  onIniciarAtendimento,
  onEncerrar,
  userRole,
}) => {
  if (!isOpen || !chamado) return null;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const statusMap = {
    aberto: { label: 'Aguardando Atendimento', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    em_atendimento: { label: 'Em Manutenção', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    encerrado: { label: 'Concluído e Encerrado', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  };

  const prioridadeColor = {
    baixa: 'text-slate-700 bg-slate-100',
    media: 'text-amber-700 bg-amber-100',
    alta: 'text-orange-700 bg-orange-100',
    critica: 'text-rose-700 bg-rose-100 font-bold',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-400 font-bold">
                  ORDEM DE SERVIÇO #{chamado.numero}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${statusMap[chamado.status].color}`}>
                  {statusMap[chamado.status].label}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {chamado.titulo}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Imprimir O.S."
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm text-slate-800">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Equipamento:</span>
              <strong className="text-slate-900 block">{chamado.equipamento}</strong>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Setor Fabril:</span>
              <strong className="text-slate-900 block">{chamado.setor}</strong>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Prioridade:</span>
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] uppercase ${prioridadeColor[chamado.prioridade]}`}>
                {chamado.prioridade}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Status da Linha:</span>
              {chamado.parou_producao ? (
                <span className="font-bold text-rose-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Parada Imediata
                </span>
              ) : (
                <span className="text-slate-700">Operando com restrição</span>
              )}
            </div>
          </div>

          {/* Seção 1: Relatório do Operador */}
          <div className="border border-amber-200/80 rounded-lg p-4 bg-amber-50/20">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/60 mb-3">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                <HardHat className="w-4 h-4 text-amber-600" />
                <span>Abertura pelo Operador</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {formatDate(chamado.aberto_em)}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Descrição Minuciosa da Ocorrência:
                </span>
                <p className="text-slate-800 text-sm whitespace-pre-line leading-relaxed bg-white p-3 rounded border border-slate-200">
                  {chamado.descricao_problema}
                </p>
              </div>

              {chamado.sintomas && (
                <div className="text-xs">
                  <span className="font-semibold text-slate-700">Sintomas / Ruídos observados: </span>
                  <span className="text-slate-600">{chamado.sintomas}</span>
                </div>
              )}

              <div className="text-[11px] text-slate-500 font-mono">
                Registrado por: <strong>{chamado.aberto_por}</strong>
              </div>
            </div>
          </div>

          {/* Seção 2: Relatório do Mecânico (se em atendimento ou encerrado) */}
          {(chamado.status === 'em_atendimento' || chamado.status === 'encerrado') && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/20">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200 mb-3">
                <div className="flex items-center gap-2 text-blue-900 font-semibold text-xs">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>Intervenção da Manutenção Mecânica</span>
                </div>
                {chamado.encerrado_em && (
                  <span className="text-xs text-slate-500 font-mono">
                    Concluído em: {formatDate(chamado.encerrado_em)}
                  </span>
                )}
              </div>

              {chamado.status === 'em_atendimento' && !chamado.solucao_descricao ? (
                <div className="p-3 bg-blue-50 text-blue-800 rounded text-xs flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>
                    Chamado assumido por <strong>{chamado.em_atendimento_por}</strong> em {formatDate(chamado.em_atendimento_em)}. Manutenção física em andamento no equipamento.
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block mb-1">
                      O que foi realizado (Ação Corretiva do Mecânico):
                    </span>
                    <p className="text-slate-800 text-sm whitespace-pre-line leading-relaxed bg-white p-3 rounded border border-slate-200">
                      {chamado.solucao_descricao}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {chamado.causa_raiz && (
                      <div className="bg-white p-2.5 rounded border border-slate-200">
                        <span className="font-semibold text-slate-700 block">Causa Raiz Identificada:</span>
                        <span className="text-slate-600">{chamado.causa_raiz}</span>
                      </div>
                    )}
                    {chamado.tempo_gasto_minutos && (
                      <div className="bg-white p-2.5 rounded border border-slate-200">
                        <span className="font-semibold text-slate-700 block">Tempo Total de Intervenção:</span>
                        <span className="text-slate-900 font-mono font-bold">{chamado.tempo_gasto_minutos} minutos</span>
                      </div>
                    )}
                  </div>

                  {chamado.pecas_utilizadas && (
                    <div className="text-xs bg-white p-2.5 rounded border border-slate-200">
                      <span className="font-semibold text-slate-700 block">Peças e Insumos Trocados:</span>
                      <span className="text-slate-600">{chamado.pecas_utilizadas}</span>
                    </div>
                  )}

                  {chamado.testes_realizados && (
                    <div className="text-xs bg-emerald-50/70 p-2.5 rounded border border-emerald-200 text-emerald-900 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Testes Operacionais Realizados:</span>
                        <span className="text-emerald-800">{chamado.testes_realizados}</span>
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 font-mono">
                    Encerrado e assinado por: <strong>{chamado.encerrado_por}</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            ID do registro: {chamado.id}
          </span>

          <div className="flex items-center gap-2">
            {userRole === 'mecanico' && chamado.status === 'aberto' && onIniciarAtendimento && (
              <button
                onClick={() => {
                  onIniciarAtendimento(chamado.id);
                  onClose();
                }}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow transition-colors flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Assumir Atendimento</span>
              </button>
            )}

            {userRole === 'mecanico' && chamado.status !== 'encerrado' && onEncerrar && (
              <button
                onClick={() => {
                  onClose();
                  onEncerrar(chamado);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Encerrar Chamado</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-white transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
