-- =====================================================================
-- Script SQL para PostgreSQL - Sistema de Inventário TI DIA Distribuição
-- Execute este script dentro do banco "inventario_ti" no pgAdmin
-- =====================================================================

-- 1. Tabela de Usuários do Sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    senha VARCHAR NOT NULL,
    perfil VARCHAR NOT NULL DEFAULT 'ADMIN',
    cargo VARCHAR DEFAULT 'Administrador TI',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_usuarios_id ON usuarios (id);
CREATE INDEX IF NOT EXISTS ix_usuarios_email ON usuarios (email);

-- 2. Tabela de Funcionários / Colaboradores
CREATE TABLE IF NOT EXISTS funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    cpf VARCHAR UNIQUE NOT NULL,
    cargo VARCHAR NOT NULL,
    departamento VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_funcionarios_id ON funcionarios (id);
CREATE INDEX IF NOT EXISTS ix_funcionarios_email ON funcionarios (email);
CREATE INDEX IF NOT EXISTS ix_funcionarios_cpf ON funcionarios (cpf);

-- 3. Tabela de Equipamentos
CREATE TABLE IF NOT EXISTS equipamentos (
    id SERIAL PRIMARY KEY,
    patrimonio VARCHAR NOT NULL,
    numero_serie VARCHAR,
    categoria VARCHAR NOT NULL DEFAULT 'Notebook',
    tipo VARCHAR NOT NULL,
    marca VARCHAR NOT NULL,
    modelo VARCHAR NOT NULL,
    setor VARCHAR DEFAULT 'Estoque TI',
    responsavel VARCHAR DEFAULT 'Estoque / TI',
    processador VARCHAR,
    memoria VARCHAR,
    tamanho_disco VARCHAR,
    sistema_operacional VARCHAR,
    especificacoes TEXT,
    quantidade INTEGER NOT NULL DEFAULT 1,
    condicao_inicial VARCHAR DEFAULT 'USADO',
    status VARCHAR NOT NULL DEFAULT 'DISPONIVEL',
    valor DOUBLE PRECISION,
    data_aquisicao VARCHAR,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_equipamentos_id ON equipamentos (id);
CREATE INDEX IF NOT EXISTS ix_equipamentos_patrimonio ON equipamentos (patrimonio);
CREATE INDEX IF NOT EXISTS ix_equipamentos_numero_serie ON equipamentos (numero_serie);

-- 4. Tabela de Movimentações (Entrega / Devolução de Equipamentos)
CREATE TABLE IF NOT EXISTS movimentacoes (
    id SERIAL PRIMARY KEY,
    equipamento_id INTEGER NOT NULL REFERENCES equipamentos(id) ON DELETE CASCADE,
    funcionario_id INTEGER NOT NULL REFERENCES funcionarios(id) ON DELETE CASCADE,
    tipo_movimentacao VARCHAR NOT NULL DEFAULT 'ENTREGA',
    data_movimentacao TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acessorios_inclusos VARCHAR,
    condicao_entrega VARCHAR DEFAULT 'USADO',
    comentarios_adicionais TEXT,
    nome_gerente VARCHAR,
    nome_responsavel_ti VARCHAR,
    data_devolucao TIMESTAMP WITHOUT TIME ZONE,
    condicao_devolucao VARCHAR,
    observacoes_devolucao TEXT,
    assinado BOOLEAN DEFAULT FALSE,
    arquivo_termo_assinado VARCHAR
);

CREATE INDEX IF NOT EXISTS ix_movimentacoes_id ON movimentacoes (id);

-- =====================================================================
-- Usuários Iniciais para Login no Sistema (Senha padrão: 123)
-- =====================================================================
INSERT INTO usuarios (nome, email, senha, perfil, cargo)
VALUES 
    ('TI Admin', 'admin@diadistribuicao.com.br', '123', 'ADMIN', 'Administrador TI'),
    ('TI', 'ti@diadistribuicao.com.br', '123', 'ADMIN', 'Equipe TI')
ON CONFLICT (email) DO NOTHING;
