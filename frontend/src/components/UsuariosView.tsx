import React, { useState } from 'react';
import type { Usuario, PerfilUsuario } from '../types';
import { UserPlus, Shield, Trash2, X, Search, Lock, User, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { api } from '../api';

interface UsuariosViewProps {
  usuarios: Usuario[];
  currentUser: Usuario | null;
  onRefresh: () => void;
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({ usuarios, currentUser, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  // Alterar Senha state
  const [userToChangePassword, setUserToChangePassword] = useState<Usuario | null>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [senhaLoading, setSenhaLoading] = useState(false);
  const [senhaError, setSenhaError] = useState<string | null>(null);
  const [senhaSuccess, setSenhaSuccess] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToChangePassword) return;

    if (novaSenha.length < 3) {
      setSenhaError('A nova senha deve ter no mínimo 3 caracteres.');
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setSenhaError('As senhas digitadas não coincidem. Verifique e tente novamente.');
      return;
    }

    try {
      setSenhaLoading(true);
      setSenhaError(null);
      await api.updateSenhaUsuario(userToChangePassword.id, novaSenha);
      setSenhaSuccess('Senha alterada com sucesso!');
      setTimeout(() => {
        setUserToChangePassword(null);
        setNovaSenha('');
        setConfirmarNovaSenha('');
        setSenhaSuccess(null);
        onRefresh();
      }, 1200);
    } catch (err: any) {
      setSenhaError(err.response?.data?.detail || 'Erro ao alterar senha do usuário.');
    } finally {
      setSenhaLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    perfil: 'RH' as PerfilUsuario,
    cargo: 'Analista de RH'
  });

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createUsuario(formData);
      setIsAddModalOpen(false);
      setFormData({
        nome: '',
        email: '',
        senha: '',
        perfil: 'RH',
        cargo: 'Analista de RH'
      });
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao cadastrar usuário');
    }
  };

  const handleDelete = async (user: Usuario) => {
    if (currentUser && currentUser.id === user.id) {
      alert('Você não pode excluir sua própria conta enquanto estiver conectado.');
      return;
    }

    try {
      await api.deleteUsuario(user.id);
      setUserToDelete(null);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao excluir usuário');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-dia-navy flex items-center gap-2 tracking-tight">
            <Shield className="w-6 h-6 text-amber-500" />
            Gestão de Usuários do Sistema
          </h2>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Cadastre novos administradores de TI ou usuários do setor de RH com acesso controlado.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-extrabold shadow-md transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Novo Usuário do Sistema</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Buscar usuário por nome, e-mail ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 text-slate-900 placeholder-slate-400 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-dia-navy"
          />
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-dia-navy">Usuários Com Acesso Cadastrado</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-dia-navy text-xs uppercase text-white font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Nome do Usuário</th>
                <th className="py-3.5 px-4">Usuário de Acesso</th>
                <th className="py-3.5 px-4">Cargo / Função</th>
                <th className="py-3.5 px-4 text-center">Perfil de Acesso</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-slate-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span>{u.nome}</span>
                        {currentUser?.id === u.id && (
                          <span className="px-2 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">Você</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono font-medium text-slate-600">
                      <span className="font-extrabold text-dia-navy">{u.email.split('@')[0]}</span>
                      {u.email.includes('@') && (
                        <span className="text-slate-400 font-normal">@{u.email.split('@')[1]}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                      {u.cargo}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        u.perfil === 'ADMIN'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {u.perfil === 'ADMIN' ? '⚡ Administrador (TI)' : '👥 Setor de RH'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setUserToChangePassword(u);
                            setNovaSenha('');
                            setConfirmarNovaSenha('');
                            setSenhaError(null);
                            setSenhaSuccess(null);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 rounded-lg transition border border-slate-200"
                          title="Alterar Senha de Acesso"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setUserToDelete(u)}
                          disabled={currentUser?.id === u.id}
                          className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 disabled:opacity-30 rounded-lg transition border border-slate-200"
                          title={currentUser?.id === u.id ? 'Você não pode excluir sua própria conta' : 'Excluir Usuário'}
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

      {/* Modal Add User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-dia-navy">Cadastrar Novo Usuário do Sistema</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do usuário"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Usuário de Acesso *</label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="nome.sobrenome (ex: carlos.silva)"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 text-slate-900 text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Pode digitar apenas nome.sobrenome.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Senha de Acesso *</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Senha do usuário"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      className="w-full bg-slate-50 text-slate-900 text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Perfil de Acesso *</label>
                  <select
                    value={formData.perfil}
                    onChange={(e) => setFormData({ ...formData, perfil: e.target.value as PerfilUsuario })}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="RH">👥 Setor RH (Colaboradores & Termos)</option>
                    <option value="ADMIN">⚡ Administrador (Acesso Total TI)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cargo / Função *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Analista de RH, Suporte TI"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
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
                  Cadastrar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation Delete */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-rose-700">Confirmar Exclusão de Usuário</h3>
              <button onClick={() => setUserToDelete(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 font-medium">
              Tem certeza que deseja remover o acesso do usuário <strong className="text-slate-900 font-bold">{userToDelete.nome}</strong> ({userToDelete.email})?
            </p>

            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(userToDelete)}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-extrabold shadow"
              >
                Excluir Usuário
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Alterar Senha */}
      {userToChangePassword && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-dia-navy">Alterar Senha de Acesso</h3>
                  <p className="text-xs text-slate-500 font-medium">Defina uma nova senha para este usuário</p>
                </div>
              </div>
              <button
                onClick={() => setUserToChangePassword(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info do Usuário */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-slate-900">{userToChangePassword.nome}</p>
                <p className="text-[11px] font-mono text-slate-500 font-medium">
                  Usuário: <span className="font-bold text-dia-navy">{userToChangePassword.email.split('@')[0]}</span>
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                userToChangePassword.perfil === 'ADMIN'
                  ? 'bg-blue-100 text-blue-900 border border-blue-200'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
              }`}>
                {userToChangePassword.perfil === 'ADMIN' ? 'Administrador' : 'RH'}
              </span>
            </div>

            {senhaError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold">
                {senhaError}
              </div>
            )}

            {senhaSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{senhaSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nova Senha *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 3 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-sm pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-dia-navy focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirmar Nova Senha *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    placeholder="Repita a nova senha"
                    value={confirmarNovaSenha}
                    onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-dia-navy focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUserToChangePassword(null)}
                  disabled={senhaLoading}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={senhaLoading}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-extrabold shadow-md transition flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{senhaLoading ? 'Salvando...' : 'Salvar Nova Senha'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
