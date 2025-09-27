export type TipoCategoria = 'essencial' | 'futil' | 'investimento' | null;

export interface Categoria {
  id: number;
  usuario_id: string; // UUID em formato string
  nome: string;
  tipo: TipoCategoria;
}

export interface CategoriaRequest {
  id?: number; // opcional para criação, obrigatório para atualização
  nome: string;
  tipo?: TipoCategoria;
}

export interface CategoriaResponse {
  success: boolean;
  data: Categoria | Categoria[] | { id: number };
  error?: string;
  transactionCount?: number; // usado quando tenta deletar uma categoria em uso
}
