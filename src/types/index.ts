export type UserRole = 'operador' | 'mecanico';

export interface User {
  username: string;
  name: string;
  role: UserRole;
  setor?: string;
  registro?: string;
}

export type ChamadoStatus = 'aberto' | 'em_atendimento' | 'encerrado';

export type ChamadoPrioridade = 'baixa' | 'media' | 'alta' | 'critica';

export interface Chamado {
  id: string;
  numero: number;
  titulo: string;
  equipamento: string;
  setor: string;
  prioridade: ChamadoPrioridade;
  status: ChamadoStatus;
  
  // Informações do Operador
  descricao_problema: string;
  sintomas?: string;
  parou_producao: boolean;
  aberto_por: string;
  aberto_em: string;
  
  // Informações do Mecânico
  em_atendimento_por?: string;
  em_atendimento_em?: string;
  solucao_descricao?: string;
  causa_raiz?: string;
  pecas_utilizadas?: string;
  tempo_gasto_minutos?: number;
  testes_realizados?: string;
  encerrado_por?: string;
  encerrado_em?: string;
  
  created_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isCustom: boolean;
  error?: string | null;
}
