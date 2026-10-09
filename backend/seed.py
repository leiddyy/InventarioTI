import os
from database import SessionLocal, engine, Base
from models import Funcionario, Equipamento, Movimentacao, Usuario, StatusEquipamento, TipoMovimentacao, PerfilUsuario
from datetime import datetime

def seed_data():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Gerando usuários com permissões ADMIN e RH...")

    # 1. Usuário Administrador (Acesso Total)
    u_admin = Usuario(
        nome="Leidiane Silva",
        email="leidiane.silva@diadistribuicao.com.br",
        senha="123",
        perfil=PerfilUsuario.ADMIN,
        cargo="Administradora de TI / Admin"
    )

    # 2. Usuário do Setor de RH (Acesso Liberado a Colaboradores e Termos & Movimentações)
    u_rh = Usuario(
        nome="Mariana Lima (RH)",
        email="mariana.rh@diadistribuicao.com.br",
        senha="123",
        perfil=PerfilUsuario.RH,
        cargo="Analista de Recursos Humanos"
    )

    db.add_all([u_admin, u_rh])

    # Funcionários
    f1 = Funcionario(
        nome="Leidiane Silva",
        email="leidiane.silva@diadistribuicao.com.br",
        cpf="123.456.789-00",
        cargo="Desenvolvedora / TI Externo",
        departamento="Tecnologia da Informação"
    )
    f2 = Funcionario(
        nome="Carlos Eduardo Souza",
        email="carlos.souza@diadistribuicao.com.br",
        cpf="987.654.321-11",
        cargo="Analista de Vendas Externo",
        departamento="Comercial"
    )
    f3 = Funcionario(
        nome="Mariana Lima",
        email="mariana.lima@diadistribuicao.com.br",
        cpf="456.789.123-22",
        cargo="Gerente de Logística",
        departamento="Operações / Logística"
    )

    db.add_all([f1, f2, f3])
    db.commit()

    # Equipamentos
    eq1 = Equipamento(
        patrimonio="PAT-2026-001",
        numero_serie="SN-DELL-998811",
        categoria="Notebook",
        tipo="Notebook",
        marca="Dell",
        modelo="Latitude 5540",
        setor="Tecnologia da Informação",
        responsavel="Leidiane Silva",
        processador="Intel Core i7 13ª Geração",
        memoria="32GB DDR5",
        tamanho_disco="1TB SSD NVMe",
        sistema_operacional="Windows 11 Pro",
        especificacoes="Notebook para trabalho externo.",
        quantidade=1,
        condicao_inicial="NOVO",
        status=StatusEquipamento.EM_USO,
        valor=7500.00,
        data_aquisicao="2026-01-15"
    )

    eq2 = Equipamento(
        patrimonio="PAT-2026-002",
        numero_serie="SN-DELL-998812",
        categoria="Notebook",
        tipo="Notebook",
        marca="Dell",
        modelo="Latitude 5540",
        setor="Comercial",
        responsavel="Carlos Eduardo Souza",
        processador="Intel Core i5 13ª Geração",
        memoria="16GB DDR4",
        tamanho_disco="512GB SSD",
        sistema_operacional="Windows 11 Pro",
        especificacoes="Notebook para equipe de vendas externa.",
        quantidade=1,
        condicao_inicial="NOVO",
        status=StatusEquipamento.EM_USO,
        valor=5400.00,
        data_aquisicao="2026-01-15"
    )

    eq3 = Equipamento(
        patrimonio="PAT-2026-003",
        numero_serie="SN-DELL-PC-102",
        categoria="Desktop",
        tipo="Computador Desktop",
        marca="Dell",
        modelo="OptiPlex 7010 Tower",
        setor="Financeiro",
        responsavel="Estoque / TI",
        processador="Intel Core i7 12ª Geração",
        memoria="16GB DDR4",
        tamanho_disco="512GB SSD",
        sistema_operacional="Windows 11 Pro",
        especificacoes="Desktop de alto desempenho para o departamento financeiro.",
        quantidade=1,
        condicao_inicial="NOVO",
        status=StatusEquipamento.DISPONIVEL,
        valor=4200.00,
        data_aquisicao="2026-02-10"
    )

    eq4 = Equipamento(
        patrimonio="PAT-2026-004",
        numero_serie="SN-SAMSUNG-GAL-S23",
        categoria="Celular",
        tipo="Smartphone Corporativo",
        marca="Samsung",
        modelo="Galaxy S23 FE 128GB",
        setor="Operações / Logística",
        responsavel="Mariana Lima",
        processador="Octa-Core 2.8GHz",
        memoria="8GB RAM",
        tamanho_disco="128GB",
        sistema_operacional="Android 14",
        especificacoes="Celular corporativo para equipe externa.",
        quantidade=1,
        condicao_inicial="NOVO",
        status=StatusEquipamento.EM_USO,
        valor=2800.00,
        data_aquisicao="2026-02-20"
    )

    db.add_all([eq1, eq2, eq3, eq4])
    db.commit()

    # Movimentações
    m1 = Movimentacao(
        equipamento_id=eq1.id,
        funcionario_id=f1.id,
        tipo_movimentacao=TipoMovimentacao.ENTREGA,
        data_movimentacao=datetime(2026, 2, 1, 10, 30),
        acessorios_inclusos="Fonte, Cabo de rede, Mouse, Teclado, Outros (Cabo HDMI e Bolsa)",
        condicao_entrega="NOVO",
        comentarios_adicionais="Equipamento entregue completo para trabalho remoto/externo.",
        nome_gerente="Roberto Alves",
        nome_responsavel_ti="Leidiane Silva",
        assinado=True
    )

    db.add_all([m1])
    db.commit()
    db.close()
    print("Banco atualizado com permissões ADMIN e RH!")

if __name__ == "__main__":
    seed_data()
