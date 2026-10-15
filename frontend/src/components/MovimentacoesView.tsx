import React, { useState } from 'react';
import type { Equipamento, Funcionario, Movimentacao } from '../types';
import { RefreshCw, Plus, FileText, ArrowRight, X, CheckCircle, Upload, FileCheck, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { api } from '../api';
import { ConfirmModal } from './ConfirmModal';

interface MovimentacoesViewProps {
  movimentacoes: Movimentacao[];
  equipamentos: Equipamento[];
  funcionarios: Funcionario[];
  onRefresh: () => void;
}

export const MovimentacoesView: React.FC<MovimentacoesViewProps> = ({
  movimentacoes,
  equipamentos,
  funcionarios,
  onRefresh,
}) => {
  const [isModalEntregaOpen, setIsModalEntregaOpen] = useState(false);
  const [isModalDevolucaoOpen, setIsModalDevolucaoOpen] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  // Entrega state
  const [funcionarioId, setFuncionarioId] = useState<number | ''>('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('ALL');
  const [equipamentoId, setEquipamentoId] = useState<number | ''>('');
  const [condicaoEntrega, setCondicaoEntrega] = useState<string>('USADO');
  const [acessorios, setAcessorios] = useState<{ [key: string]: boolean }>({
    'Fonte de alimentação': true,
    'Cabo de rede': false,
    'Mouse': true,
    'Teclado': true,
    'Outros (Cabo HDMI / Bolsa)': false,
  });
  const [comentariosAdicionais, setComentariosAdicionais] = useState('');
  const [nomeGerente, setNomeGerente] = useState('');
  const [nomeResponsavelTi, setNomeResponsavelTi] = useState('');

  // Devolução state
  const [devolucaoEquipamentoId, setDevolucaoEquipamentoId] = useState<number | ''>('');
  const [condicaoDevolucao, setCondicaoDevolucao] = useState('PERFEITO_ESTADO');
  const [devolucaoObs, setDevolucaoObs] = useState('');

  const disponiveis = equipamentos.filter((e) => e.status === 'DISPONIVEL');
  const emUso = equipamentos.filter((e) => e.status === 'EM_USO');

  const handleEntregaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!funcionarioId || !equipamentoId) {
      alert('Selecione o colaborador e o equipamento.');
      return;
    }

    const acessoriosSelecionados = Object.keys(acessorios).filter((k) => acessorios[k]).join(', ');

    try {
      const mov = await api.createMovimentacao({
        funcionario_id: Number(funcionarioId),
        equipamento_id: Number(equipamentoId),
        tipo_movimentacao: 'ENTREGA',
        acessorios_inclusos: acessoriosSelecionados,
        condicao_entrega: condicaoEntrega,
        comentarios_adicionais: comentariosAdicionais,
        nome_gerente: nomeGerente,
        nome_responsavel_ti: nomeResponsavelTi,
      });

      setIsModalEntregaOpen(false);
      setFuncionarioId('');
      setEquipamentoId('');
      setComentariosAdicionais('');

      setGeneratedPdfUrl(api.getTermoPdfUrl(mov.id));
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao registrar entrega');
    }
  };

  const handleDevolucaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devolucaoEquipamentoId) {
      alert('Selecione o equipamento a ser devolvido.');
      return;
    }

    const lastMov = movimentacoes.find(
      (m) => m.equipamento_id === Number(devolucaoEquipamentoId) && m.tipo_movimentacao === 'ENTREGA'
    );

    if (!lastMov) {
      alert('Não foi possível identificar o responsável atual pelo equipamento.');
      return;
    }

    try {
      await api.createMovimentacao({
        funcionario_id: lastMov.funcionario_id,
        equipamento_id: Number(devolucaoEquipamentoId),
        tipo_movimentacao: 'DEVOLUCAO',
        observacoes: devolucaoObs,
      });

      setIsModalDevolucaoOpen(false);
      setDevolucaoEquipamentoId('');
      setDevolucaoObs('');
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao registrar devolução');
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

  const [termoToDeleteId, setTermoToDeleteId] = useState<number | null>(null);
  const [isDeletingTermo, setIsDeletingTermo] = useState(false);

  const confirmDeleteAssinado = async () => {
    if (!termoToDeleteId) return;

    try {
      setIsDeletingTermo(true);
      await api.deleteTermoAssinado(termoToDeleteId);
      setTermoToDeleteId(null);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Erro ao remover termo assinado.');
    } finally {
      setIsDeletingTermo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar with Strong Navy Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-dia-navy flex items-center gap-2 tracking-tight">
            <RefreshCw className="w-6 h-6 text-amber-500" />
            Termos de Responsabilidade & Movimentações
          </h2>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Emissão oficial do Termo DIA Distribuição por Guarda e Uso de Equipamentos.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsModalEntregaOpen(true)}
            className="flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-extrabold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Termo de Entrega</span>
          </button>
          <button
            onClick={() => setIsModalDevolucaoOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-dia-navy hover:bg-dia-navy-dark text-white rounded-xl text-sm font-bold shadow-md transition"
          >
            <ArrowRight className="w-4 h-4 text-amber-400" />
            <span>Registrar Devolução</span>
          </button>
        </div>
      </div>

      {/* PDF Success Alert if generated */}
      {generatedPdfUrl && (
        <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <p className="text-base font-extrabold text-emerald-950">Termo de Responsabilidade Gerado com Sucesso!</p>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">
                O arquivo PDF segue 100% o modelo oficial da <b>DIA DISTRIBUIÇÃO E IMPORTAÇÃO AFOGADOS LTDA</b> (Recife/PE).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={generatedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-sm font-extrabold transition flex items-center gap-2 shadow"
            >
              <FileText className="w-4 h-4" />
              Imprimir / Baixar Termo (PDF)
            </a>
            <button onClick={() => setGeneratedPdfUrl(null)} className="text-slate-400 hover:text-slate-700 text-xs px-2">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Movimentações Table - Crisp White Container with Navy Headers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-sm font-bold text-dia-navy">Histórico de Termos Emitidos & Devoluções</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-dia-navy text-xs uppercase text-white font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Data</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Colaborador / CPF</th>
                <th className="py-3.5 px-4">Equipamento (Patrimônio)</th>
                <th className="py-3.5 px-4">Acessórios Inclusos</th>
                <th className="py-3.5 px-4 text-center">Status Termo</th>
                <th className="py-3.5 px-4 text-center">Documentos & Assinatura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movimentacoes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    Nenhuma movimentação registrada.
                  </td>
                </tr>
              ) : (
                movimentacoes.map((mov) => (
                  <tr key={mov.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 text-xs font-mono font-medium text-slate-600">
                      {new Date(mov.data_movimentacao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        mov.tipo_movimentacao === 'ENTREGA' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {mov.tipo_movimentacao}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{mov.funcionario?.nome}</div>
                      <div className="text-xs text-slate-500 font-mono">CPF: {mov.funcionario?.cpf}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-dia-navy font-mono text-xs">{mov.equipamento?.patrimonio}</div>
                      <div className="text-xs text-slate-600 font-medium">{mov.equipamento?.tipo} - {mov.equipamento?.marca} {mov.equipamento?.modelo}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 max-w-xs truncate font-medium">
                      {mov.acessorios_inclusos || 'Nenhum'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {mov.arquivo_termo_assinado ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Assinado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2">
                        {/* Botão para gerar/baixar termo original em branco */}
                        <a
                          href={api.getTermoPdfUrl(mov.id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-dia-navy rounded-lg text-xs font-bold transition border border-slate-200"
                          title="Baixar via original em branco (PDF DIA)"
                        >
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          Original
                        </a>

                        {/* Se já foi anexado o documento assinado */}
                        {mov.arquivo_termo_assinado ? (
                          <div className="flex items-center gap-1">
                            <a
                              href={api.getTermoAssinadoUrl(mov.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
                              title="Visualizar documento assinado anexado"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-amber-300" />
                              Ver Assinado
                            </a>

                            <label
                              className="cursor-pointer p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition border border-slate-200"
                              title="Substituir arquivo assinado"
                            >
                              <Upload className="w-3.5 h-3.5" />
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.png,.jpg,.jpeg"
                                disabled={uploadingId === mov.id}
                                onChange={(e) => handleFileUpload(mov.id, e)}
                              />
                            </label>

                            <button
                              onClick={() => setTermoToDeleteId(mov.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition border border-rose-200"
                              title="Remover arquivo assinado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          /* Se ainda não foi anexado */
                          <label
                            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                              uploadingId === mov.id
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-dia-navy hover:bg-dia-navy-dark text-white'
                            }`}
                            title="Anexar documento assinado (PDF, JPG ou PNG)"
                          >
                            <Upload className="w-3.5 h-3.5 text-amber-400" />
                            <span>{uploadingId === mov.id ? 'Enviando...' : 'Anexar Assinado'}</span>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.png,.jpg,.jpeg"
                              disabled={uploadingId === mov.id}
                              onChange={(e) => handleFileUpload(mov.id, e)}
                            />
                          </label>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Entrega */}
      {isModalEntregaOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-dia-navy">Emitir Termo de Responsabilidade (Entrega)</h3>
                <p className="text-xs text-amber-600 font-bold">DIA DISTRIBUIÇÃO E IMPORTAÇÃO AFOGADOS LTDA</p>
              </div>
              <button onClick={() => setIsModalEntregaOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEntregaSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Colaborador / Responsável *</label>
                  <select
                    required
                    value={funcionarioId}
                    onChange={(e) => setFuncionarioId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-dia-navy"
                  >
                    <option value="">-- Selecione o colaborador --</option>
                    {funcionarios.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome} (CPF: {f.cpf})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Filtrar Categoria *</label>
                  <select
                    value={categoriaFiltro}
                    onChange={(e) => {
                      setCategoriaFiltro(e.target.value);
                      setEquipamentoId('');
                    }}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-dia-navy font-bold text-dia-navy"
                  >
                    <option value="ALL">Todas as Categorias</option>
                    <option value="Notebook">💻 Notebook</option>
                    <option value="Celular">📱 Celular</option>
                    <option value="Outros">📦 Outros (Impressora, Switch, etc)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Equipamento Disponível *</label>
                  <select
                    required
                    value={equipamentoId}
                    onChange={(e) => setEquipamentoId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-dia-navy"
                  >
                    <option value="">-- Selecione o equipamento --</option>
                    {disponiveis
                      .filter((eq) => {
                        if (categoriaFiltro === 'ALL') return true;
                        if (categoriaFiltro === 'Notebook') {
                          return eq.categoria === 'Notebook' || eq.tipo?.toLowerCase().includes('notebook');
                        }
                        if (categoriaFiltro === 'Celular') {
                          return eq.categoria === 'Celular' || eq.tipo?.toLowerCase().includes('celular') || eq.tipo?.toLowerCase().includes('smartphone');
                        }
                        if (categoriaFiltro === 'Outros') {
                          return (
                            eq.categoria !== 'Notebook' &&
                            eq.categoria !== 'Celular' &&
                            !eq.tipo?.toLowerCase().includes('notebook') &&
                            !eq.tipo?.toLowerCase().includes('celular')
                          );
                        }
                        return true;
                      })
                      .map((eq) => {
                        const icon = (eq.categoria === 'Notebook' || eq.tipo?.toLowerCase().includes('notebook')) ? '💻' :
                                     (eq.categoria === 'Celular' || eq.tipo?.toLowerCase().includes('celular')) ? '📱' : '📦';
                        return (
                          <option key={eq.id} value={eq.id}>
                            {icon} [{eq.patrimonio}] {eq.marca} {eq.modelo} {eq.numero_serie ? `(SN: ${eq.numero_serie})` : ''}
                          </option>
                        );
                      })}
                  </select>
                </div>
              </div>

              {/* Acessórios Inclusos */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <label className="block text-xs font-bold text-amber-950 mb-2">Acessórios Entregues Junto com o Equipamento:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.keys(acessorios).map((key) => (
                    <label key={key} className="flex items-center space-x-2 text-xs text-amber-900 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acessorios[key]}
                        onChange={(e) => setAcessorios({ ...acessorios, [key]: e.target.checked })}
                        className="rounded border-amber-300 text-amber-600 focus:ring-0"
                      />
                      <span>{key}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Condição & Nomes para Assinatura */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Condição do Ativo</label>
                  <select
                    value={condicaoEntrega}
                    onChange={(e) => setCondicaoEntrega(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="NOVO">( X ) Equipamento Novo</option>
                    <option value="USADO">( X ) Usado (Perfeitas Condições)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Gerente</label>
                  <input
                    type="text"
                    placeholder="Ex: Roberto Alves"
                    value={nomeGerente}
                    onChange={(e) => setNomeGerente(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">TI</label>
                  <input
                    type="text"
                    placeholder="TI"
                    value={nomeResponsavelTi}
                    onChange={(e) => setNomeResponsavelTi(e.target.value)}
                    className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Comentários Adicionais sobre o Equipamento</label>
                <textarea
                  placeholder="Instruções ou detalhes adicionais..."
                  value={comentariosAdicionais}
                  onChange={(e) => setComentariosAdicionais(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200 h-20"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalEntregaOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={disponiveis.length === 0}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-sm font-extrabold shadow"
                >
                  Gerar Termo Oficial DIA (PDF)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Devolução */}
      {isModalDevolucaoOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-dia-navy">Registrar Devolução de Equipamento</h3>
              <button onClick={() => setIsModalDevolucaoOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleDevolucaoSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Equipamento a Devolver (Atualmente Em Uso) *</label>
                <select
                  required
                  value={devolucaoEquipamentoId}
                  onChange={(e) => setDevolucaoEquipamentoId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="">-- Escolha o equipamento em uso --</option>
                  {emUso.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      [{eq.patrimonio}] {eq.tipo} - {eq.marca} {eq.modelo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Condição na Devolução</label>
                <select
                  value={condicaoDevolucao}
                  onChange={(e) => setCondicaoDevolucao(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200"
                >
                  <option value="PERFEITO_ESTADO">( X ) Em perfeito estado</option>
                  <option value="DEFEITO">( X ) Apresentando defeito</option>
                  <option value="FALTANDO_PECAS">( X ) Faltando peças ou acessórios</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observações da Devolução</label>
                <textarea
                  placeholder="Descreva eventuais avarias ou componentes faltantes..."
                  value={devolucaoObs}
                  onChange={(e) => setDevolucaoObs(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-sm p-2.5 rounded-xl border border-slate-200 h-20"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalDevolucaoOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-extrabold shadow"
                >
                  Registrar Devolução
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Remover Termo Assinado */}
      <ConfirmModal
        isOpen={!!termoToDeleteId}
        onClose={() => setTermoToDeleteId(null)}
        onConfirm={confirmDeleteAssinado}
        isLoading={isDeletingTermo}
        title="Remover Termo Assinado"
        description="Confirmação de exclusão do documento anexado"
        warningNote="O arquivo digitalizado será removido do sistema e o status desta movimentação retornará para 'Pendente de Assinatura'."
        confirmText="Sim, Remover Termo"
        cancelText="Cancelar"
        isDanger={true}
      />
    </div>
  );
};
