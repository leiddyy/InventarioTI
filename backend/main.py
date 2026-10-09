from fastapi import FastAPI, Depends, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database import engine, get_db, Base
import models
import schemas
from pdf_generator import gerar_pdf_termo_responsabilidade
from report_generator import gerar_excel_inventario, gerar_pdf_inventario

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Sistema de Inventário de TI - DIA Distribuição", version="2.7.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- AUTENTICAÇÃO / LOGIN ---
@app.post("/api/auth/login", response_model=schemas.LoginResponse)
def login(login_data: schemas.LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.email == login_data.email).first()
    if not usuario or usuario.senha != login_data.senha:
        usuario_alt = db.query(models.Usuario).filter(models.Usuario.email.like(f"%{login_data.email}%")).first()
        if usuario_alt and usuario_alt.senha == login_data.senha:
            usuario = usuario_alt
        else:
            raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    return {
        "token": f"token-session-{usuario.id}-ti",
        "usuario": usuario
    }

# --- GESTÃO DE USUÁRIOS DO SISTEMA (ADMIN ONLY) ---
@app.get("/api/usuarios", response_model=List[schemas.UsuarioResponse])
def list_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).order_by(models.Usuario.created_at.desc()).all()

@app.post("/api/usuarios", response_model=schemas.UsuarioResponse)
def create_usuario(user: schemas.UsuarioCreate, db: Session = Depends(get_db)):
    if db.query(models.Usuario).filter(models.Usuario.email == user.email).first():
        raise HTTPException(status_code=400, detail="Este e-mail já está cadastrado para outro usuário.")

    db_user = models.Usuario(
        nome=user.nome,
        email=user.email,
        senha=user.senha,
        perfil=user.perfil,
        cargo=user.cargo
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/api/usuarios/{id}")
def delete_usuario(id: int, db: Session = Depends(get_db)):
    user = db.query(models.Usuario).filter(models.Usuario.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    # Impede de excluir todos os admins
    total_admins = db.query(models.Usuario).filter(models.Usuario.perfil == models.PerfilUsuario.ADMIN).count()
    if user.perfil == models.PerfilUsuario.ADMIN and total_admins <= 1:
        raise HTTPException(status_code=400, detail="Não é possível excluir o único usuário Administrador do sistema.")

    db.delete(user)
    db.commit()
    return {"message": "Usuário excluído com sucesso."}

# --- DASHBOARD ---
@app.get("/api/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_equipamentos = db.query(models.Equipamento).count()
    equipamentos_em_uso = db.query(models.Equipamento).filter(models.Equipamento.status == models.StatusEquipamento.EM_USO).count()
    equipamentos_disponiveis = db.query(models.Equipamento).filter(models.Equipamento.status == models.StatusEquipamento.DISPONIVEL).count()
    equipamentos_manutencao = db.query(models.Equipamento).filter(models.Equipamento.status == models.StatusEquipamento.MANUTENCAO).count()
    total_funcionarios = db.query(models.Funcionario).count()
    total_movimentacoes = db.query(models.Movimentacao).count()
    
    cabos_acessorios = db.query(models.Equipamento).filter(models.Equipamento.categoria.in_(["Cabos", "Periféricos"])).all()
    total_cabos_acessorios = sum(c.quantidade for c in cabos_acessorios)

    return {
        "total_equipamentos": total_equipamentos,
        "equipamentos_em_uso": equipamentos_em_uso,
        "equipamentos_disponiveis": equipamentos_disponiveis,
        "equipamentos_manutencao": equipamentos_manutencao,
        "total_funcionarios": total_funcionarios,
        "total_movimentacoes": total_movimentacoes,
        "total_cabos_acessorios": total_cabos_acessorios
    }

# --- FUNCIONÁRIOS ---
@app.get("/api/funcionarios", response_model=List[schemas.FuncionarioResponse])
def list_funcionarios(db: Session = Depends(get_db)):
    return db.query(models.Funcionario).order_by(models.Funcionario.nome).all()

@app.post("/api/funcionarios", response_model=schemas.FuncionarioResponse)
def create_funcionario(func: schemas.FuncionarioCreate, db: Session = Depends(get_db)):
    if db.query(models.Funcionario).filter(models.Funcionario.cpf == func.cpf).first():
        raise HTTPException(status_code=400, detail="CPF já cadastrado.")
    if db.query(models.Funcionario).filter(models.Funcionario.email == func.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

    db_func = models.Funcionario(**func.model_dump())
    db.add(db_func)
    db.commit()
    db.refresh(db_func)
    return db_func

@app.get("/api/funcionarios/{id}", response_model=schemas.FuncionarioResponse)
def get_funcionario(id: int, db: Session = Depends(get_db)):
    func = db.query(models.Funcionario).filter(models.Funcionario.id == id).first()
    if not func:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado.")
    return func

@app.delete("/api/funcionarios/{id}")
def delete_funcionario(id: int, db: Session = Depends(get_db)):
    func = db.query(models.Funcionario).filter(models.Funcionario.id == id).first()
    if not func:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado.")

    # Se o colaborador tiver equipamentos em uso atribuídos a ele, libera os equipamentos para o estoque
    equipamentos_em_uso = db.query(models.Equipamento).filter(models.Equipamento.responsavel == func.nome).all()
    for eq in equipamentos_em_uso:
        eq.status = models.StatusEquipamento.DISPONIVEL
        eq.responsavel = "Estoque"
        eq.setor = "TI / Estoque"

    # Remove movimentações associadas antes de excluir
    db.query(models.Movimentacao).filter(models.Movimentacao.funcionario_id == id).delete()

    db.delete(func)
    db.commit()
    return {"message": "Colaborador excluído com sucesso."}

# --- EQUIPAMENTOS ---
@app.get("/api/equipamentos/export/excel")
def export_equipamentos_excel(db: Session = Depends(get_db)):
    equipamentos = db.query(models.Equipamento).order_by(models.Equipamento.created_at.desc()).all()
    excel_buffer = gerar_excel_inventario(equipamentos)
    filename = f"Inventario_TI_DIA_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    return StreamingResponse(
        excel_buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@app.get("/api/equipamentos/export/pdf")
def export_equipamentos_pdf(db: Session = Depends(get_db)):
    equipamentos = db.query(models.Equipamento).order_by(models.Equipamento.created_at.desc()).all()
    pdf_buffer = gerar_pdf_inventario(equipamentos)
    filename = f"Inventario_TI_DIA_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )

@app.get("/api/equipamentos", response_model=List[schemas.EquipamentoResponse])
def list_equipamentos(status: Optional[models.StatusEquipamento] = None, db: Session = Depends(get_db)):
    query = db.query(models.Equipamento)
    if status:
        query = query.filter(models.Equipamento.status == status)
    return query.order_by(models.Equipamento.created_at.desc()).all()

@app.post("/api/equipamentos", response_model=schemas.EquipamentoResponse)
def create_equipamento(eq: schemas.EquipamentoCreate, db: Session = Depends(get_db)):
    db_eq = models.Equipamento(**eq.model_dump())
    db.add(db_eq)
    db.commit()
    db.refresh(db_eq)
    return db_eq

@app.get("/api/equipamentos/{id}", response_model=schemas.EquipamentoResponse)
def get_equipamento(id: int, db: Session = Depends(get_db)):
    eq = db.query(models.Equipamento).filter(models.Equipamento.id == id).first()
    if not eq:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado.")
    return eq

@app.put("/api/equipamentos/{id}", response_model=schemas.EquipamentoResponse)
def update_equipamento(id: int, eq_update: schemas.EquipamentoUpdate, db: Session = Depends(get_db)):
    db_eq = db.query(models.Equipamento).filter(models.Equipamento.id == id).first()
    if not db_eq:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado.")

    update_data = eq_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_eq, key, value)

    db.commit()
    db.refresh(db_eq)
    return db_eq

@app.delete("/api/equipamentos/{id}")
def delete_equipamento(id: int, db: Session = Depends(get_db)):
    db_eq = db.query(models.Equipamento).filter(models.Equipamento.id == id).first()
    if not db_eq:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado.")

    # Apagar movimentações associadas se existirem
    db.query(models.Movimentacao).filter(models.Movimentacao.equipamento_id == id).delete()
    db.delete(db_eq)
    db.commit()
    return {"message": "Equipamento excluído com sucesso."}

# --- MOVIMENTAÇÕES & ATRIBUIÇÕES ---
@app.get("/api/movimentacoes", response_model=List[schemas.MovimentacaoResponse])
def list_movimentacoes(
    funcionario_id: Optional[int] = None,
    equipamento_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Movimentacao)
    if funcionario_id:
        query = query.filter(models.Movimentacao.funcionario_id == funcionario_id)
    if equipamento_id:
        query = query.filter(models.Movimentacao.equipamento_id == equipamento_id)
    return query.order_by(models.Movimentacao.data_movimentacao.desc()).all()

@app.post("/api/movimentacoes", response_model=schemas.MovimentacaoResponse)
def create_movimentacao(mov: schemas.MovimentacaoCreate, db: Session = Depends(get_db)):
    equipamento = db.query(models.Equipamento).filter(models.Equipamento.id == mov.equipamento_id).first()
    if not equipamento:
        raise HTTPException(status_code=404, detail="Equipamento não encontrado.")

    funcionario = db.query(models.Funcionario).filter(models.Funcionario.id == mov.funcionario_id).first()
    if not funcionario:
        raise HTTPException(status_code=404, detail="Funcionário não encontrado.")

    if mov.tipo_movimentacao == models.TipoMovimentacao.ENTREGA:
        equipamento.status = models.StatusEquipamento.EM_USO
        equipamento.responsavel = funcionario.nome
        equipamento.setor = funcionario.departamento
    elif mov.tipo_movimentacao == models.TipoMovimentacao.DEVOLUCAO:
        equipamento.status = models.StatusEquipamento.DISPONIVEL
        equipamento.responsavel = "Estoque"
        equipamento.setor = "TI / Estoque"

    db_mov = models.Movimentacao(
        equipamento_id=mov.equipamento_id,
        funcionario_id=mov.funcionario_id,
        tipo_movimentacao=mov.tipo_movimentacao,
        acessorios_inclusos=mov.acessorios_inclusos,
        condicao_entrega=mov.condicao_entrega,
        comentarios_adicionais=mov.comentarios_adicionais,
        nome_gerente=mov.nome_gerente,
        nome_responsavel_ti=mov.nome_responsavel_ti,
        data_movimentacao=datetime.utcnow()
    )

    db.add(db_mov)
    db.commit()
    db.refresh(db_mov)
    return db_mov

# --- GERAR TERMO DE RESPONSABILIDADE (PDF 1:1 DIA DISTRIBUIÇÃO) ---
@app.get("/api/movimentacoes/{id}/termo-pdf")
def download_termo_pdf(id: int, db: Session = Depends(get_db)):
    mov = db.query(models.Movimentacao).filter(models.Movimentacao.id == id).first()
    if not mov:
        raise HTTPException(status_code=404, detail="Movimentação não encontrada.")

    pdf_buffer = gerar_pdf_termo_responsabilidade(mov)
    filename = f"Termo_Responsabilidade_DIA_{mov.equipamento.patrimonio}_{mov.funcionario.nome.replace(' ', '_')}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename={filename}"}
    )
