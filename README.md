# Shope Ngola - E-Commerce Platform

Plataforma de e-commerce completa desenvolvida com **Laravel 12 (Backend)** e **Angular 18 (Frontend)**.

## 📋 Estrutura do Projeto

```
P1/
├── mini-ecommerce/              # Backend Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/    # Controladores da API
│   │   └── Models/                  # Modelos Eloquent
│   ├── database/
│   │   ├── migrations/              # Migrações do banco
│   │   └── seeders/                 # Populadores de dados
│   ├── resources/views/
│   │   └── admin/report.blade.php   # Template PDF do relatório
│   └── routes/api.php               # Rotas da API
│
├── mini-ecommerce-frontend/     # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/          # Guards (auth, admin)
│   │   │   │   └── services/        # Serviços de autenticação
│   │   │   ├── shared/
│   │   │   │   ├── components/      # Navbar, Footer, etc.
│   │   │   │   └── services/        # CartService, ProductService
│   │   │   └── features/
│   │   │       ├── home/            # Página inicial
│   │   │       ├── admin/           # Dashboard administrativo
│   │   │       ├── auth/            # Login/Registo
│   │   │       └── profile/         # Perfil do utilizador
│   │   └── main.ts
│   └── tailwind.config.js           # Configuração Tailwind CSS
│
└── .gitignore                       # Ficheiros excluídos do Git
```

## 🚀 Funcionalidades

### Backend (Laravel)
- ✅ **API RESTful** completa para produtos, pedidos, carrinho e utilizadores
- ✅ **Autenticação** com Laravel Sanctum
- ✅ **Controlo de Acesso** com role 'admin'
- ✅ **Exportação de Relatórios**:
  - PDF profissional com Dompdf (cabeçalho vermelho, cards, gráfico, tabela)
  - CSV com indicadores (Produtos, Pedidos, Utilizadores, Vendas)
- ✅ **Gerenciamento de Produtos**, Categorias, Carrinho e Pedidos
- ✅ **Sistema de Favoritos**

### Frontend (Angular)
- ✅ **Páginas Principais**:
  - Home (carrega produtos automaticamente)
  - Detalhes de Produto
  - Carrinho de Compras
  - Checkout
  - Perfil do Utilizador
- ✅ **Dashboard Administrativo** (carrega automaticamente ao acessar)
- ✅ **Gerenciamento de Produtos** (CRUD)
- ✅ **Gerenciamento de Pedidos**
- ✅ **Sistema de Autenticação**:
  - Login / Registo
  - Logout com limpeza de dados
  - Rotas protegidas por guards (auth, admin)
- ✅ **Navbar com atualização automática do contador de carrinho**
- ✅ **Suporte Multi-idioma** (PT, EN, FR)
- ✅ **Responsive Design** com Tailwind CSS

## 🔧 Configuração Local

### Pré-requisitos
- PHP 8.2+
- Node.js 18+
- Composer
- npm ou yarn

### Backend (Laravel)

1. **Navegar para a pasta do backend**:
```bash
cd mini-ecommerce
```

2. **Instalar dependências**:
```bash
composer install
```

3. **Configurar arquivo `.env`**:
```bash
cp .env.example .env
php artisan key:generate
```

4. **Configurar banco de dados** em `.env`:
```
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

5. **Executar migrações**:
```bash
php artisan migrate --seed
```

6. **Iniciar servidor Laravel**:
```bash
php artisan serve
```

O servidor estará em `http://localhost:8000`

### Frontend (Angular)

1. **Navegar para a pasta do frontend**:
```bash
cd mini-ecommerce-frontend
```

2. **Instalar dependências**:
```bash
npm install
```

3. **Iniciar servidor de desenvolvimento**:
```bash
npm start
```

ou

```bash
ng serve
```

O frontend estará em `http://localhost:4200`

## 📡 API Endpoints

### Produtos
- `GET /api/products` - Listar produtos
- `POST /api/products` - Criar produto (admin)
- `PUT /api/products/{id}` - Atualizar produto (admin)
- `DELETE /api/products/{id}` - Deletar produto (admin)

