import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, ArrowRight, UserCheck, KeyRound } from 'lucide-react';
import { api } from '../api';
import type { Usuario } from '../types';

interface LoginViewProps {
  onLoginSuccess: (usuario: Usuario, token: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('leidiane.silva@diadistribuicao.com.br');
  const [senha, setSenha] = useState('123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email, senha);
      onLoginSuccess(res.usuario, res.token);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erro ao realizar login. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('leidiane.silva@diadistribuicao.com.br');
    setSenha('123');
  };

  const fillRH = () => {
    setEmail('mariana.rh@diadistribuicao.com.br');
    setSenha('123');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between items-center p-4 sm:p-6 text-slate-800 font-sans">
      
      <div className="w-full max-w-md my-auto space-y-6">
        
        {/* Official DIA Company Logo Badge */}
        <div className="text-center space-y-4">
          <div className="inline-block p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/80">
            <img
              src="/logo-dia.png"
              alt="DIA Distribuição Logo"
              className="h-16 sm:h-20 w-auto object-contain mx-auto"
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-dia-navy uppercase">
              DIA DISTRIBUIÇÃO E IMPORTAÇÃO
            </h1>
            <p className="text-xs font-bold text-amber-600 mt-1 uppercase tracking-wider flex items-center justify-center gap-1.5">
              <span>●</span> Controle de Acesso por Perfil (Admin / RH) <span>●</span>
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-dia-navy flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Acesso ao Sistema
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Informe seu e-mail corporativo para continuar.</p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                E-mail Corporativo / Usuário
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@diadistribuicao.com.br"
                  className="w-full bg-slate-50 text-slate-900 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-dia-navy focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 text-slate-900 text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-dia-navy focus:bg-white focus:ring-2 focus:ring-amber-500/20 transition font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 font-extrabold rounded-xl text-sm shadow-md shadow-amber-500/30 transition flex items-center justify-center gap-2 group"
            >
              {loading ? (
                'Autenticando...'
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Credentials for ADMIN and RH */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] text-slate-400 font-bold uppercase text-center tracking-wider">
              Atalhos de Demonstração:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillAdmin}
                className="px-3 py-2 bg-dia-navy text-white rounded-xl text-xs font-bold hover:bg-dia-navy-dark transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Admin (TI)
              </button>
              <button
                type="button"
                onClick={fillRH}
                className="px-3 py-2 bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-200 transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                Setor RH
              </button>
            </div>
          </div>
        </div>

        {/* Developer Credit Badge */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 shadow-sm">
            <span>Desenvolvido por</span>
            <span className="font-extrabold text-dia-navy">
              Leidiane Silva
            </span>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-slate-500 font-medium">
        DIA DISTRIBUIÇÃO E IMPORTAÇÃO AFOGADOS LTDA • Recife/PE
      </footer>
    </div>
  );
};
