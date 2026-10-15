export type StatusEquipamento = 'DISPONIVEL' | 'EM_USO' | 'MANUTENCAO' | 'DESCARTADO';
export type TipoMovimentacao = 'ENTREGA' | 'DEVOLUCAO';
export type PerfilUsuario = 'ADMIN' | 'RH';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  cargo: string;
}

export interface Funcionario {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  cargo: string;
  departamento: string;
  created_at: string;
}

export interface Equipamento {
  id: number;
  patrimonio: string;
  numero_serie?: string;
  categoria: 'Desktop' | 'Notebook' | 'Impressora' | 'Celular' | 'Monitor' | 'Switch' | 'Periféricos' | 'Cabos' | 'Outros' | string;
  tipo: string;
  marca: string;
  modelo: string;
  setor?: string;
  responsavel?: string;
  processador?: string;
  memoria?: string;
  tamanho_disco?: string;
  sistema_operacional?: string;
  especificacoes?: string;
  quantidade: number;
  condicao_inicial: string;
  status: StatusEquipamento;
  valor?: number;
  data_aquisicao?: string;
  created_at: string;
}

export interface Movimentacao {
  id: number;
  equipamento_id: number;
  funcionario_id: number;
  tipo_movimentacao: TipoMovimentacao;
  acessorios_inclusos?: string;
  condicao_entrega?: string;
  comentarios_adicionais?: string;
  nome_gerente?: string;
  nome_responsavel_ti?: string;
  data_movimentacao: string;
  data_devolucao?: string;
  condicao_devolucao?: string;
  observacoes_devolucao?: string;
  assinado: boolean;
  arquivo_termo_assinado?: string;
  equipamento: Equipamento;
  funcionario: Funcionario;
}

export interface DashboardStats {
  total_equipamentos: number;
  equipamentos_em_uso: number;
  equipamentos_disponiveis: number;
  equipamentos_manutencao: number;
  total_funcionarios: number;
  total_movimentacoes: number;
  total_cabos_acessorios: number;
}
