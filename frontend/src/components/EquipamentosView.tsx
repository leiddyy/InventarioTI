import React, { useState } from 'react';
import type { Equipamento, StatusEquipamento } from '../types';
import { Plus, Search, Filter, Laptop, Edit2, X, Check, Layers, UserCheck, Building2, FileSpreadsheet, FileText, Trash2 } from 'lucide-react';
import { api } from '../api';
import { ConfirmModal } from './ConfirmModal';
import { CustomSelect, type CustomSelectOption } from './CustomSelect';

interface EquipamentosViewProps {
  equipamentos: Equipamento[];
  onRefresh: () => void;
}

export const CATEGORIAS_LIST = [
  'Desktop',
  'Notebook',
  'Impressora',
  'Celular',
  'Monitor',
  'Switch',
  'Periféricos',
  'Cabos',
  'Outros'
] as const;

export const EquipamentosView: React.FC<EquipamentosViewProps> = ({ equipamentos, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipamento, setEditingEquipamento] = useState<Equipamento | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    patrimonio: '',
    numero_serie: '',
    categoria: 'Notebook',
    tipo: 'Notebook',
    marca: '',
    modelo: '',
    setor: 'TI / Estoque',
    responsavel: 'Estoque TI',
    processador: '',
    memoria: '',
    tamanho_disco: '',
    sistema_operacional: '',
    especificacoes: '',
    quantidade: 1,
    condicao_inicial: 'NOVO',
    status: 'DISPONIVEL' as StatusEquipamento,
    valor: '',
    data_aquisicao: ''
  });

  const filteredEquipamentos = equipamentos.filter((eq) => {
    const matchesSearch =
      eq.patrimonio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.numero_serie && eq.numero_serie.toLowerCase().includes(searchTerm.toLowerCase())) ||
      eq.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (eq.setor && eq.setor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (eq.responsavel && eq.responsavel.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || eq.status === statusFilter;
    const matchesCategoria = categoriaFilter === 'ALL' || eq.categoria === categoriaFilter;

    return matchesSearch && matchesStatus && matchesCategoria;
  });

  const categoriaOptions: CustomSelectOption[] = [
    { value: 'ALL', label: 'Todas as Categorias', count: equipamentos.length },
    ...CATEGORIAS_LIST.map((cat) => ({
      value: cat,
      label: cat,
      count: equipamentos.filter((e) => e.categoria === cat).length,
    })),
  ];

  const statusOptions: CustomSelectOption[] = [
    { value: 'ALL', label: 'Todos os Status', count: equipamentos.length },
    {
      value: 'DISPONIVEL',
      label: 'Disponível',
      colorDot: 'bg-emerald-500',
      count: equipamentos.filter((e) => e.status === 'DISPONIVEL').length,
    },
    {
      value: 'EM_USO',
      label: 'Em Uso',
      colorDot: 'bg-indigo-500',
      count: equipamentos.filter((e) => e.status === 'EM_USO').length,
    },
    {
      value: 'MANUTENCAO',
      label: 'Em Manutenção',
      colorDot: 'bg-amber-500',
      count: equipamentos.filter((e) => e.status === 'MANUTENCAO').length,
    },
    {
      value: 'DESCARTADO',
      label: 'Descartado',
      colorDot: 'bg-rose-500',
      count: equipamentos.filter((e) => e.status === 'DESCARTADO').length,
    },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createEquipamento({
        ...formData,
        valor: formData.valor ? parseFloat(formData.valor) : undefined
      });
      setIsAddModalOpen(false);
      setFormData({
        patrimonio: '',
        numero_serie: '',
        categoria: 'Notebook',
        tipo: 'Notebook',
        marca: '',
        modelo: '',
        setor: 'TI / Estoque',
        responsavel: 'Estoque TI',
        processador: '',
        memoria: '',
        tamanho_disco: '',
        sistema_operacional: '',
        especificacoes: '',
        quantidade: 1,
        condicao_inicial: 'NOVO',
        status: 'DISPONIVEL',
        valor: '',
        data_aquisicao: ''
      });
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao cadastrar equipamento');
    }
  };

  const handleUpdateStatus = async (eq: Equipamento, newStatus: StatusEquipamento) => {
    try {
      await api.updateEquipamento(eq.id, { status: newStatus });
      setEditingEquipamento(null);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao atualizar equipamento');
    }
  };

  const [equipamentoToDelete, setEquipamentoToDelete] = useState<Equipamento | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteEquipamento = async () => {
    if (!equipamentoToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteEquipamento(equipamentoToDelete.id);
      const deletedId = equipamentoToDelete.id;
      setEquipamentoToDelete(null);
      if (editingEquipamento?.id === deletedId) {
        setEditingEquipamento(null);
      }
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao excluir equipamento');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: StatusEquipamento) => {
    switch (status) {
      case 'DISPONIVEL':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Disponível</span>;
      case 'EM_USO':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">Em Uso</span>;
      case 'MANUTENCAO':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">Em Manutenção</span>;
      case 'DESCARTADO':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Descartado</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-dia-navy flex items-center gap-2">
            <Laptop className="w-5 h-5 text-amber-500" />
            Inventário Geral de TI
          </h2>
          <p className="text-sm text-slate-500">Controle de hardware, cabos, celulares, switches, periféricos, setor e responsável.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={api.getInventoryExcelUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-sm transition"
            title="Exportar dados completos em planilha Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Excel (.xlsx)</span>
          </a>
          <a
            href={api.getInventoryPdfUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2.5 bg-dia-navy hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm transition border border-dia-navy"
            title="Exportar relatório formatado em PDF (.pdf)"
          >
            <FileText className="w-4 h-4" />
            <span>PDF (.pdf)</span>
          </a>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-extrabold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Novo Ativo</span>
          </button>
        </div>
      </div>

      {/* Filters & Search - White Box */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por patrimônio, nº série, marca, setor ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-dia-navy focus:bg-white transition"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Categoria Filter */}
          <CustomSelect
            value={categoriaFilter}
            onChange={setCategoriaFilter}
            options={categoriaOptions}
            icon={<Layers className="w-4 h-4" />}
            placeholder="Todas as Categorias"
          />

          {/* Status Filter */}
          <CustomSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            icon={<Filter className="w-4 h-4" />}
            placeholder="Todos os Status"
          />

          {/* Botão de limpar filtros se algum estiver ativo */}
          {(categoriaFilter !== 'ALL' || statusFilter !== 'ALL' || searchTerm !== '') && (
            <button
              type="button"
              onClick={() => {
                setCategoriaFilter('ALL');
                setStatusFilter('ALL');
                setSearchTerm('');
              }}
              className="text-xs text-slate-500 hover:text-dia-navy font-bold px-3 py-2 hover:bg-slate-100 rounded-xl transition flex items-center gap-1 border border-transparent hover:border-slate-200"
              title="Limpar todos os filtros"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Table List - Crisp White Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-dia-navy text-xs uppercase text-white font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Patrimônio</th>
                <th className="py-3.5 px-4">Categoria / Tipo</th>
                <th className="py-3.5 px-4">Marca & Modelo</th>
                <th className="py-3.5 px-4">Setor de Uso</th>
                <th className="py-3.5 px-4">Responsável Atual</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">Qtd / Un</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEquipamentos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    Nenhum equipamento encontrado nesta busca.
                  </td>
                </tr>
              ) : (
                filteredEquipamentos.map((eq) => (
                  <tr key={eq.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-extrabold text-dia-navy">{eq.patrimonio}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                        {eq.categoria}
                      </span>
                      <div className="text-xs text-slate-500 font-medium mt-1">{eq.tipo}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{eq.marca} {eq.modelo}</div>
                      <div className="text-xs font-mono text-slate-400">SN: {eq.numero_serie || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{eq.setor || 'TI / Estoque'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{eq.responsavel || 'Estoque'}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {eq.quantidade > 1 ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-900 border border-purple-200 text-xs font-extrabold">
                          {eq.quantidade} un
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold">
                          1 un
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(eq.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setEditingEquipamento(eq)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-dia-navy rounded-lg transition border border-slate-300"
                          title="Alterar Status"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEquipamentoToDelete(eq)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition border border-rose-200"
                          title="Excluir Equipamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Equipment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-dia-navy">Cadastrar Novo Equipamento</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Categoria *</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value, tipo: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  >
                    {CATEGORIAS_LIST.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Equipamento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Notebook, Switch, Celular..."
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Patrimônio *</label>
                  <input
                    type="text"
                    required
                    placeholder="PAT-2026-010"
                    value={formData.patrimonio}
                    onChange={(e) => setFormData({ ...formData, patrimonio: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Marca *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dell, HP, Cisco..."
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Modelo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Latitude 5540..."
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nº de Série</label>
                  <input
                    type="text"
                    placeholder="SN-123456 ou N/A"
                    value={formData.numero_serie}
                    onChange={(e) => setFormData({ ...formData, numero_serie: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Setor e Responsável */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">Setor / Departamento em Uso *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TI, Comercial, RH, Logística"
                    value={formData.setor}
                    onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                    className="w-full bg-white text-slate-900 text-sm p-2 rounded-lg border border-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">Pessoa Responsável pelo Uso *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Leidiane Silva ou Estoque TI"
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    className="w-full bg-white text-slate-900 text-sm p-2 rounded-lg border border-amber-300"
                  />
                </div>
              </div>

              {/* Hardware Specs for Computers */}
              {(formData.categoria === 'Desktop' || formData.categoria === 'Notebook') && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <p className="text-xs font-bold text-dia-navy uppercase tracking-wider">Especificações do Computador</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Processador</label>
                      <input
                        type="text"
                        placeholder="Intel i7 13ª Ger"
                        value={formData.processador}
                        onChange={(e) => setFormData({ ...formData, processador: e.target.value })}
                        className="w-full bg-white text-slate-900 text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Memória RAM</label>
                      <input
                        type="text"
                        placeholder="16GB DDR4"
                        value={formData.memoria}
                        onChange={(e) => setFormData({ ...formData, memoria: e.target.value })}
                        className="w-full bg-white text-slate-900 text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Tamanho do Disco</label>
                      <input
                        type="text"
                        placeholder="512GB SSD"
                        value={formData.tamanho_disco}
                        onChange={(e) => setFormData({ ...formData, tamanho_disco: e.target.value })}
                        className="w-full bg-white text-slate-900 text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1">Sistema Operacional</label>
                      <input
                        type="text"
                        placeholder="Windows 11 Pro"
                        value={formData.sistema_operacional}
                        onChange={(e) => setFormData({ ...formData, sistema_operacional: e.target.value })}
                        className="w-full bg-white text-slate-900 text-xs p-2 rounded-lg border border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Condição</label>
                  <select
                    value={formData.condicao_inicial}
                    onChange={(e) => setFormData({ ...formData, condicao_inicial: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="NOVO">Equipamento Novo</option>
                    <option value="USADO">Usado (Perfeitas Condições)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Inicial</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusEquipamento })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="EM_USO">Em Uso</option>
                    <option value="MANUTENCAO">Em Manutenção</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-extrabold shadow"
                >
                  Salvar Equipamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {editingEquipamento && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-dia-navy">Alterar Status do Ativo</h3>
              <button onClick={() => setEditingEquipamento(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <p className="text-sm text-slate-900 font-bold">{editingEquipamento.patrimonio} - {editingEquipamento.marca} {editingEquipamento.modelo}</p>
              <p className="text-xs text-slate-500 mt-1">Setor atual: <b>{editingEquipamento.setor}</b> • Responsável: <b>{editingEquipamento.responsavel}</b></p>
            </div>

            <div className="space-y-2">
              {(['DISPONIVEL', 'EM_USO', 'MANUTENCAO', 'DESCARTADO'] as StatusEquipamento[]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(editingEquipamento, st)}
                  className={`w-full text-left p-3 rounded-xl border flex justify-between items-center transition ${
                    editingEquipamento.status === st
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-extrabold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{st === 'DISPONIVEL' ? 'Disponível' : st === 'EM_USO' ? 'Em Uso' : st === 'MANUTENCAO' ? 'Em Manutenção' : 'Descartado'}</span>
                  {editingEquipamento.status === st && <Check className="w-4 h-4 text-amber-600" />}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setEquipamentoToDelete(editingEquipamento);
                }}
                className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Ativo</span>
              </button>

              <button
                type="button"
                onClick={() => setEditingEquipamento(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão de Equipamento */}
      <ConfirmModal
        isOpen={!!equipamentoToDelete}
        onClose={() => setEquipamentoToDelete(null)}
        onConfirm={confirmDeleteEquipamento}
        isLoading={isDeleting}
        title="Excluir Equipamento"
        description="Confirmação de exclusão do inventário"
        itemName={equipamentoToDelete ? `${equipamentoToDelete.tipo} - ${equipamentoToDelete.marca} ${equipamentoToDelete.modelo}` : ''}
        itemBadge={equipamentoToDelete?.categoria}
        itemSub={equipamentoToDelete ? `Patrimônio: ${equipamentoToDelete.patrimonio} • S/N: ${equipamentoToDelete.numero_serie || 'N/A'}` : ''}
        warningNote="O histórico de termos e movimentações vinculado a este equipamento também será removido do sistema."
        confirmText="Sim, Excluir Equipamento"
        cancelText="Cancelar"
        isDanger={true}
      />
    </div>
  );
};
