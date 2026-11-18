import React, { useState } from 'react';
import type { Usuario } from '../types';
import { Laptop, Users, RefreshCw, LayoutDashboard, LogOut, Menu, X, Sparkles, Shield, UserCheck, UserCog } from 'lucide-react';

interface NavbarProps {
  activeTab: 'dashboard' | 'equipamentos' | 'funcionarios' | 'movimentacoes' | 'usuarios';
  setActiveTab: (tab: 'dashboard' | 'equipamentos' | 'funcionarios' | 'movimentacoes' | 'usuarios') => void;
  usuario: Usuario | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, usuario, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // All possible nav items
  const allNavItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard, allowed: ['ADMIN'] },
    { id: 'equipamentos', label: 'Inventário de Ativos', icon: Laptop, allowed: ['ADMIN', 'OPERADOR'] },
    { id: 'funcionarios', label: 'Colaboradores', icon: Users, allowed: ['ADMIN', 'RH', 'OPERADOR'] },
    { id: 'movimentacoes', label: 'Termos & Movimentações', icon: RefreshCw, allowed: ['ADMIN', 'RH', 'OPERADOR'] },
    { id: 'usuarios', label: 'Gestão de Usuários', icon: UserCog, allowed: ['ADMIN'] },
  ] as const;

  const perfil = usuario?.perfil || 'ADMIN';
  const navItems = allNavItems.filter((item) => (item.allowed as readonly string[]).includes(perfil));

  const handleTabClick = (id: typeof activeTab) => {
    setActiveTab(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-dia-navy text-white sticky top-0 z-30 shadow-lg border-b-2 border-amber-500">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-2">

          {/* Left: Official DIA Logo & Header Title */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="p-1 bg-white rounded-lg shadow-sm shrink-0">
              <img
                src="/logo-dia.png"
                alt="DIA Distribuição"
                className="h-7 sm:h-8 w-auto object-contain"
              />
            </div>
            <div className="shrink-0 leading-tight">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-wide whitespace-nowrap">
                DIA Asset Control
              </h1>
              <p className="text-[10px] sm:text-[11px] text-amber-400 font-bold flex items-center gap-1 whitespace-nowrap">
                {perfil === 'RH' ? (
                  <>
                    <UserCheck className="w-3 h-3 text-amber-400 shrink-0" /> Módulo RH
                  </>
                ) : perfil === 'OPERADOR' ? (
                  <>
                    <Laptop className="w-3 h-3 text-emerald-400 shrink-0" /> Módulo Operador (Ativos & Termos)
                  </>
                ) : (
                  <>
                    <Shield className="w-3 h-3 text-amber-400 shrink-0" /> Módulo Admin TI
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Center: Flexible Navigation Bar */}
          <nav className="hidden lg:flex items-center space-x-1 bg-dia-navy-dark p-1 rounded-xl border border-blue-900/60 overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id as typeof activeTab)}
                  className={`flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 whitespace-nowrap ${isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: User Profile Information (Without initials avatar badge) */}
          <div className="hidden sm:flex items-center space-x-2.5 shrink-0">
            <div className="pl-3 border-l border-white/20 text-right shrink-0">
              <div className="flex items-center justify-end space-x-1">
                <span className={`px-1.5 py-0.2 rounded text-[9px] sm:text-[10px] font-black uppercase ${
                  perfil === 'RH'
                    ? 'bg-amber-400 text-slate-950'
                    : perfil === 'OPERADOR'
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-blue-400 text-slate-950'
                }`}>
                  {usuario?.perfil || 'ADMIN'}
                </span>
                <p className="text-xs font-bold text-white leading-tight whitespace-nowrap max-w-[140px] truncate">
                  {usuario?.nome || 'Leidiane Silva'}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-white/10 rounded-lg transition shrink-0"
              title="Sair do Sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center space-x-2 shrink-0">
            <button
              onClick={onLogout}
              className="sm:hidden p-2 text-slate-300 hover:text-rose-400 rounded-lg"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsible Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-dia-navy px-4 pt-3 pb-4 space-y-1.5 shadow-2xl">
          <div className="py-2.5 px-3 bg-dia-navy-dark rounded-xl mb-3 flex items-center justify-between border border-blue-900/60">
            <div>
              <div className="flex items-center space-x-1">
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                  perfil === 'RH'
                    ? 'bg-amber-400 text-slate-950'
                    : perfil === 'OPERADOR'
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-blue-400 text-slate-950'
                }`}>
                  {usuario?.perfil}
                </span>
                <p className="text-xs font-bold text-white">{usuario?.nome}</p>
              </div>
              <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                <Sparkles className="w-2.5 h-2.5" /> Dev: Leidiane Silva
              </p>
            </div>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id as typeof activeTab)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${isActive
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-200 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
