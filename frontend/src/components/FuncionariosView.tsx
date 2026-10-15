import React, { useState } from 'react';
import type { Funcionario, Movimentacao } from '../types';
import { Users, Plus, Search, UserCheck, X, HardDrive, FileText, Trash2, Upload, FileCheck, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../api';
import { ConfirmModal } from './ConfirmModal';

interface FuncionariosViewProps {
  funcionarios: Funcionario[];
  movimentacoes: Movimentacao[];
  onRefresh: () => void;
}

export const FuncionariosView: React.FC<FuncionariosViewProps> = ({ funcionarios, movimentacoes, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState<Funcionario | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    cargo: '',
    departamento: 'Tecnologia da Informação'
  });

  const filteredFuncionarios = funcionarios.filter(
    (f) =>
      f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.cpf.includes(searchTerm) ||
      f.departamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createFuncionario(formData);
      setIsAddModalOpen(false);
      setFormData({
        nome: '',
        email: '',
        cpf: '',
        cargo: '',
        departamento: 'Tecnologia da Informação'
      });
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao cadastrar funcionário');
    }
  };

  const getActiveEquipmentForFuncionario = (funcId: number) => {
    return movimentacoes.filter(
      (m) => m.funcionario_id === funcId && m.tipo_movimentacao === 'ENTREGA' && m.equipamento?.status === 'EM_USO'
    );
  };

  const [funcionarioToDelete, setFuncionarioToDelete] = useState<Funcionario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteFuncionario = async () => {
    if (!funcionarioToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteFuncionario(funcionarioToDelete.id);
      setFuncionarioToDelete(null);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao excluir colaborador');
    } finally {
      setIsDeleting(false);
    }
  };

  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const handleFileUpload = async (movId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('O arquivo selecionado é muito grande. O limite máximo é de 20MB.');
      return;
    }

    try {
      setUploadingId(movId);
      await api.uploadTermoAssinado(movId, file);
      onRefresh();
      alert('Termo assinado anexado com sucesso!');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao anexar arquivo do termo assinado.');
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-dia-navy flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            Quadro de Colaboradores
          </h2>
          <p className="text-sm text-slate-500">Gerencie os colaboradores autorizados a receber e utilizar ativos de TI.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-extrabold shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Colaborador</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Buscar por nome, e-mail, CPF ou departamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-dia-navy"
          />
        </div>
      </div>

      {/* Grid of Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFuncionarios.length === 0 ? (
          <div className="col-span-full py-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            Nenhum colaborador encontrado.
          </div>
        ) : (
          filteredFuncionarios.map((func) => {
            const activeItems = getActiveEquipmentForFuncionario(func.id);
            return (
              <div key={func.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-extrabold text-dia-navy text-base">{func.nome}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">{func.departamento}</span>
                  </div>
                  <p className="text-xs text-amber-600 font-bold mb-3">{func.cargo}</p>

                  <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                    <p><span className="text-slate-400">CPF:</span> {func.cpf}</p>
                    <p><span className="text-slate-400">E-mail:</span> {func.email}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <b>{activeItems.length}</b> ativo(s) vinculado(s)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedFuncionario(func)}
                      className="text-xs text-dia-navy hover:text-amber-600 font-extrabold underline"
                    >
                      Ver Ativos & Termos
                    </button>
                    <button
                      onClick={() => setFuncionarioToDelete(func)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition border border-rose-200"
                      title="Excluir Colaborador (Demissão)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Add Employee */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-dia-navy">Novo Colaborador</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do funcionário"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="email@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cargo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Analista de TI"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Departamento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TI, RH, Financeiro"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  />
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
                  Cadastrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Modal of Employee's Active Assets */}
      {selectedFuncionario && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-dia-navy">{selectedFuncionario.nome}</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedFuncionario.cargo} • {selectedFuncionario.departamento}</p>
              </div>
              <button onClick={() => setSelectedFuncionario(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-amber-500" />
              Equipamentos Atribuídos Atualmentes:
            </h4>

            <div className="space-y-3">
              {getActiveEquipmentForFuncionario(selectedFuncionario.id).length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">Nenhum equipamento vinculado a este colaborador no momento.</p>
              ) : (
                getActiveEquipmentForFuncionario(selectedFuncionario.id).map((m) => (
                  <div key={m.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-dia-navy text-xs">{m.equipamento?.patrimonio}</span>
                        {m.arquivo_termo_assinado ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Assinado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-500" />
                            Pendente
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{m.equipamento?.tipo} - {m.equipamento?.marca} {m.equipamento?.modelo}</p>
                      <p className="text-xs text-slate-500">Nº de Série: {m.equipamento?.numero_serie || 'N/A'}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={api.getTermoPdfUrl(m.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-dia-navy rounded-lg text-xs font-bold transition"
                        title="Baixar via original (PDF)"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-600" />
                        Original
                      </a>

                      {m.arquivo_termo_assinado ? (
                        <a
                          href={api.getTermoAssinadoUrl(m.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
                          title="Visualizar documento assinado anexado"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-amber-300" />
                          Ver Assinado
                        </a>
                      ) : (
                        <label
                          className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                            uploadingId === m.id
                              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                              : 'bg-dia-navy hover:bg-dia-navy-dark text-white'
                          }`}
                          title="Anexar documento assinado (PDF, JPG ou PNG)"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>{uploadingId === m.id ? 'Enviando...' : 'Anexar Assinado'}</span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.png,.jpg,.jpeg"
                            disabled={uploadingId === m.id}
                            onChange={(e) => handleFileUpload(m.id, e)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={!!funcionarioToDelete}
        onClose={() => setFuncionarioToDelete(null)}
        onConfirm={confirmDeleteFuncionario}
        isLoading={isDeleting}
        title="Excluir Colaborador"
        description="Confirmação de desligamento / demissão"
        itemName={funcionarioToDelete?.nome}
        itemBadge={funcionarioToDelete?.departamento}
        itemSub={funcionarioToDelete ? `CPF: ${funcionarioToDelete.cpf} • ${funcionarioToDelete.cargo}` : ''}
        warningNote="Se houver equipamentos vinculados a este colaborador, eles serão devolvidos ao estoque imediatamente com status Disponível."
        confirmText="Sim, Excluir Colaborador"
        cancelText="Cancelar"
        isDanger={true}
      />
    </div>
  );
};
