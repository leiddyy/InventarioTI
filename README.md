# Sistema de Inventário de TI - DIA Distribuição

Sistema web desenvolvido para gerenciar o inventário de equipamentos de Tecnologia da Informação (TI), controle de colaboradores e emissão de Termos de Responsabilidade da empresa DIA Distribuição.

## 🚀 Funcionalidades

- **Gestão de Equipamentos**: Cadastro, edição, exclusão e visualização de equipamentos divididos por categorias (Notebook, Desktop, Celular, Impressora, Monitor, etc.).
- **Gestão de Colaboradores**: Controle de funcionários, departamentos e visualização de equipamentos vinculados a cada colaborador. Opção de exclusão (demissão) com devolução automática de itens ao estoque.
- **Movimentações**: Registro de entrega e devolução de equipamentos.
- **Termos de Responsabilidade & Arquivamento Digital**: Geração automática do termo em PDF modelo oficial DIA pronto para assinatura e **anexação/upload do documento assinado** (digitalmente ou escaneado/foto em PDF, PNG, JPG), com controle visual de status (Pendente ou Assinado), consulta imediata e substituição a qualquer momento.
- **Relatórios**: Exportação do inventário completo para os formatos Excel (.xlsx) e PDF.
- **Controle de Acesso**: Perfis de acesso distintos (ADMIN com controle total e RH com acesso restrito a colaboradores e termos).
- **Acesso em Rede**: Configurado para ser acessível por outros computadores na mesma rede local.

## 🛠️ Tecnologias Utilizadas

### Backend
- [Python 3](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/) - Framework web rápido para construção de APIs.
- [SQLAlchemy](https://www.sqlalchemy.org/) - ORM para interação com o banco de dados.
- [SQLite](https://www.sqlite.org/) - Banco de dados embutido e leve.
- [ReportLab](https://docs.reportlab.com/) - Geração de relatórios e termos em PDF.
- [Openpyxl](https://openpyxl.readthedocs.io/) - Geração de relatórios em Excel.
- [Uvicorn](https://www.uvicorn.org/) - Servidor ASGI para rodar a aplicação FastAPI.

### Frontend
- [React 18](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática para JavaScript.
- [Vite](https://vitejs.dev/) - Ferramenta de build rápida.
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário para estilização rápida e responsiva.
- [Lucide React](https://lucide.dev/) - Biblioteca de ícones.
- [Axios](https://axios-http.com/) - Cliente HTTP para chamadas à API.

## ⚙️ Como Executar o Projeto Localmente

O projeto está dividido em duas pastas principais: `backend` e `frontend`. Para executar o sistema completamente, ambos os servidores precisam estar rodando simultaneamente.

### Pré-requisitos
- Python 3.8+ instalado
- Node.js e npm instalados

### 1. Iniciando o Backend

Abra um terminal, navegue até a pasta do projeto e entre na pasta `backend`:

```bash
cd backend
```

Ative o ambiente virtual (no Windows):
```bash
.\venv\Scripts\activate
```

Instale as dependências (caso seja a primeira vez):
```bash
pip install -r requirements.txt
```

Inicie o servidor localmente acessível em toda a rede:
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
O backend estará rodando na porta `8000`.

### 2. Iniciando o Frontend

Abra **outro** terminal, navegue até a pasta do projeto e entre na pasta `frontend`:

```bash
cd frontend
```

Instale as dependências (caso seja a primeira vez):
```bash
npm install
```

Inicie o servidor de desenvolvimento do Vite:
```bash
npm run dev
```
O frontend estará rodando na porta padrão (geralmente `3000` ou `5173`) e estará configurado para ser acessível pela sua rede local (graças à configuração `host: '0.0.0.0'` no Vite).

### 3. Acessando o Sistema

- **Localmente**: Abra o navegador no seu computador e acesse `http://localhost:<porta_do_frontend>`
- **Outros computadores na mesma rede**: Descubra o IP local da máquina que está hospedando o sistema (ex: `192.168.3.183`) e acesse `http://192.168.3.183:<porta_do_frontend>`. A API reconhecerá automaticamente o IP do host graças à configuração dinâmica no arquivo `api.ts`.

## 📁 Estrutura de Diretórios Principal

```text
InventarioTI/
├── backend/
│   ├── main.py               # Rotas e configuração principal do FastAPI
│   ├── models.py             # Modelos de banco de dados (Equipamento, Funcionario, etc.)
│   ├── pdf_generator.py      # Lógica de geração do Termo de Responsabilidade em PDF
│   ├── report_generator.py   # Lógica de geração de relatórios do inventário (Excel/PDF)
│   ├── database.db           # Banco de dados SQLite
│   └── requirements.txt      # Dependências do Python
└── frontend/
    ├── src/
    │   ├── api.ts            # Configuração do Axios e chamadas de API (com IP dinâmico)
    │   ├── App.tsx           # Componente raiz, rotas e controle de sessão
    │   ├── types.ts          # Definições de tipos do TypeScript
    │   └── components/       # Componentes de tela (EquipamentosView, FuncionariosView, etc.)
    ├── public/               # Ativos estáticos (Logo da empresa, favicon)
    ├── vite.config.ts        # Configuração do Vite (inclui host: '0.0.0.0')
    └── package.json          # Dependências do Node.js
```

## 👨‍💻 Créditos
Desenvolvido por Leidiane Silva.
