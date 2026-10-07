# Contexto do Projeto - BioConecta

## 1. Objetivo do Projeto
O **BioConecta** é um Mini Sistema Web educacional concebido especificamente para a disciplina de **Biologia**, projetado em cooperação pedagógica para aproximar professores e estudantes do Ensino Médio ou Fundamental II. O objetivo primordial é centralizar em uma interface moderna, intuitiva e acolhedora a publicação de materiais didáticos organizados por grandes eixos temáticos da vida, a aplicação de atividades avaliativas interativas e o acompanhamento transparente do desempenho acadêmico.

## 2. Problema que o Sistema Pretende Resolver
No ensino convencional de Biologia, a dispersão de materiais (apostilas em PDF soltas, grupos de mensagens, links aleatórios da internet) dificulta a fixação de temas densos e visuais como Citologia, Genética e Fisiologia Humana. Além disso:
- Professores enfrentam sobrecarga na correção manual de exercícios conceituais e na consolidação de notas formativas;
- Estudantes sentem falta de feedback imediato ao resolverem questões e carecem de um ambiente organizado que classifique o conteúdo por temas e níveis de dificuldade;
- Falta de centralização entre leitura teórica, banco de treino e atividades com prazo de entrega.

O **BioConecta** resolve essas dores integrando conteúdo teórico, exercícios com gabarito imediato fundamentado e métricas de desempenho em tempo real.

## 3. Público-Alvo
1. **Professor da Disciplina**: Responsável pela curadoria dos temas da Biologia, publicação de resumos didáticos, criação de atividades com prazos e pontuações, alimentação do banco de questões e acompanhamento do rendimento da turma.
2. **Alunos**: Discentes que necessitam consultar resumos claros, realizar atividades diagnósticas ou somativas, resolver questões de fixação com explicações pedagógicas e monitorar suas pendências e evolução de notas.

## 4. Funcionalidades Principais
- **Página Inicial Institucional**: Apresentação da disciplina, missão pedagógica, destaques temáticos e call-to-actions de acesso rápido.
- **Autenticação Simulada (Multi-Perfil)**: Acesso dedicado para Professor e Aluno, com atalhos de demonstração (1 clique) para facilidade de avaliação em bancas e salas de aula.
- **Painel do Professor (Dashboard)**: Métricas em tempo real (total de conteúdos, atividades ativas, alunos matriculados, submissões recebidas), atalhos de criação e lista gerencial com acompanhamento individual de notas dos alunos.
- **Painel do Aluno (Dashboard)**: Indicadores de rendimento médio (pontuação em %), atividades pendentes e entregues, resumo de conteúdos recentes e recomendações de estudo.
- **Módulo de Conteúdos Didáticos**:
  - Organização por grandes temas: *Citologia, Genética, Ecologia, Evolução, Fisiologia Humana, Botânica, Zoologia, Microbiologia e Biotecnologia*.
  - Modal de leitura aprofundada com imagens, resumos explicativos e links para materiais complementares.
  - CRUD completo para o professor (Cadastrar, Editar, Excluir).
- **Módulo de Atividades Avaliativas**:
  - Criação de atividades pelo professor com título, descrição, tema, pontuação e data limite.
  - Interface interativa de resolução para o aluno, com validação de respostas, cálculo automático de nota e gabarito com justificativas.
  - Visualização de notas e histórico pelo professor.
- **Banco de Questões e Prática**:
  - Repositório de questões classificadas por Tema e Dificuldade (Fácil, Médio, Difícil).
  - Modo simulado de treino com resolução imediata e explicação pedagógica detalhada.
  - Cadastro de novas questões pelo professor.
- **Pesquisa e Filtros Reativos**:
  - Filtro instantâneo por texto/palavra-chave, seleção por tema e seleção por nível de complexidade.

