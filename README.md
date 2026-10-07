# BioConecta - Mini Sistema Web para a Disciplina de Biologia

Plataforma educacional desenvolvida em conjunto com o professor da disciplina de **Biologia**, com o propósito de potencializar o processo de ensino-aprendizagem, organizando materiais didáticos, aplicando atividades avaliativas interativas com correção automática e permitindo o acompanhamento do progresso acadêmico de professores e alunos.

O sistema possui arquitetura híbrida: opera tanto de forma autônoma no navegador via **LocalStorage** (ideal para deploy estático imediato na Vercel), quanto integrado ao banco de dados em nuvem **MongoDB Atlas** com backend em **Node.js / Express**.

---

## 🎯 Objetivo do Sistema

Centralizar e dinamizar o ensino da Biologia em um ambiente moderno, escolar e responsivo. A ferramenta possibilita:
- **Ao Professor:** Cadastrar, editar e organizar conteúdos didáticos por grandes eixos biológicos (*Citologia, Genética, Ecologia, Evolução, Fisiologia Humana, Botânica, Zoologia, Microbiologia e Biotecnologia*), criar atividades avaliativas com prazos e pontuações, cadastrar questões no banco e acompanhar relatórios de desempenho e notas dos estudantes.
- **Aos Alunos:** Consultar resumos didáticos e materiais complementares, pesquisar por termos e temas, resolver atividades avaliativas com feedback imediato de pontuação e gabarito comentado, treinar em um banco de questões e monitorar seu rendimento e pendências em tempo real.

---

## 🚀 Funcionalidades Principais

### 1. Tela Inicial Institucional
- Banner moderno de apresentação da disciplina de Biologia.
- Apresentação didática dos recursos do sistema para discentes e docentes.
- Acesso rápido à exploração de conteúdos e à área de login.

### 2. Autenticação e Perfis (Multi-User)
- Acesso segmentado para **Professor** e **Aluno**.
- Suporte a credenciais padrão e **botões de acesso rápido em 1 clique** para facilidade de demonstração em sala de aula ou banca avaliadora:
  - **Professor:** `professor@biologia.edu` (Senha: `123456`)
  - **Aluno:** `aluno@biologia.edu` (Senha: `123456`)

### 3. Dashboard do Professor
- Painel de controle com indicadores (KPIs): total de conteúdos publicados, total de atividades, alunos cadastrados e submissões recebidas.
- Ações rápidas para cadastro de novos conteúdos e criação de atividades.
- Listagem dos conteúdos mais recentes e resumo das atividades cadastradas com acesso à visualização das submissões e notas dos estudantes.

### 4. Dashboard do Aluno
- Visão individual com total de atividades pendentes, atividades concluídas e média calculada de desempenho.
- Lista direta de "Atividades a Fazer" com prazos de entrega e pontuação.
- Sugestões de materiais didáticos recentes para estudo.

### 5. Conteúdos Didáticos de Biologia
- Catálogo de resumos teóricos divididos em temas: *Citologia, Genética, Ecologia, Evolução, Fisiologia Humana, Botânica, Zoologia, Microbiologia e Biotecnologia*.
- Leitura completa em modal com visualizador de imagens ilustrativas, texto didático e links diretos para materiais complementares confiáveis.
- Barra de busca dinâmica em tempo real (por título, palavra-chave ou conteúdo) e filtro reativo por temas.
- **CRUD Completo:** O professor pode cadastrar novos temas, editar publicações existentes e excluir tópicos desatualizados.

### 6. Atividades Avaliativas
- Atividades com data de publicação, prazo final, pontuação e conjunto de questões objetivas.
- Resolução interativa: o aluno seleciona suas respostas e finaliza o questionário.
- Correção instantânea com cálculo de nota proporcional, total de acertos e liberação do gabarito com explicação pedagógica de cada questão.
- Histórico de submissões acessível pelo professor, discriminando notas, acertos e datas de entrega de cada aluno.

### 7. Banco de Questões (Prática & Simulado)
- Acervo de questões com enunciado, tema, alternativas, resposta correta e explicação detalhada da resposta.
- Filtros simultâneos por **Tema** e por **Dificuldade** (Fácil, Médio, Difícil).
- Modo de treino: o aluno testa seus conhecimentos e verifica na hora a justificativa pedagógica.
- Cadastro de novas questões pelo professor.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - **HTML5:** Estruturação semântica e acessível (landmarks, formulários, modais).
  - **CSS3 Moderno:** Design system baseado em variáveis CSS (design tokens), paleta biológica inspirada na natureza e na ciência, Flexbox e CSS Grid para responsividade total.
  - **JavaScript (ES6+ Modular):** Arquitetura desacoplada em módulos (`storage.js`, `auth.js`, `content.js`, `activity.js`, `question.js`, `app.js`).
