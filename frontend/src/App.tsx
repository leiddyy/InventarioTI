import { useEffect, useState } from 'react';
import { api } from './api';
import type { DashboardStats, Equipamento, Funcionario, Movimentacao, Usuario } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { EquipamentosView } from './components/EquipamentosView';
import { FuncionariosView } from './components/FuncionariosView';
import { MovimentacoesView } from './components/MovimentacoesView';
import { UsuariosView } from './components/UsuariosView';
import { LoginView } from './components/LoginView';
import { ShieldCheck, Code2 } from 'lucide-react';

export function App() {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('usuario_logado');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token');
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'equipamentos' | 'funcionarios' | 'movimentacoes' | 'usuarios'>(() => {
    const savedUser = localStorage.getItem('usuario_logado');
    if (savedUser) {
      const u = JSON.parse(savedUser) as Usuario;
      if (u.perfil === 'RH') return 'funcionarios';
    }
    return 'dashboard';
  });

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLoginSuccess = (user: Usuario, authToken: string) => {
    setUsuario(user);
    setToken(authToken);
    localStorage.setItem('usuario_logado', JSON.stringify(user));
    localStorage.setItem('auth_token', authToken);

    if (user.perfil === 'RH') {
      setActiveTab('funcionarios');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('usuario_logado');
    localStorage.removeItem('auth_token');
  };

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [s, e, f, m, u] = await Promise.all([
        api.getStats(),
        api.getEquipamentos(),
        api.getFuncionarios(),
        api.getMovimentacoes(),
        api.getUsuarios()
      ]);
      setStats(s);
      setEquipamentos(e);
      setFuncionarios(f);
      setMovimentacoes(m);
      setUsuarios(u);
    } catch (err) {
      console.error('Erro ao carregar dados do inventário:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  // Se não estiver logado, exibe a Tela de Login
  if (!token || !usuario) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        usuario={usuario}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading && !stats ? (
          <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
            Carregando módulo do sistema...
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && usuario.perfil === 'ADMIN' && (
              <Dashboard
                stats={stats}
                recentMovimentacoes={movimentacoes}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'equipamentos' && usuario.perfil === 'ADMIN' && (
              <EquipamentosView
                equipamentos={equipamentos}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'funcionarios' && (
              <FuncionariosView
                funcionarios={funcionarios}
                movimentacoes={movimentacoes}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'movimentacoes' && (
              <MovimentacoesView
                movimentacoes={movimentacoes}
                equipamentos={equipamentos}
                funcionarios={funcionarios}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'usuarios' && usuario.perfil === 'ADMIN' && (
              <UsuariosView
                usuarios={usuarios}
                currentUser={usuario}
                onRefresh={loadData}
              />
            )}
          </>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs py-4 px-4 mt-auto shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2 text-slate-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-dia-navy shrink-0" />
            <span>© {new Date().getFullYear()} DIA DISTRIBUIÇÃO E IMPORTAÇÃO AFOGADOS LTDA. Todos os direitos reservados.</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-mono text-[11px] font-bold">
              v2.7.0 Enterprise
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center space-x-1.5 text-slate-800 font-bold">
              <Code2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Desenvolvido por <strong className="text-dia-navy font-extrabold">Leidiane Silva</strong></span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