## 5. Tecnologias Utilizadas
- **Frontend**:
  - **HTML5 Semântico**: Estruturação acessível, uso de `<header>`, `<main>`, `<nav>`, `<section>`, `<article>`, `<dialog>/modals` e `<form>`.
  - **CSS3 Moderno**: Design tokens para paleta biológica (tons de verde esmeralda, bio-verde, cinzas neutros e acentos contrastantes), Flexbox e CSS Grid para layouts responsivos.
  - **JavaScript ES6+ Modular**: Arquitetura baseada em serviços (`StorageService`, `AuthService`, `ContentService`, `ActivityService`, `QuestionService`).
- **Backend & Banco de Dados**:
  - **Node.js com Express**: Criação de rotas RESTful para integração com o banco.
  - **MongoDB Atlas & Mongoose**: Banco de dados NoSQL em nuvem com cluster configurado para persistência duradoura.
  - **Armazenamento Híbrido**: O frontend sincroniza com o MongoDB se o backend estiver disponível, e preserva fallback automático no `LocalStorage` para deploy estático na Vercel.

## 6. Estrutura do Sistema
```
biologia-sistema/
│
├── frontend/
│   ├── index.html          # Ponto de entrada da aplicação (SPA moderna)
│   ├── css/
│   │   ├── styles.css      # Variáveis globais, reset e tipografia
│   │   ├── components.css  # Botões, cards, modais, badges e formulários
│   │   └── responsive.css  # Media queries para mobile e tablet
│   ├── js/
│   │   ├── app.js          # Roteamento de telas e inicialização geral
│   │   ├── auth.js         # Gerenciamento de sessão e autenticação
│   │   ├── storage.js      # Camada híbrida (LocalStorage & MongoDB)
│   │   ├── content.js      # Módulo de conteúdos de Biologia
│   │   ├── activity.js     # Módulo de atividades e submissões
│   │   └── question.js     # Módulo do banco de questões
│   └── assets/             # Ícones vetoriais SVG e elementos gráficos
│
├── backend/
│   ├── server.js           # API RESTful Express
│   ├── seed.js             # Script de população do MongoDB Atlas
│   ├── package.json        # Dependências do backend
│   ├── .env                # Credenciais de conexão do MongoDB Atlas
│   └── models/             # Esquemas Mongoose
│
├── README.md               # Documentação completa para execução e deploy
├── Roadmap.md              # Etapas detalhadas do projeto
├── Contexto.md             # Este documento de contextualização técnica
├── api.md                  # Especificação técnica da API e MongoDB Atlas
└── vercel.json             # Configuração para deploy estático na Vercel
```

## 7. Regras de Funcionamento
1. **Persistência de Dados**: O sistema opera com dupla camada. Na ausência de servidor, armazena e lê no `LocalStorage` do navegador com dados didáticos pré-carregados. Com o servidor Node.js ativo, sincroniza automaticamente com o **MongoDB Atlas**.
2. **Controle de Acesso**:
   - Visitantes não autenticados podem ver a Página Inicial e o catálogo aberto de conteúdos.
   - Ao logar como **Professor**, são liberadas as ações de adição, edição e exclusão de conteúdos, atividades e questões, além de visualização das submissões dos alunos.
   - Ao logar como **Aluno**, são liberadas as interfaces de resolução de atividades, registro de notas e acompanhamento de tarefas pendentes.
3. **Cálculo de Desempenho**: As notas das atividades são apuradas automaticamente pela proporção de acertos sobre a pontuação máxima definida pelo professor, refletindo no painel geral do estudante.

## 8. Estado Atual do Projeto
O sistema encontra-se com todas as funcionalidades centrais implementadas e validadas:
- **Repositório GitHub:** [https://github.com/luiz2k2/biologia](https://github.com/luiz2k2/biologia)
- **Aplicação no ar na Vercel:** [https://biologia-frontend.vercel.app/](https://biologia-frontend.vercel.app/)
- Frontend responsivo concluído e testado;
- Persistência local e integração com MongoDB Atlas implementadas;
- Projeto finalizado e pronto para avaliação docente e acadêmica.
