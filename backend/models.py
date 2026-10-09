import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base

class StatusEquipamento(str, enum.Enum):
    DISPONIVEL = "DISPONIVEL"
    EM_USO = "EM_USO"
    MANUTENCAO = "MANUTENCAO"
    DESCARTADO = "DESCARTADO"

class TipoMovimentacao(str, enum.Enum):
    ENTREGA = "ENTREGA"
    DEVOLUCAO = "DEVOLUCAO"

class PerfilUsuario(str, enum.Enum):
    ADMIN = "ADMIN"
    RH = "RH"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha = Column(String, nullable=False)
    perfil = Column(Enum(PerfilUsuario), default=PerfilUsuario.ADMIN, nullable=False) # ADMIN ou RH
    cargo = Column(String, default="Administrador TI")
    created_at = Column(DateTime, default=datetime.utcnow)

class Funcionario(Base):
    __tablename__ = "funcionarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    cpf = Column(String, unique=True, index=True, nullable=False)
    cargo = Column(String, nullable=False)
    departamento = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    movimentacoes = relationship("Movimentacao", back_populates="funcionario")

class Equipamento(Base):
    __tablename__ = "equipamentos"

    id = Column(Integer, primary_key=True, index=True)
    patrimonio = Column(String, index=True, nullable=False)
    numero_serie = Column(String, index=True, nullable=True)
    categoria = Column(String, nullable=False, default="Notebook")
    tipo = Column(String, nullable=False)
    marca = Column(String, nullable=False)
    modelo = Column(String, nullable=False)
    
    setor = Column(String, nullable=True, default="Estoque TI")
    responsavel = Column(String, nullable=True, default="Estoque / TI")

    processador = Column(String, nullable=True)
    memoria = Column(String, nullable=True)
    tamanho_disco = Column(String, nullable=True)
    sistema_operacional = Column(String, nullable=True)
    especificacoes = Column(Text, nullable=True)

    quantidade = Column(Integer, default=1, nullable=False)
    condicao_inicial = Column(String, default="USADO")
    status = Column(Enum(StatusEquipamento), default=StatusEquipamento.DISPONIVEL, nullable=False)
    valor = Column(Float, nullable=True)
    data_aquisicao = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    movimentacoes = relationship("Movimentacao", back_populates="equipamento")

class Movimentacao(Base):
    __tablename__ = "movimentacoes"

    id = Column(Integer, primary_key=True, index=True)
    equipamento_id = Column(Integer, ForeignKey("equipamentos.id"), nullable=False)
    funcionario_id = Column(Integer, ForeignKey("funcionarios.id"), nullable=False)
    tipo_movimentacao = Column(Enum(TipoMovimentacao), default=TipoMovimentacao.ENTREGA, nullable=False)
    data_movimentacao = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    acessorios_inclusos = Column(String, nullable=True)
    condicao_entrega = Column(String, default="USADO")
    comentarios_adicionais = Column(Text, nullable=True)
    
    nome_gerente = Column(String, nullable=True)
    nome_responsavel_ti = Column(String, nullable=True)

    data_devolucao = Column(DateTime, nullable=True)
    condicao_devolucao = Column(String, nullable=True)
    observacoes_devolucao = Column(Text, nullable=True)
    
    assinado = Column(Boolean, default=False)

    equipamento = relationship("Equipamento", back_populates="movimentacoes")
    funcionario = relationship("Funcionario", back_populates="movimentacoes")
