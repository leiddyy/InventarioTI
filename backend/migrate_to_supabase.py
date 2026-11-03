"""
Script utilitário para migrar dados do SQLite local para o Supabase (PostgreSQL).
Uso:
  python migrate_to_supabase.py [URL_DO_SUPABASE]
  
  Exemplo:
  python migrate_to_supabase.py "postgresql://postgres.xxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"
"""

import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import models
from database import Base

def migrar(supabase_url: str):
    sqlite_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "inventario_ti.db").replace("\\", "/")
    sqlite_url = f"sqlite:///{sqlite_path}"

    print(f"--> Origem (SQLite Local): {sqlite_url}")
    print(f"--> Destino (Supabase): {supabase_url[:35]}...")

    engine_sqlite = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    SessionSqlite = sessionmaker(bind=engine_sqlite)
    db_sqlite = SessionSqlite()

    # Corrige prefixo postgres:// caso necessário
    if supabase_url.startswith("postgres://"):
        supabase_url = supabase_url.replace("postgres://", "postgresql://", 1)

    engine_pg = create_engine(supabase_url, pool_pre_ping=True)
    
    print("\n--> Criando tabelas no Supabase se ainda não existirem...")
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

        print("\n>>> [SUCESSO] Todos os dados foram migrados com sucesso para o Supabase!")

    except Exception as err:
        db_pg.rollback()
        print(f"\n>>> [ERRO] Falha na migracao para o Supabase: {err}")
    finally:
        db_sqlite.close()
        db_pg.close()

if __name__ == "__main__":
    if len(sys.argv) > 1:
        url = sys.argv[1]
    else:
        url = os.getenv("DATABASE_URL")

    if not url or url.startswith("sqlite"):
        print("Erro: Forneça a URL de conexão do Supabase como argumento ou configure DATABASE_URL no backend/.env.")
        print('Exemplo: python migrate_to_supabase.py "postgresql://postgres.xxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres"')
        sys.exit(1)

    migrar(url)
