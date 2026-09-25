import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Chamado, ChamadoPrioridade } from '../types/index.ts';
import { X, AlertTriangle, HardHat, Check, Wrench } from 'lucide-react';

interface NovoChamadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (chamado: Omit<Chamado, 'id' | 'numero'>) => Promise<void>;
}

const EQUIPAMENTOS_SUGERIDOS = [
  'Prensa Hidráulica 250T (PH-03)',
  'Centro de Usinagem CNC (MC-02)',
  'Torno CNC Mazak Quick Turn (TC-01)',
  'Injetora Plástica Romi 150T (INJ-04)',
  'Esteira Transportadora Linha 03 (ET-03)',
  'Ponte Rolante 10 Toneladas (PR-01)',
  'Compressor de Parafuso Atlas Copco (CP-02)',
  'Robô de Solda Yaskawa Motoman (RS-01)',
];

const SETORES = [
  'Estamparia Pesada',
  'Usinagem de Precisão',
  'Injeção Plástica',
  'Linha de Montagem',
  'Caldeiraria & Solda',
  'Pintura Industrial',
  'Logística & Expedição',
  'Utilidades & Compressores',
];

export const NovoChamadoModal: React.FC<NovoChamadoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuth();

  const [titulo, setTitulo] = useState('');
  const [equipamento, setEquipamento] = useState('');
  const [setor, setSetor] = useState(SETORES[0]);
  const [prioridade, setPrioridade] = useState<ChamadoPrioridade>('alta');
  const [descricaoProblema, setDescricaoProblema] = useState('');
  const [sintomas, setSintomas] = useState('');
  const [parouProducao, setParouProducao] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titulo.trim() || !equipamento.trim() || !descricaoProblema.trim()) {
      setError('Por favor preencha todos os campos obrigatórios (Título, Equipamento e Descrição).');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        titulo: titulo.trim(),
        equipamento: equipamento.trim(),
        setor: setor.trim(),
        prioridade,
        status: 'aberto',
        descricao_problema: descricaoProblema.trim(),
        sintomas: sintomas.trim() || undefined,
        parou_producao: parouProducao,
        aberto_por: `${user?.name || 'Operador'} (${user?.username || 'operador'})`,
        aberto_em: new Date().toISOString(),
      });

      // Reset
      setTitulo('');
      setEquipamento('');
      setDescricaoProblema('');
      setSintomas('');
      setParouProducao(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar chamado.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-950">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight text-white">
                Abertura de Chamado de Manutenção
              </h3>
              <p className="text-xs text-slate-400">
                Operador: {user?.name || 'Operador'} · Registro: {user?.registro || 'OP-4821'}
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Linha 1: Título do Chamado */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Título / Assunto da Falha <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Vazamento de óleo hidráulico com queda de pressão"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              required
            />
          </div>

          {/* Linha 2: Equipamento e Setor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Equipamento / Máquina <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="equipamentos-list"
                value={equipamento}
                onChange={(e) => setEquipamento(e.target.value)}
                placeholder="Selecione ou digite a máquina"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                required
              />
              <datalist id="equipamentos-list">
                {EQUIPAMENTOS_SUGERIDOS.map((eq) => (
                  <option key={eq} value={eq} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Setor / Área Fabril <span className="text-rose-500">*</span>
              </label>
              <select
                value={setor}
                onChange={(e) => setSetor(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                {SETORES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Linha 3: Grau de Prioridade e Status da Linha */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                Grau de Gravidade / Prioridade
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['baixa', 'media', 'alta', 'critica'] as ChamadoPrioridade[]).map((p) => {
                  const isSelected = prioridade === p;
                  const labels = {
                    baixa: 'Baixa',
                    media: 'Média',
                    alta: 'Alta',
                    critica: 'Crítica',
                  };
                  const colors = {
                    baixa: isSelected ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-700',
                    media: isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700',
                    alta: isSelected ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700',
                    critica: isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700',
                  };
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrioridade(p)}
                      className={`py-1.5 text-xs font-semibold rounded transition-all text-center ${colors[p]}`}
                    >
                      {labels[p]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 md:pt-0">
              <label className="relative flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={parouProducao}
                  onChange={(e) => {
                    setParouProducao(e.target.checked);
                    if (e.target.checked) setPrioridade('critica');
                  }}
                  className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500 border-slate-300"
                />
                <div className="text-xs">
                  <span className="font-bold text-rose-700 block">
                    Parada de Produção (Máquina Inoperante)
                  </span>
                  <span className="text-slate-500 text-[11px] block">
                    Linha parada aguardando socorro imediato
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Linha 4: Descrição Detalhada do Problema */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Descrição Detalhada do Problema <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={descricaoProblema}
              onChange={(e) => setDescricaoProblema(e.target.value)}
              placeholder="Descreva minuciosamente o que você observou: o que a máquina estava produzindo, quando o problema começou, se houve travamento mecânico, cheiro de queimado ou alarme no painel..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              required
            />
          </div>

          {/* Linha 5: Sintomas e Sinais Visuais/Auditivos */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Sintomas, Ruídos ou Códigos de Erro (Opcional)
            </label>
            <input
              type="text"
              value={sintomas}
              onChange={(e) => setSintomas(e.target.value)}
              placeholder="Ex: Estalos metálicos no fuso, fumaça branca na parte traseira, código E-204"
              className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Modal Footer */}
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
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 rounded-lg shadow transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Gravando chamado...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Registrar e Enviar para Manutenção</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
