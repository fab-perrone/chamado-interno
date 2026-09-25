import React from 'react';
import { Chamado, ChamadoStatus } from '../types/index.ts';
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface StatsOverviewProps {
  chamados: Chamado[];
  currentFilter: 'todos' | ChamadoStatus;
  onFilterChange: (filter: 'todos' | ChamadoStatus) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  chamados,
  currentFilter,
  onFilterChange,
}) => {
  const total = chamados.length;
  const abertos = chamados.filter((c) => c.status === 'aberto').length;
  const emAtendimento = chamados.filter((c) => c.status === 'em_atendimento').length;
  const encerrados = chamados.filter((c) => c.status === 'encerrado').length;
  const paradasCriticas = chamados.filter((c) => c.parou_producao && c.status !== 'encerrado').length;

  return (
    <div className="space-y-4">
      {/* Critical downtime banner if any machine stopped */}
      {paradasCriticas > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-3 rounded-r-lg flex items-center justify-between text-xs text-rose-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>
              <strong>Atenção:</strong> {paradasCriticas} equipamento(s) com parada de produção imediata aguardando atendimento técnico mecânico.
            </span>
          </div>
          <button
            onClick={() => onFilterChange('aberto')}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 underline whitespace-nowrap"
          >
            Ver chamados críticos →
          </button>
        </div>
      )}

      {/* Metric Cards Grid - Single Elevation Depth */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onFilterChange('todos')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            currentFilter === 'todos'
              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={currentFilter === 'todos' ? 'text-slate-300' : 'text-slate-500'}>
              Total de Ordens
            </span>
            <Layers className={`w-3.5 h-3.5 ${currentFilter === 'todos' ? 'text-slate-300' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums">
            {total}
          </div>
        </button>

        <button
          onClick={() => onFilterChange('aberto')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            currentFilter === 'aberto'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs font-semibold'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={currentFilter === 'aberto' ? 'text-slate-900 font-medium' : 'text-slate-500'}>
              Aguardando
            </span>
            <AlertCircle className={`w-3.5 h-3.5 ${currentFilter === 'aberto' ? 'text-slate-950' : 'text-amber-500'}`} />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-600">
            <span className={currentFilter === 'aberto' ? 'text-slate-950' : ''}>{abertos}</span>
          </div>
        </button>

        <button
          onClick={() => onFilterChange('em_atendimento')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            currentFilter === 'em_atendimento'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={currentFilter === 'em_atendimento' ? 'text-blue-100' : 'text-slate-500'}>
              Em Manutenção
            </span>
            <Clock className={`w-3.5 h-3.5 ${currentFilter === 'em_atendimento' ? 'text-blue-200' : 'text-blue-500'}`} />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600">
            <span className={currentFilter === 'em_atendimento' ? 'text-white' : ''}>{emAtendimento}</span>
          </div>
        </button>

        <button
          onClick={() => onFilterChange('encerrado')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            currentFilter === 'encerrado'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={currentFilter === 'encerrado' ? 'text-emerald-100' : 'text-slate-500'}>
              Encerrados
            </span>
            <CheckCircle2 className={`w-3.5 h-3.5 ${currentFilter === 'encerrado' ? 'text-emerald-200' : 'text-emerald-500'}`} />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600">
            <span className={currentFilter === 'encerrado' ? 'text-white' : ''}>{encerrados}</span>
          </div>
        </button>
      </div>
    </div>
  );
};
