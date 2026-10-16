"""
Script utilitário para migrar dados do SQLite local para o PostgreSQL da VM.
Uso:
  python migrate_sqlite_to_pg.py [URL_POSTGRES]
  Exemplo:
  python migrate_sqlite_to_pg.py postgresql://postgres:senha@localhost:5432/inventario_ti
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
    
    print("\n--> Criando tabelas no PostgreSQL se não existirem...")
    Base.metadata.create_all(bind=engine_pg)
    
    SessionPg = sessionmaker(bind=engine_pg)
    db_pg = SessionPg()

    try:
        def migrar_modelo(Modelo):
            registros = db_sqlite.query(Modelo).all()
            print(f"Migrando {len(registros)} registros para tabela '{Modelo.__tablename__}'...")
            for r in registros:
                dados = {}
                for col in Modelo.__table__.columns:
                    val = getattr(r, col.name, None)
                    dados[col.name] = val
                db_pg.merge(Modelo(**dados))
            db_pg.commit()

        # 1. Usuários
        migrar_modelo(models.Usuario)

        # 2. Funcionários
        migrar_modelo(models.Funcionario)

        # 3. Equipamentos
        migrar_modelo(models.Equipamento)

        # 4. Movimentações
        migrar_modelo(models.Movimentacao)

        print("\n [SUCESSO] Todas as tabelas e dados foram migrados com sucesso para o PostgreSQL!")

    except Exception as err:
        db_pg.rollback()
        print(f"\n [ERRO] Falha na migração: {err}")
    finally:
        db_sqlite.close()
        db_pg.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = os.getenv("DATABASE_URL")

    if not url or url.startswith("sqlite"):
        print("Erro: Forneça a URL do PostgreSQL como argumento ou defina DATABASE_URL no backend/.env.")
        print("Exemplo de comando:")
        print("python migrate_sqlite_to_pg.py postgresql://postgres:sua_senha@localhost:5432/inventario_ti")
        sys.exit(1)

    migrar(url)
