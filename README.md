<div align="center">

# 🌐 BrunoFragaDev — Portfolio Web

**Frontend do portfólio pessoal [brunofragadev.com](https://www.brunofragadev.com).**  
Aplicação web moderna com autenticação, vitrine de projetos e artigos, e sistema de feedbacks.

[![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![CSS](https://img.shields.io/badge/CSS-Modules-264DE4?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Azure](https://img.shields.io/badge/Azure-Static_Web_Apps-0089D6?style=flat-square&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com/en-us/products/app-service/static)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](./LICENSE)

🔗 **[brunofragadev.com](https://www.brunofragadev.com)**

</div>

---

## 📖 Sobre o Projeto

Frontend da plataforma **[brunofragadev.com](https://www.brunofragadev.com)** — portfólio pessoal em produção com autenticação completa, vitrine dinâmica de projetos e artigos consumidos da [BrunoFragaDev API](https://github.com/brunofdev/brunofragadev-api), e sistema interativo de feedbacks.

A aplicação é mantida e atualizada continuamente com novos projetos e funcionalidades ao longo da carreira.

---

## ✨ Funcionalidades

### 🏠 Página Inicial (Home)

- Apresentação pessoal com nome, profissão e foto de perfil
- Navegação principal entre as seções do portfólio
- Carrossel de **projetos em destaque** com galeria de imagens
- Modal de detalhe de projeto com renderização de **Markdown** nas descrições
- Seção de **artigos recentes** — exibe os 5 últimos publicados automaticamente
- Componente de **feedbacks** com listagem e submissão inline

### 👤 Autenticação

- Login com **credenciais** (username e senha)
- Login social via **Google OAuth2** — integrado ao fluxo da API
- Cadastro de nova conta com formulário completo
- **Ativação de conta** por código de 6 dígitos recebido por e-mail
- **Recuperação de senha** via código de segurança
- Persistência de sessão com token **JWT** armazenado no cliente
- Controle de acesso por roles — painel administrativo visível apenas para admins

### 📁 Vitrine de Projetos

- Listagem de todos os projetos com paginação
- Modal de detalhe por projeto com:
  - Carrossel de imagens com legenda e controles de navegação
  - Descrição renderizada em **Markdown**
  - **Ficha técnica**: linguagem, paradigma, framework, bibliotecas e infraestrutura
  - **Guia de setup**: passos sequenciais com comandos de terminal
  - Feedbacks do projeto com nota e comentário

### 📝 Vitrine de Artigos

- Listagem completa de artigos publicados
- **Página exclusiva por artigo** gerada dinamicamente após publicação
- Renderização completa do corpo do artigo em **Markdown** (react-markdown)
- Galeria de imagens por artigo
- Feedbacks vinculados ao artigo

### 💬 Sistema de Feedbacks

- Submissão de feedbacks com **nota de 1 a 5** e comentário
- Feedbacks **Gerais** (sobre a plataforma) ou **vinculados** a um projeto/artigo
- Envio **anônimo** sem necessidade de login
- Listagem de feedbacks ordenados por data
- Identificação do autor com foto de perfil e nome público

### 🛠️ Painel Administrativo (ADMIN)

- Painel exclusivo para usuários com role `ADMIN`
- **Criação de artigos** com editor de texto moderno — **TipTap** (rich text, formatação completa)
  - Bold, Italic, Heading, listas, links, código inline e blocos de código
  - Preview em tempo real do conteúdo
- Gerenciamento de artigos: editar status (`RASCUNHO`, `PUBLICADO`)
- **Visualizador de erros do sistema** — componente dedicado para monitoramento de logs
- Exclusão de feedbacks diretamente pelo painel
- Moderação de conteúdo publicado

### 🔔 UX & Interface

- Design responsivo — corrigido e otimizado para **mobile e resoluções pequenas**
- Feedback visual de carregamento e estados de erro
- Mensagens de erro amigáveis nas operações com a API
- **Download de currículo** em PDF diretamente pela interface
- Fallback de navegação configurado para **Azure Static Web Apps** (SPA routing)
- Markdown renderizado corretamente em todos os componentes da aplicação

---

## 🏗️ Arquitetura

Aplicação **Single Page Application (SPA)** construída com **React**, estruturada por funcionalidade:

```
MyWebPortifolio/
├── src/
│   ├── components/         → Componentes reutilizáveis (Navbar, Modal, FeedbackList...)
│   ├── pages/              → Páginas da aplicação (Home, Artigo, Admin...)
│   ├── services/           → Camada de comunicação com a API (fetch/axios)
│   ├── context/            → Contexto de autenticação (AuthContext / JWT)
│   ├── hooks/              → Custom hooks (useAuth, useFeedback...)
│   └── styles/             → Estilos globais e módulos CSS
├── public/                 → Assets estáticos (favicon, currículo PDF...)
└── .github/workflows/      → Pipeline de CI/CD com Azure Static Web Apps
```

---

## 🚀 Infraestrutura & Deploy

| Recurso | Descrição |
|---|---|
| ☁️ Azure Static Web Apps | Hospedagem e entrega do frontend em produção |
| ⚙️ GitHub Actions | Pipeline CI/CD automático a cada push na `main` |
| 🔀 SPA Fallback | Arquivo de configuração de roteamento para o Azure (evita 404 em rotas diretas) |
| 🌍 Domínio | [brunofragadev.com](https://www.brunofragadev.com) |

O deploy é **automático**: qualquer push na branch `main` dispara o workflow do GitHub Actions que faz o build e publica na Azure Static Web Apps.

---

## ⚙️ Tecnologias

| Categoria | Tecnologia |
|---|---|
| Linguagem | JavaScript (ES2023) |
| Framework UI | React |
| Estilização | CSS Modules / CSS puro |
| Editor de texto | TipTap (rich text editor) |
| Markdown | react-markdown |
| Autenticação | JWT + Google OAuth2 (via API) |
| HTTP | Fetch API / VITE_API_URL env |
| CI/CD | GitHub Actions |
| Hospedagem | Azure Static Web Apps |

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Node.js 18+
- A [BrunoFragaDev API](https://github.com/brunofdev/brunofragadev-api) rodando localmente ou apontando para a URL de produção

### 1. Clone o repositório

```bash
git clone https://github.com/brunofdev/MyWebPortifolio.git
cd MyWebPortifolio/MyWebPortifolio
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080
```

### 3. Instale as dependências e rode

```bash
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

---

## 📐 Páginas e Rotas

| Rota | Descrição |
|---|---|
| `/` | Home — apresentação, projetos em destaque, artigos recentes e feedbacks |
| `/artigos` | Listagem completa de artigos publicados |
| `/artigo/:id` | Página exclusiva de um artigo específico |
| `/admin` | Painel administrativo — criação e gestão de artigos, logs |

---

## 📬 Contato

Desenvolvido por **Bruno Fraga** · [brunofragadev.com](https://www.brunofragadev.com) · [github.com/brunofdev](https://github.com/brunofdev)