- **Backend & Banco de Dados (Opcional / Completo):**
  - **Node.js & Express:** API RESTful modular.
  - **MongoDB Atlas & Mongoose:** Banco de dados NoSQL em nuvem com cluster configurado e script de seed automático.
  - **CORS & Dotenv:** Comunicação segura e gerenciamento de variáveis de ambiente.
- **Armazenamento Híbrido:** O frontend se comunica com a API Node.js/MongoDB quando disponível e mantém fallback automático em `LocalStorage` para deploy estático na Vercel.

---

## 📂 Estrutura do Projeto

```
biologia-sistema/
│
├── frontend/
│   ├── index.html          # Interface principal e Single Page Application (SPA)
│   ├── css/
│   │   ├── styles.css      # Variáveis de design tokens, reset e tipografia
│   │   ├── components.css  # Botões, cards, modais, formulários, badges e toasts
│   │   └── responsive.css  # Ajustes para smartphones, tablets e desktops
│   ├── js/
│   │   ├── app.js          # Inicialização, roteamento por hash e dashboards
│   │   ├── auth.js         # Controle de sessão e perfis (Professor/Aluno)
│   │   ├── storage.js      # Camada híbrida (LocalStorage + Sincronização API)
│   │   ├── content.js      # Módulo de conteúdos e filtros
│   │   ├── activity.js     # Módulo de atividades e correção automática
│   │   └── question.js     # Banco de questões e simulados
│   └── assets/             # Ícones vetoriais e imagens auxiliares
│
├── backend/
│   ├── server.js           # Servidor Express e rotas da API REST
│   ├── seed.js             # Script para popular o MongoDB Atlas com dados iniciais
│   ├── package.json        # Dependências do backend (Express, Mongoose, etc.)
│   ├── .env                # Configuração com URI do MongoDB Atlas
│   └── models/             # Modelos Mongoose (Content, Activity, Question, Submission)
│
├── README.md               # Este documento de apresentação
├── Roadmap.md              # Roteiro das etapas de desenvolvimento do projeto
├── Contexto.md             # Documento de contexto educacional e regras de negócio
├── api.md                  # Especificação técnica e contratos de endpoints
├── vercel.json             # Configuração para deploy imediato na Vercel
└── index.html              # Fallback de redirecionamento na raiz
```

---

## 💻 Como Executar Localmente

### Modo 1: Apenas o Frontend (Sem necessidade de Node.js)
1. Abra a pasta do projeto no VS Code.
2. Com a extensão **Live Server**, clique com o botão direito em `frontend/index.html` e selecione **"Open with Live Server"**.
3. O sistema abrirá pronto para uso com dados pré-carregados!

### Modo 2: Fullstack (Frontend + Backend Node.js + MongoDB Atlas)
1. Abra um terminal na pasta `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Para popular o MongoDB Atlas com os dados iniciais de Biologia:
   ```bash
   npm run seed
   ```
3. Inicie o servidor da API:
   ```bash
   npm start
   ```
4. Em outro terminal ou janela, abra o frontend em um servidor local (`npx serve .` ou Live Server). O frontend detectará a API e sincronizará automaticamente com o MongoDB Atlas!

---

## ☁️ Como Realizar o Deploy na Vercel

O projeto está 100% configurado para a Vercel através do arquivo `vercel.json` e do fallback `index.html`.

### Passo a passo para publicação:
1. Crie um repositório no seu GitHub (exemplo: `mini-sistema-biologia`).
2. Faça o commit e envie todos os arquivos do projeto para o repositório:
   ```bash
   git init
   git add .
   git commit -m "feat: Mini Sistema Web para disciplina de Biologia"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```
3. Acesse a plataforma [Vercel](https://vercel.com/) e faça login com sua conta do GitHub.
4. Clique no botão **"Add New..." > "Project"**.
5. Selecione o repositório recém-criado.
6. Mantenha as configurações padrão (Framework Preset: *Other*) e clique em **"Deploy"**.
7. Em poucos segundos, sua aplicação estará no ar com HTTPS gratuito e alta disponibilidade.

---

# Entrega

**GitHub:** https://github.com/luiz2k2/biologia

**Vercel:** https://biologia-frontend.vercel.app/
