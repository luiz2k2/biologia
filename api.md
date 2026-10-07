# Especificação da API e Banco de Dados - BioConecta

Este documento descreve a arquitetura de backend, o banco de dados **MongoDB Atlas** e a especificação da API RESTful desenvolvida para o sistema **BioConecta**.

---

## 1. Conexão com o Banco de Dados (MongoDB Atlas)

O sistema conta com suporte oficial ao **MongoDB Atlas** gerenciado via Mongoose:

- **Cluster:** `cluster0.exdsbj0.mongodb.net`
- **String de Conexão Oficial:**
  ```env
  MONGODB_URI=mongodb+srv://isabella:isabella@cluster0.exdsbj0.mongodb.net/biologia?retryWrites=true&w=majority&appName=Cluster0
  ```
- **Banco de Dados padrão:** `biologia`
- **Coleções (`Collections`):**
  - `contents`: Armazena os resumos didáticos de Biologia por temas.
  - `activities`: Armazena as avaliações com questões, alternativas e prazos.
  - `questions`: Banco de questões para simulados e fixação de vestibulares/ENEM.
  - `submissions`: Registro de respostas dos estudantes com cálculo de notas.

---

## 2. Como Iniciar o Backend Localmente

Na pasta raiz do projeto:

```bash
# 1. Entrar na pasta do backend
cd backend

# 2. Instalar dependências (Express, Mongoose, CORS, Dotenv)
npm install

# 3. (Opcional) Popular o MongoDB Atlas com os dados didáticos iniciais
npm run seed

# 4. Iniciar o servidor
npm start
# ou em modo de desenvolvimento contínuo:
npm run dev
```

O servidor iniciará em: **`http://localhost:5000`** e conectará automaticamente ao MongoDB Atlas.

> **Nota de Arquitetura Híbrida:** Se você abrir o frontend diretamente (sem o backend rodando ou hospedado na Vercel), o `storage.js` detecta e utiliza o `LocalStorage` local com os dados didáticos pré-carregados, garantindo que o sistema **nunca pare de funcionar**. Quando o backend do Node.js estiver ativo, ele sincroniza os dados diretamente com o MongoDB Atlas.

---

## 3. Endpoints da API RESTful (`/api`)

- **URL Base:** `http://localhost:5000/api`
- **Formato:** `application/json`

### 3.1 Status da API
#### `GET /api/health`
Retorna a saúde do serviço e o estado da conexão com o MongoDB Atlas.
- **Resposta 200 OK:**
```json
{
  "status": "online",
  "database": "conectado",
  "timestamp": "2026-10-07T18:00:00.000Z"
}
```

---

### 3.2 Conteúdos Didáticos (`/api/contents`)

#### `GET /api/contents`
Retorna todos os conteúdos cadastrados no MongoDB, com suporte a filtros.
- **Parâmetros de Consulta (Query Params):**
  - `tema`: (ex. `Citologia`, `Genética`, `Ecologia`)
  - `search`: termo de busca textual
- **Resposta 200 OK:**
```json
[
  {
    "_id": "660c1d2e9f...",
    "id": "cnt-01",
    "titulo": "Estrutura Celular e Organelas Citoplasmáticas",
    "tema": "Citologia",
    "descricao": "Compreenda a organização da célula eucariótica...",
    "texto": "A célula é a unidade básica estrutural...",
    "imagem": "https://...",
    "linkComplementar": "https://brasilescola.uol.com.br/biologia/citologia.htm",
    "dataPublicacao": "2026-03-01"
  }
]
```

#### `POST /api/contents`
Cadastra um novo conteúdo didático no MongoDB.
- **Corpo da Requisição (Body):**
```json
{
  "titulo": "Herança Genética e Leis de Mendel",
  "tema": "Genética",
  "descricao": "Fundamentos da hereditariedade mendeliana e segregação.",
  "texto": "Gregor Mendel estabeleceu os fundamentos...",
  "imagem": "https://...",
  "linkComplementar": "https://..."
}
```
- **Resposta 201 Created**

#### `PUT /api/contents/:id`
Atualiza um conteúdo existente pelo identificador `id`.

#### `DELETE /api/contents/:id`
Remove um conteúdo do banco de dados.
- **Resposta 204 No Content**

---

### 3.3 Atividades Avaliativas (`/api/activities`)

#### `GET /api/activities`
Lista todas as atividades cadastradas no MongoDB.

#### `POST /api/activities`
Cria uma nova atividade com prazo, pontuação e lista de questões objetivas.
- **Corpo da Requisição (Body):**
```json
{
  "titulo": "Avaliação Formativa de Genética",
  "tema": "Genética",
  "descricao": "Responda as questões sobre a 1ª Lei de Mendel.",
  "prazoEntrega": "2026-05-10",
  "pontuacao": 10.0,
  "questoes": [
    {
      "id": "q1",
      "enunciado": "No cruzamento Aa x Aa, qual a proporção de fenótipo dominante?",
      "alternativas": ["25%", "50%", "75%", "100%"],
      "respostaCorreta": 2,
      "explicacao": "75% dominante (1 AA : 2 Aa)."
    }
  ]
}
```
- **Resposta 201 Created**

#### `DELETE /api/activities/:id`
Remove a atividade pelo identificador.

---

### 3.4 Submissões e Respostas dos Alunos (`/api/submissions`)

#### `GET /api/submissions`
Retorna as submissões registradas. Suporta filtros `?atividadeId=...` e `?alunoId=...`.

#### `POST /api/submissions`
Salva o envio das respostas do estudante com nota calculada.
- **Corpo da Requisição (Body):**
```json
{
  "atividadeId": "atv-01",
  "atividadeTitulo": "Atividade 01: Citologia",
  "alunoId": "alu-01",
  "alunoNome": "Lucas Silva",
  "alunoEmail": "aluno@biologia.edu",
  "nota": 10.0,
  "pontuacaoMaxima": 10.0,
  "acertos": 2,
  "totalQuestoes": 2,
  "respostas": [1, 1]
}
```
- **Resposta 201 Created**

---

### 3.5 Banco de Questões (`/api/questions`)

#### `GET /api/questions`
Lista as questões do banco no MongoDB. Filtros suportados: `?tema=...` e `?dificuldade=...`.

#### `POST /api/questions`
Cadastra uma nova questão no banco geral.
- **Corpo da Requisição (Body):**
```json
{
  "enunciado": "Qual organela é responsável pelo empacotamento de proteínas?",
  "tema": "Citologia",
  "dificuldade": "Fácil",
  "alternativas": ["Complexo Golgiense", "Ribossomo", "Lisossomo", "Vacúolo"],
  "respostaCorreta": 0,
  "explicacao": "O Complexo Golgiense secreta e empacota proteínas do RER."
}
```
- **Resposta 201 Created**

#### `DELETE /api/questions/:id`
Remove a questão do banco.
