from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models import StatusEquipamento, TipoMovimentacao, PerfilUsuario

# Auth & User Schemas
class LoginRequest(BaseModel):
    email: str
    senha: str

class UsuarioBase(BaseModel):
    nome: str
    email: str
    perfil: PerfilUsuario = PerfilUsuario.RH
    cargo: str

class UsuarioCreate(UsuarioBase):
    senha: str

class UsuarioUpdateSenha(BaseModel):
    nova_senha: str

class UsuarioResponse(UsuarioBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    token: str
    usuario: UsuarioResponse

# Funcionário Schemas
class FuncionarioBase(BaseModel):
    nome: str
    email: str
    cpf: str
    cargo: str
    departamento: str

class FuncionarioCreate(FuncionarioBase):
    pass

class FuncionarioResponse(FuncionarioBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Equipamento Schemas
class EquipamentoBase(BaseModel):
    patrimonio: str
    numero_serie: Optional[str] = "N/A"
    categoria: str = "Notebook"
    tipo: str
    marca: str
    modelo: str
    setor: Optional[str] = "TI / Estoque"
    responsavel: Optional[str] = "Estoque"
    processador: Optional[str] = None
    memoria: Optional[str] = None
    tamanho_disco: Optional[str] = None
    sistema_operacional: Optional[str] = None
    especificacoes: Optional[str] = None
    quantidade: int = 1
    condicao_inicial: str = "USADO"
    status: StatusEquipamento = StatusEquipamento.DISPONIVEL
    valor: Optional[float] = None
    data_aquisicao: Optional[str] = None

class EquipamentoCreate(EquipamentoBase):
    pass

class EquipamentoUpdate(BaseModel):
    patrimonio: Optional[str] = None
    numero_serie: Optional[str] = None
    categoria: Optional[str] = None
    tipo: Optional[str] = None
    marca: Optional[str] = None
    modelo: Optional[str] = None
    setor: Optional[str] = None
    responsavel: Optional[str] = None
    processador: Optional[str] = None
    memoria: Optional[str] = None
    tamanho_disco: Optional[str] = None
    sistema_operacional: Optional[str] = None
    especificacoes: Optional[str] = None
    quantidade: Optional[int] = None
    condicao_inicial: Optional[str] = None
    status: Optional[StatusEquipamento] = None
    valor: Optional[float] = None
    data_aquisicao: Optional[str] = None

class EquipamentoResponse(EquipamentoBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Movimentação Schemas
class MovimentacaoBase(BaseModel):
    equipamento_id: int
    funcionario_id: int
    tipo_movimentacao: TipoMovimentacao = TipoMovimentacao.ENTREGA
    acessorios_inclusos: Optional[str] = None
    condicao_entrega: Optional[str] = "USADO"
    comentarios_adicionais: Optional[str] = None
    nome_gerente: Optional[str] = None
    nome_responsavel_ti: Optional[str] = None

class MovimentacaoCreate(MovimentacaoBase):
    pass

class MovimentacaoResponse(BaseModel):
    id: int
    equipamento_id: int
    funcionario_id: int
    tipo_movimentacao: TipoMovimentacao
    data_movimentacao: datetime
    acessorios_inclusos: Optional[str] = None
    condicao_entrega: Optional[str] = "USADO"
    comentarios_adicionais: Optional[str] = None
    nome_gerente: Optional[str] = None
    nome_responsavel_ti: Optional[str] = None
    data_devolucao: Optional[datetime] = None
    condicao_devolucao: Optional[str] = None
    observacoes_devolucao: Optional[str] = None
    assinado: bool
    arquivo_termo_assinado: Optional[str] = None
    equipamento: EquipamentoResponse
    funcionario: FuncionarioResponse

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_equipamentos: int
    equipamentos_em_uso: int
    equipamentos_disponiveis: int
    equipamentos_manutencao: int
    total_funcionarios: int
    total_movimentacoes: int
    total_cabos_acessorios: int