### Carrinho
- `GET /api/cart` - Obter carrinho
- `POST /api/cart/add` - Adicionar item
- `PUT /api/cart/items/{id}` - Atualizar quantidade
- `DELETE /api/cart/remove/{id}` - Remover item
- `POST /api/cart/checkout` - Finalizar compra

### Pedidos
- `GET /api/orders` - Listar pedidos do utilizador
- `POST /api/orders` - Criar pedido
- `GET /api/orders/{id}` - Detalhes do pedido

### Admin
- `GET /api/admin/reports/dashboard` - Dados do dashboard
- `GET /api/admin/reports/export-pdf` - Exportar relatório em PDF
- `GET /api/admin/reports/export-csv` - Exportar relatório em CSV
- `GET /api/admin/products` - Listar todos os produtos
- `GET /api/admin/orders` - Listar todos os pedidos

### Autenticação
- `POST /api/register` - Registar novo utilizador
- `POST /api/login` - Fazer login
- `POST /api/logout` - Fazer logout
- `GET /api/me` - Dados do utilizador logado

## 🔐 Segurança

- ✅ **Guards Implementados**:
  - `authGuard` - Protege rotas que requerem autenticação
  - `adminGuard` - Protege rotas administrativas (apenas admins)
  - `userGuard` - Protege rotas de utilizadores normais
- ✅ **CORS Configurado** no Backend para requisições do Frontend
- ✅ **Validação de Input** em todos os formulários
- ✅ **Tokens JWT** com Laravel Sanctum
- ✅ **Middleware de Administrador** no Backend

## 📊 Exportação de Relatórios

### PDF
O PDF gerado inclui:
- **Cabeçalho profissional** com faixa vermelha (#b22204)
- **Informações de exportação** (data/hora, admin responsável)
- **Cards resumidos** (Produtos, Pedidos, Utilizadores, Vendas)
- **Gráfico em barras** com visual profissional
- **Tabela resumida** com indicadores
- **Rodapé** com mensagem de sistema

### CSV
O CSV inclui:
- Cabeçalhos: `Indicador, Valor`
- Dados reais: Produtos, Pedidos, Utilizadores, Vendas
- Formatação de moeda: `3 087 464,00 Kz`

## ✅ Verificação de Funcionalidades

- ✅ **CartService sincronizado** com backend
- ✅ **Admin Dashboard carrega automaticamente** no ngOnInit
- ✅ **Home carrega produtos automaticamente** ao f5 (refresh)
- ✅ **Navbar atualiza contador** automaticamente via BehaviorSubject
- ✅ **Rotas admin protegidas** com adminGuard
- ✅ **Logout funciona** com limpeza completa de dados

## 🎨 Tecnologias Utilizadas

### Backend
- Laravel 12
- Laravel Sanctum (autenticação)
- Dompdf (geração de PDF)
- SQLite (banco de dados)

### Frontend
- Angular 18
- TypeScript
- Tailwind CSS
- RxJS (programação reativa)
- ng-zorro (componentes UI opcionais)

## 📝 Commits Git

O projeto está versionado no Git com .gitignore profissional que exclui:
- `node_modules/`, `vendor/` - dependências
- `dist/`, `.angular/` - arquivos de build
- `.env` - variáveis de ambiente
- `*.log` - arquivos de log

## 🚀 Deploy

Para deploy em produção:

1. **Build do Frontend**:
```bash
cd mini-ecommerce-frontend
npm run build
```

2. **Configurar Firebase Hosting**, Vercel ou semelhante para o Angular

3. **Configurar Servidor PHP** (Heroku, AWS, DigitalOcean) para Laravel com:
   - `.env` configurado com variáveis de produção
   - Database migrado
   - `composer install --optimize-autoloader --no-dev`

## 📞 Suporte

Para questões ou bugs, abra uma issue no repositório.

---

**Projeto Final - Shope Ngola** © 2026
