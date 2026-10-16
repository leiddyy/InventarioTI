"""
Script utilitário para migrar dados do SQLite local para o PostgreSQL da VM.
Uso:
  python migrate_sqlite_to_pg.py [URL_POSTGRES]
  Exemplo:
  python migrate_sqlite_to_pg.py postgresql://inventario_user:senha@localhost:5432/inventario_ti
"""

import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import models
from database import Base

def migrar(pg_url: str):
    sqlite_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "inventario_ti.db").replace("\\", "/")
    sqlite_url = f"sqlite:///{sqlite_path}"

    print(f"--> Origem (SQLite): {sqlite_url}")
    print(f"--> Destino (PostgreSQL): {pg_url}")

    engine_sqlite = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    SessionSqlite = sessionmaker(bind=engine_sqlite)
    db_sqlite = SessionSqlite()

    engine_pg = create_engine(pg_url)
    # Cria as tabelas no PostgreSQL
    Base.metadata.create_all(bind=engine_pg)
    SessionPg = sessionmaker(bind=engine_pg)
    db_pg = SessionPg()

    try:
        # 1. Usuários
        usuarios = db_sqlite.query(models.Usuario).all()
        print(f"Migrando {len(usuarios)} usuários...")
        for u in usuarios:
            db_pg.merge(models.Usuario(
                id=u.id,
                nome=u.nome,
                email=u.email,
                senha=u.senha,
                perfil=u.perfil,
                cargo=u.cargo,
                created_at=u.created_at
            ))
        db_pg.commit()

        # 2. Funcionários
        funcs = db_sqlite.query(models.Funcionario).all()
        print(f"Migrando {len(funcs)} funcionários...")
        for f in funcs:
            db_pg.merge(models.Funcionario(
                id=f.id,
                nome=f.nome,
                matricula=f.matricula,
                cpf=f.cpf,
                departamento=f.departamento,
                cargo=f.cargo,
                created_at=f.created_at
            ))
        db_pg.commit()

        # 3. Equipamentos
        equips = db_sqlite.query(models.Equipamento).all()
        print(f"Migrando {len(equips)} equipamentos...")
        for e in equips:
            db_pg.merge(models.Equipamento(
                id=e.id,
                tipo=e.tipo,
                marca=e.marca,
                modelo=e.modelo,
                numero_serie=e.numero_serie,
                patrimonio=e.patrimonio,
                status=e.status,
                localizacao=e.localizacao,
                observacoes=e.observacoes,
                created_at=e.created_at
            ))
        db_pg.commit()

        # 4. Movimentações
        movs = db_sqlite.query(models.Movimentacao).all()
        print(f"Migrando {len(movs)} movimentações...")
        for m in movs:
            db_pg.merge(models.Movimentacao(
                id=m.id,
                equipamento_id=m.equipamento_id,
                funcionario_id=m.funcionario_id,
                tipo_movimentacao=m.tipo_movimentacao,
                data_movimentacao=m.data_movimentacao,
                observacoes=m.observacoes,
                acessorios_inclusos=m.acessorios_inclusos,
                condicao_entrega=m.condicao_entrega,
                comentarios_adicionais=m.comentarios_adicionais,
                nome_gerente=m.nome_gerente,
                nome_responsavel_ti=m.nome_responsavel_ti,
                assinado=m.assinado,
                arquivo_termo_assinado=getattr(m, 'arquivo_termo_assinado', None)
            ))
        db_pg.commit()

        print("\n Migração concluída com sucesso!")

    except Exception as err:
        db_pg.rollback()
        print(f" Erro durante a migração: {err}")
    finally:
        db_sqlite.close()
        db_pg.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = os.getenv("DATABASE_URL")

    if not url or url.startswith("sqlite"):
        print("Erro: Forneça a URL do PostgreSQL como argumento ou defina DATABASE_URL no .env.")
        print("Exemplo: python migrate_sqlite_to_pg.py postgresql://usuario:senha@localhost:5432/inventario_ti")
        sys.exit(1)

    migrar(url)
