import axios from 'axios';
import type { DashboardStats, Equipamento, Funcionario, Movimentacao, StatusEquipamento, Usuario, PerfilUsuario } from './types';

// URL da API configurada via .env (VITE_API_URL) ou dinâmica baseada no hostname atual
const ENV_API_URL = import.meta.env.VITE_API_URL;
const API_BASE = ENV_API_URL
  ? (ENV_API_URL.endsWith('/') ? ENV_API_URL.slice(0, -1) : ENV_API_URL)
  : `http://${window.location.hostname}:8000/api`;

export const api = {
  // Auth & Usuarios
  login: async (email: string, senha: string): Promise<{ token: string; usuario: Usuario }> => {
    const res = await axios.post(`${API_BASE}/auth/login`, { email, senha });
    return res.data;
  },

  getUsuarios: async (): Promise<Usuario[]> => {
    const res = await axios.get(`${API_BASE}/usuarios`);
    return res.data;
  },

  createUsuario: async (data: {
    nome: string;
    email: string;
    senha: string;
    perfil: PerfilUsuario;
    cargo: string;
  }): Promise<Usuario> => {
    const res = await axios.post(`${API_BASE}/usuarios`, data);
    return res.data;
  },

  deleteUsuario: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/usuarios/${id}`);
  },

  updateSenhaUsuario: async (id: number, novaSenha: string): Promise<void> => {
    await axios.put(`${API_BASE}/usuarios/${id}/senha`, { nova_senha: novaSenha });
  },

  // Stats
  getStats: async (): Promise<DashboardStats> => {
    const res = await axios.get(`${API_BASE}/dashboard/stats`);
    return res.data;
  },

  // Equipamentos
  getEquipamentos: async (status?: StatusEquipamento): Promise<Equipamento[]> => {
    const res = await axios.get(`${API_BASE}/equipamentos`, {
      params: status ? { status } : {}
    });
    return res.data;
  },

  createEquipamento: async (data: Omit<Equipamento, 'id' | 'created_at'>): Promise<Equipamento> => {
    const res = await axios.post(`${API_BASE}/equipamentos`, data);
    return res.data;
  },

  updateEquipamento: async (id: number, data: Partial<Equipamento>): Promise<Equipamento> => {
    const res = await axios.put(`${API_BASE}/equipamentos/${id}`, data);
    return res.data;
  },

  deleteEquipamento: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/equipamentos/${id}`);
  },

  // Funcionários
  getFuncionarios: async (): Promise<Funcionario[]> => {
    const res = await axios.get(`${API_BASE}/funcionarios`);
    return res.data;
  },

  createFuncionario: async (data: Omit<Funcionario, 'id' | 'created_at'>): Promise<Funcionario> => {
    const res = await axios.post(`${API_BASE}/funcionarios`, data);
    return res.data;
  },

  deleteFuncionario: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/funcionarios/${id}`);
  },

  // Movimentações
  getMovimentacoes: async (funcionario_id?: number, equipamento_id?: number): Promise<Movimentacao[]> => {
    const res = await axios.get(`${API_BASE}/movimentacoes`, {
      params: { funcionario_id, equipamento_id }
    });
    return res.data;
  },

  createMovimentacao: async (data: {
    equipamento_id: number;
    funcionario_id: number;
    tipo_movimentacao: 'ENTREGA' | 'DEVOLUCAO';
    acessorios_inclusos?: string;
    condicao_entrega?: string;
    comentarios_adicionais?: string;
    nome_gerente?: string;
    nome_responsavel_ti?: string;
    observacoes?: string;
  }): Promise<Movimentacao> => {
    const res = await axios.post(`${API_BASE}/movimentacoes`, data);
    return res.data;
  },

  getTermoPdfUrl: (movimentacao_id: number): string => {
    return `${API_BASE}/movimentacoes/${movimentacao_id}/termo-pdf`;
  },

  uploadTermoAssinado: async (movimentacao_id: number, file: File): Promise<Movimentacao> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/movimentacoes/${movimentacao_id}/upload-termo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getTermoAssinadoUrl: (movimentacao_id: number): string => {
    return `${API_BASE}/movimentacoes/${movimentacao_id}/termo-assinado`;
  },

  deleteTermoAssinado: async (movimentacao_id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/movimentacoes/${movimentacao_id}/termo-assinado`);
  },

  getInventoryExcelUrl: (): string => {
    return `${API_BASE}/equipamentos/export/excel`;
  },

  getInventoryPdfUrl: (): string => {
    return `${API_BASE}/equipamentos/export/pdf`;
  }
};
