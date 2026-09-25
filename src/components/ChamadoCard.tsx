import React from 'react';
import { Chamado } from '../types/index.ts';
import { Wrench, HardHat, Clock, AlertTriangle, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';

interface ChamadoCardProps {
  chamado: Chamado;
  userRole?: string;
  onVerDetalhes: (chamado: Chamado) => void;
  onIniciarAtendimento?: (id: string) => void;
  onEncerrar?: (chamado: Chamado) => void;
}

export const ChamadoCard: React.FC<ChamadoCardProps> = ({
  chamado,
  userRole,
  onVerDetalhes,
  onIniciarAtendimento,
  onEncerrar,
}) => {
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMin = Math.round((Date.now() - new Date(dateStr).getTime()) / (1000 * 60));
      if (diffMin < 60) return `${diffMin}m atrás`;
      const diffHours = Math.round(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h atrás`;
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const statusConfig = {
    aberto: {
      label: 'Aguardando Mecânico',
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-700',
    },
    em_atendimento: {
      label: 'Em Atendimento',
      dotColor: 'bg-blue-500',
      textColor: 'text-blue-700',
    },
    encerrado: {
      label: 'Encerrado',
      dotColor: 'bg-emerald-500',
      textColor: 'text-emerald-700',
    },
  };

  const priorityColor = {
    baixa: 'text-slate-600',
    media: 'text-amber-700 font-medium',
    alta: 'text-orange-700 font-semibold',
    critica: 'text-rose-700 font-bold',
  };

  const currentStatus = statusConfig[chamado.status];

  return (
    <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-all p-4 text-left shadow-2xs hover:shadow-xs flex flex-col justify-between">
      <div>
        {/* Top bar with #OS and clean unboxed status */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900 tabular-nums">
              #{chamado.numero}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-700">{chamado.equipamento}</span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-xs">
            <span className={`w-2 h-2 rounded-full ${currentStatus.dotColor}`} />
            <span className={currentStatus.textColor}>{currentStatus.label}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-slate-900 mb-1.5 leading-snug line-clamp-1">
          {chamado.titulo}
        </h4>

        {/* Operator description */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {chamado.descricao_problema}
        </p>

        {/* If closed, show mechanic's resolution snippet */}
        {chamado.status === 'encerrado' && chamado.solucao_descricao && (
          <div className="mb-3 p-2 bg-slate-50 rounded border-l-2 border-emerald-500 text-xs">
            <div className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1 mb-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Ação do Mecânico ({chamado.tempo_gasto_minutos ? `${chamado.tempo_gasto_minutos} min` : 'Concluído'}):</span>
            </div>
            <p className="text-slate-600 line-clamp-2 text-[11px] italic">
              "{chamado.solucao_descricao}"
            </p>
          </div>
        )}

        {/* Clean unboxed metadata with dot separators */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mb-3 pt-2 border-t border-slate-100">
          <span>{chamado.setor}</span>
          <span aria-hidden="true">·</span>
          <span className={priorityColor[chamado.prioridade]}>
            Prioridade {chamado.prioridade.toUpperCase()}
          </span>
          {chamado.parou_producao && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3 inline" /> Linha Parada
              </span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formatTimeAgo(chamado.aberto_em)}</span>
        </div>
      </div>

      {/* Action buttons zone */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
        <div className="text-[11px] text-slate-400 truncate max-w-[170px]" title={chamado.aberto_por}>
          Por {chamado.aberto_por.split(' ')[0]}
        </div>

        <div className="flex items-center gap-2">
          {userRole === 'mecanico' && chamado.status === 'aberto' && onIniciarAtendimento && (
            <button
              onClick={() => onIniciarAtendimento(chamado.id)}
              className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors flex items-center gap-1"
              title="Iniciar atendimento técnico"
            >
              <Wrench className="w-3 h-3" />
              <span>Assumir</span>
            </button>
          )}

          {userRole === 'mecanico' && chamado.status !== 'encerrado' && onEncerrar && (
            <button
              onClick={() => onEncerrar(chamado)}
              className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors flex items-center gap-1 shadow-2xs"
              title="Encerrar chamado e registrar o que foi feito"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Encerrar</span>
            </button>
          )}

          <button
            onClick={() => onVerDetalhes(chamado)}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors flex items-center gap-1"
          >
            <span>Ver O.S.</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
