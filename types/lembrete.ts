export interface Lembrete {
  id: number;
  usuario_id: string; // UUID em formato string
  titulo: string;
  descricao?: string | null;
  data_lembrete: string; // formato ISO date: "YYYY-MM-DD"
  enviado: boolean;
  criado_em: string; // timestamp ISO
  recorrente_tipo?: string | null; // ex: 'diario', 'semanal', 'mensal'
  recorrente_ativo: boolean;
  hour: number; // 0-23
}

export interface LembreteRequest {
  id?: number; // opcional para criação, obrigatório para atualização
  titulo: string;
  descricao?: string;
  data_lembrete: string; // formato ISO date: "YYYY-MM-DD"
  enviado?: boolean;
  recorrente_tipo?: string;
  recorrente_ativo?: boolean;
  hour?: number; // 0-23, default 12
}

export interface LembreteResponse {
  success: boolean;
  data: Lembrete | Lembrete[] | { id: number };
  error?: string;
}
