import React from 'react';
import type { DashboardStats, Movimentacao } from '../types';
import { Laptop, CheckCircle2, UserCheck, RefreshCw, FileText, ArrowUpRight, PlusCircle, Cable } from 'lucide-react';
import { api } from '../api';

interface DashboardProps {
  stats: DashboardStats | null;
  recentMovimentacoes: Movimentacao[];
  onNavigate: (tab: 'dashboard' | 'equipamentos' | 'funcionarios' | 'movimentacoes') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, recentMovimentacoes, onNavigate }) => {
  if (!stats) return <div className="p-8 text-center text-slate-500 font-medium">Carregando painel...</div>;

  const cards = [
    { title: 'Total de Ativos Cadastrados', value: stats.total_equipamentos, icon: Laptop, color: 'text-dia-navy bg-blue-50 border-blue-200' },
    { title: 'Notebooks / PCs Em Uso', value: stats.equipamentos_em_uso, icon: UserCheck, color: 'text-indigo-900 bg-indigo-50 border-indigo-200' },
    { title: 'Disponíveis em Estoque', value: stats.equipamentos_disponiveis, icon: CheckCircle2, color: 'text-emerald-900 bg-emerald-50 border-emerald-200' },
    { title: 'Cabos & Periféricos (Unid)', value: stats.total_cabos_acessorios, icon: Cable, color: 'text-amber-900 bg-amber-50 border-amber-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Corporate Banner in Light Theme with Navy & Gold Accent */}
      <div className="bg-dia-navy text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-8 border-amber-500">
        <div>
          <h2 className="text-xl font-extrabold tracking-wide">DIA Distribuição e Importação Afogados LTDA</h2>
          <p className="text-sm text-slate-200 mt-1">
            Sistema Oficial de Inventário de TI & Emissão de Termo de Responsabilidade por Guarda e Uso.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('movimentacoes')}
            className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-extrabold shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Emitir Novo Termo</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid - Light Cards with White Background */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.title}</span>
                <div className={`p-2.5 rounded-xl ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-dia-navy mt-3">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary Overview - White Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-dia-navy flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-500" />
              Últimos Termos Emitidos & Empréstimos
            </h3>
            <button
              onClick={() => onNavigate('movimentacoes')}
              className="text-xs text-dia-navy hover:text-amber-600 flex items-center gap-1 font-bold"
            >
              Ver histórico completo <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentMovimentacoes.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">Nenhum termo registrado recente.</p>
            ) : (
              recentMovimentacoes.slice(0, 5).map((mov) => (
                <div key={mov.id} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        mov.tipo_movimentacao === 'ENTREGA' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {mov.tipo_movimentacao}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{mov.funcionario?.nome}</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {mov.equipamento?.tipo} - {mov.equipamento?.marca} {mov.equipamento?.modelo} (<b className="text-dia-navy">{mov.equipamento?.patrimonio}</b>)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500">
                      {new Date(mov.data_movimentacao).toLocaleDateString('pt-BR')}
                    </span>
                    <a
                      href={api.getTermoPdfUrl(mov.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-dia-navy hover:bg-dia-navy-dark text-white rounded-lg transition flex items-center gap-1.5 text-xs font-bold shadow-sm"
                      title="Gerar Termo PDF Oficial DIA"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      Termo PDF
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Summary Box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-dia-navy mb-4">Conformidade Legal & TI</h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Colaboradores no Sistema:</span>
                <span className="font-extrabold text-dia-navy">{stats.total_funcionarios}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Total de Termos Gerados:</span>
                <span className="font-extrabold text-dia-navy">{stats.total_movimentacoes}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 font-medium">Cidade Base:</span>
                <span className="font-extrabold text-dia-navy">Recife / PE</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-900 font-medium leading-relaxed">
                📄 <b>Modelo Oficial DIA:</b> O Termo em PDF gerado obedece à Lei nº 10.261/68 (Art 241, 245) e Lei nº 709/93 (Art 37, 39) com os campos para assinatura do Colaborador, Gerente e TI.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('equipamentos')}
            className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-dia-navy rounded-xl text-sm font-bold transition text-center border border-slate-300"
          >
            Ver Inventário Completo
          </button>
        </div>
      </div>
    </div>
  );
};
