/**
 * BioConecta - Camada de Persistência e Armazenamento (StorageService)
 * Suporta modo Híbrido:
 * 1. Conexão direta com API RESTful e MongoDB Atlas (quando o backend estiver ativo).
 * 2. Armazenamento LocalStorage no navegador (para funcionamento autônomo e deploy estático na Vercel).
 */

const STORAGE_KEYS = {
  CONTENTS: 'bioconecta_contents_v1',
  ACTIVITIES: 'bioconecta_activities_v1',
  QUESTIONS: 'bioconecta_questions_v1',
  SUBMISSIONS: 'bioconecta_submissions_v1',
  STUDENTS: 'bioconecta_students_v1',
  INITIALIZED: 'bioconecta_initialized_v1'
};

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : null;

// ============================================================================
// DADOS INICIAIS DE DEMONSTRAÇÃO (SEED DIDÁTICO REAL)
// ============================================================================

const SEED_STUDENTS = [
  { id: 'alu-01', nome: 'Lucas Silva', email: 'aluno@biologia.edu', turma: '3º Ano A - Médio', avatar: 'LS' },
  { id: 'alu-02', nome: 'Beatriz Costa', email: 'beatriz@biologia.edu', turma: '3º Ano A - Médio', avatar: 'BC' },
  { id: 'alu-03', nome: 'Gabriel Santos', email: 'gabriel@biologia.edu', turma: '3º Ano A - Médio', avatar: 'GS' }
];

const SEED_CONTENTS = [
  {
    id: 'cnt-01',
    titulo: 'Estrutura Celular e Organelas Citoplasmáticas',
    tema: 'Citologia',
    descricao: 'Compreenda a organização da célula eucariótica animal e vegetal, o papel das organelas e o modelo do mosaico fluido da membrana plasmática.',
    texto: `A célula é a unidade básica estrutural e funcional de todos os organismos vivos. Nas células eucarióticas, destacam-se estruturas membranosas altamente especializadas:

1. **Membrana Plasmática**: Composta por uma bicamada fosfolipídica associada a proteínas (modelo do mosaico fluido de Singer e Nicolson). Controla a permeabilidade seletiva e a sinalização intercelular.
2. **Mitocôndrias**: Responsáveis pela respiração celular aeróbica e síntese de ATP via ciclo de Krebs e fosforilação oxidativa. Possuem DNA próprio e herança estritamente materna na espécie humana.
3. **Complexo Golgiense**: Modifica, empacota e secreta proteínas originadas do retículo endoplasmático rugoso, além de sintetizar lisossomos e formar o acrossomo no espermatozoide.
4. **Retículo Endoplasmático**: Dividido em Rugoso (com ribossomos, síntese de proteínas de exportação) e Liso (síntese de lipídios e desintoxicação celular).
5. **Lisossomos**: Bolsas enzimáticas que realizam digestão intracelular autofágica e heterofágica.`,
    imagem: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80',
    linkComplementar: 'https://brasilescola.uol.com.br/biologia/citologia.htm',
    dataPublicacao: '2026-03-01'
  },
  {
    id: 'cnt-02',
    titulo: 'Genética Clássica: 1ª e 2ª Leis de Mendel',
    tema: 'Genética',
    descricao: 'Fundamentos da hereditariedade mendeliana, segregação independente, monoibridismo, quadros de Punnett e heredogramas.',
    texto: `Gregor Johann Mendel, em seus experimentos com ervilhas-de-cheiro (*Pisum sativum*), desvendou as bases matemáticas da transmissão das características hereditárias:

- **1ª Lei de Mendel (Lei da Segregação dos Fatores)**: Cada característica é determinada por dois fatores (alelos) que se separam durante a formação dos gametas, de modo que cada gameta recebe apenas um alelo.
- **Conceitos fundamentais**:
  - *Genótipo*: Conjunto dos alelos de um indivíduo (ex: AA, Aa, aa).
  - *Fenótipo*: Expressão observável ou bioquímica decorrente da interação entre genótipo e ambiente.
  - *Dominância completa*: O alelo dominante manifesta-se tanto em homozigose (AA) quanto em heterozigose (Aa).
- **2ª Lei de Mendel (Segregação Independente)**: Alelos de dois ou mais genes diferentes distribuem-se para os gametas de modo independente, desde que estejam localizados em cromossomos não homólogos (sem ligação gênica / *linkage*).`,
    imagem: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    linkComplementar: 'https://mundoeducacao.uol.com.br/biologia/leis-mendel.htm',
    dataPublicacao: '2026-03-08'
  },
  {
    id: 'cnt-03',
    titulo: 'Dinâmica de Ecossistemas e Cadeias Tróficas',
    tema: 'Ecologia',
    descricao: 'Fluxo unidirecional de energia, ciclos biogeoquímicos (água, carbono e nitrogênio) e níveis tróficos produtores e consumidores.',
    texto: `A ecologia investiga as relações entre os seres vivos (fatores bióticos) e o ambiente físico-químico (fatores abióticos).

**Fluxo de Energia e Ciclo da Matéria**:
- O fluxo de energia é unidirecional e decrescente ao longo dos níveis tróficos. A maior quantidade de energia disponível encontra-se no nível dos produtores (fotossintetizantes) e dissipa-se na forma de calor para o meio ambiente.
- A matéria, por outro lado, é cíclica, dependendo crucialmente da ação dos decompositores (fungos e bactérias) para retornar minerais essenciais aos ciclos biogeoquímicos.

**Pirâmides Ecológicas**:
- *Pirâmide de Energia*: Nunca pode ser invertida, respeitando a segunda lei da termodinâmica.
- *Pirâmides de Números e Biomassa*: Podem assumir conformação invertida em circunstâncias específicas (ex: uma grande árvore sustentando milhares de insetos herbívoros).`,
    imagem: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    linkComplementar: 'https://www.biologianet.com/ecologia/cadeia-alimentar.htm',
    dataPublicacao: '2026-03-15'
  },
  {
    id: 'cnt-04',
    titulo: 'Teoria Sintética da Evolução (Neodarwinismo)',
    tema: 'Evolução',
    descricao: 'Seleção natural, mutação gênica, recombinação cromossômica, deriva genética e especiação alopátrica.',
    texto: `A Teoria Sintética da Evolução consolidou a seleção natural proposta por Charles Darwin com os conhecimentos contemporâneos de genética molecular:

1. **Fontes Primárias de Variabilidade Genética**:
   - *Mutações*: Alterações aleatórias na sequência de nucleotídeos do DNA. São a única fonte original de novos alelos.
   - *Recombinação gênica*: Ocorre durante a meiose através do *crossing-over* e da segregação independente dos cromossomos homólogos.
2. **Fatores que atuam sobre a Variabilidade**:
   - *Seleção Natural*: Direcional, estabilizadora ou disruptiva. Favorece indivíduos com fenótipos mais aptos a determinado nicho ecológico.
   - *Deriva Genética*: Flutuações casuais nas frequências alélicas, especialmente impactantes em populações reduzidas (efeito fundador e gargalo populacional).`,
    imagem: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
    linkComplementar: 'https://brasilescola.uol.com.br/biologia/teoria-sintetica-evolucao.htm',
    dataPublicacao: '2026-03-22'
  },
  {
    id: 'cnt-05',
    titulo: 'Fisiologia Cardiovascular e Respiratória Humana',
    tema: 'Fisiologia Humana',
    descricao: 'Circulação sanguínea sistêmica e pulmonar, trocas gasosas alveolares (hematose) e regulação do pH sanguíneo.',
    texto: `A manutenção da homeostase corporal humana depende do funcionamento coordenado dos sistemas de transporte e oxigenação:

- **Sistema Circulatório**: O coração humano possui 4 câmaras (dois átrios e dois ventrículos), impedindo a mistura de sangue venoso (rico em CO2) e sangue arterial (oxigenado).
- **Grande e Pequena Circulação**:
  - *Circulação Sistêmica*: Ventrículo esquerdo -> Aorta -> Tecidos do corpo -> Veias Cavas -> Átrio direito.
  - *Circulação Pulmonar*: Ventrículo direito -> Artérias Pulmonares -> Pulmões (hematose) -> Veias Pulmonares -> Átrio esquerdo.
- **Hematose**: Ocorre nos alvéolos pulmonares por difusão simples de gases guiada pelos gradientes de pressão parcial de O2 e CO2.`,
    imagem: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80',
    linkComplementar: 'https://www.todabiologia.com/anatomia/sistema_circulatorio.htm',
    dataPublicacao: '2026-03-29'
  },
  {
    id: 'cnt-06',
    titulo: 'Biotecnologia: DNA Recombinante e CRISPR',
    tema: 'Biotecnologia',
    descricao: 'Enzimas de restrição, vetores plasmídicos, clonagem molecular e edição gênica por CRISPR-Cas9 aplicada à medicina e agropecuária.',
    texto: `A Biotecnologia moderna utiliza ferramentas da biologia molecular para modificar organismos e solucionar desafios industriais, médicos e ambientais:

- **Tecnologia do DNA Recombinante**: Utilização de endonucleases de restrição (enzimas que cortam o DNA em sequências palindrômicas específicas) e DNA ligases para inserir genes de interesse em plasmídeos bacterianos, permitindo a produção de insulina humana recombinante em larga escala.
- **CRISPR-Cas9**: Sistema de defesa bacteriano adaptado como ferramenta de precisão cirúrgica no genoma, guiada por RNA direcionador (gRNA).`,
    imagem: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=800&q=80',
    linkComplementar: 'https://brasilescola.uol.com.br/biologia/biotecnologia.htm',
    dataPublicacao: '2026-04-02'
  }
];

const SEED_ACTIVITIES = [
  {
    id: 'atv-01',
    titulo: 'Atividade 01: Citologia e Fisiologia das Organelas',
    descricao: 'Avaliação de fixação sobre os papéis das organelas celulares e o transporte através da membrana plasmática.',
    tema: 'Citologia',
    dataCriacao: '2026-03-02',
    prazoEntrega: '2026-04-20',
    pontuacao: 10.0,
    questoes: [
      {
        id: 'q1',
        enunciado: 'Qual organela celular é a principal responsável pela produção aeróbica de ATP e possui seu próprio material genético circular com capacidade de autoduplicação?',
        alternativas: [
          'Complexo Golgiense',
          'Mitocôndria',
          'Retículo Endoplasmático Liso',
          'Ribossomo 80S'
        ],
        respostaCorreta: 1,
        explicacao: 'A mitocôndria é responsável pela respiração celular aeróbica e possui DNA circular próprio, apoiando a teoria endossimbiótica.'
      },
      {
        id: 'q2',
        enunciado: 'O processo de osmose em uma célula animal colocada em meio fortemente hipertônico resulta em:',
        alternativas: [
          'Entrada massiva de água e lise osmótica da célula.',
          'Saída de água por transporte passivo, tornando a célula crenada.',
          'Transporte ativo primário de solutos para igualar as pressões.',
          'Síntese imediata de parede celular de celulose protetora.'
        ],
        respostaCorreta: 1,
        explicacao: 'Em meio hipertônico, a água sai da célula por osmose a favor do gradiente de potencial hídrico, provocando retração de volume (crenação).'
      }
    ]
  },
  {
    id: 'atv-02',
    titulo: 'Atividade 02: Cruzamentos Genéticos e Mendelismo',
    descricao: 'Exercícios práticos envolvendo cálculo de probabilidades genéticas e análise de monoibridismo.',
    tema: 'Genética',
    dataCriacao: '2026-03-10',
    prazoEntrega: '2026-04-25',
    pontuacao: 10.0,
    questoes: [
      {
        id: 'q1',
        enunciado: 'Do cruzamento entre dois indivíduos heterozigotos (Aa x Aa) para uma característica monogênica de dominância completa, qual a probabilidade esperada de nascer um descendente com fenótipo dominante?',
        alternativas: [
          '25% (1/4)',
          '50% (2/4)',
          '75% (3/4)',
          '100% (4/4)'
        ],
        respostaCorreta: 2,
        explicacao: 'O quadro de Punnett para Aa x Aa gera 1 AA : 2 Aa : 1 aa. Os genótipos AA e Aa manifestam o fenótipo dominante, totalizando 3 em 4 (75%).'
      },
      {
        id: 'q2',
        enunciado: 'Qual o termo técnico utilizado para descrever indivíduos que possuem dois alelos idênticos para um determinado loco gênico?',
        alternativas: [
          'Heterozigotos',
          'Homozigotos',
          'Hemizigotos recessivos',
          'Poligênicos'
        ],
        respostaCorreta: 1,
        explicacao: 'Indivíduos homozigotos possuem pares de alelos idênticos (AA ou aa).'
      }
    ]
  },
  {
    id: 'atv-03',
    titulo: 'Atividade 03: Relações Ecológicas e Ciclos Biogeoquímicos',
    descricao: 'Análise de impactos ambientais, relações intra e interespecíficas e o ciclo do nitrogênio.',
    tema: 'Ecologia',
    dataCriacao: '2026-03-16',
    prazoEntrega: '2026-04-30',
    pontuacao: 10.0,
    questoes: [
      {
        id: 'q1',
        enunciado: 'A associação harmônica obrigatória entre fungos e algas unicelulares para formação dos líquens constitui um clássico exemplo de:',
        alternativas: [
          'Comensalismo',
          'Mutualismo',
          'Inquilinismo',
          'Protocooperação facultativa'
        ],
        respostaCorreta: 1,
        explicacao: 'No mutualismo, ambas as espécies se beneficiam mutuamente e a relação é imprescindível para a sobrevivência em condições naturais.'
      },
      {
        id: 'q2',
        enunciado: 'No ciclo do nitrogênio, a conversão biológica de nitratos (NO3-) de volta a nitrogênio gasoso (N2) devolvendo-o à atmosfera é efetuada por bactérias:',
        alternativas: [
          'Fixadoras (Rhizobium)',
          'Nitrosantes (Nitrosomonas)',
          'Nitratantes (Nitrobacter)',
          'Desnitrificantes (Pseudomonas)'
        ],
        respostaCorreta: 3,
        explicacao: 'As bactérias desnitrificantes fecham o ciclo reconvertendo nitratos em N2 em solos anaeróbios.'
      }
    ]
  },
  {
    id: 'atv-04',
    titulo: 'Atividade 04: Mecanismos de Seleção e Adaptação',
    descricao: 'Fixação de conceitos da teoria sintética da evolução e tipos de seleção natural.',
    tema: 'Evolução',
    dataCriacao: '2026-03-24',
    prazoEntrega: '2026-05-05',
    pontuacao: 10.0,
    questoes: [
      {
        id: 'q1',
        enunciado: 'Qual das alternativas apresenta um exemplo de estrutura homóloga entre diferentes linhagens de vertebrados?',
        alternativas: [
          'Asa de morcego e asa de borboleta.',
          'Nadadeira peitoral de baleia e braço humano.',
          'Olho de polvo e olho humano.',
          'Nadadeira de tubarão e nadadeira de golfinho.'
        ],
        respostaCorreta: 1,
        explicacao: 'Estruturas homólogas possuem a mesma origem embriológica comum (divergência evolutiva), como a nadadeira da baleia e o braço humano.'
      }
    ]
  }
];

const SEED_QUESTIONS = [
  {
    id: 'qst-01',
    enunciado: 'Qual é a principal organela celular responsável pela modificação de proteínas e formação do acrossomo nos espermatozoides?',
    tema: 'Citologia',
    dificuldade: 'Fácil',
    alternativas: [
      'Complexo Golgiense',
      'Retículo Endoplasmático Rugoso',
      'Centríolo',
      'Peroxissomo'
    ],
    respostaCorreta: 0,
    explicacao: 'O Complexo Golgiense processa e secreta macromoléculas e origina a vesícula acrossômica, fundamental na fecundação.'
  },
  {
    id: 'qst-02',
    enunciado: 'Qual dos seguintes tipos de transporte celular ocorre CONTRA o gradiente de concentração, exigindo consumo direto de ATP?',
    tema: 'Citologia',
    dificuldade: 'Médio',
    alternativas: [
      'Difusão simples',
      'Difusão facilitada através de permeases',
      'Bomba de Sódio e Potássio (Na+/K+)',
      'Osmose hídrica'
    ],
    respostaCorreta: 2,
    explicacao: 'A bomba de Na+/K+ é um clássico transporte ativo primário, mantendo concentrações desiguais com gasto de ATP.'
  },
  {
    id: 'qst-03',
    enunciado: 'Se uma planta heterozigota de sementes amarelas (Vv) for autofecundada, qual será a proporção fenotípica esperada na geração descendente?',
    tema: 'Genética',
    dificuldade: 'Fácil',
    alternativas: [
      '1 amarela : 1 verde',
      '3 amarelas : 1 verde',
      '1 amarela : 2 mescladas : 1 verde',
      '100% de sementes verdes'
    ],
    respostaCorreta: 1,
    explicacao: 'Autofecundação de Vv x Vv resulta em proporção fenotípica mendeliana de 3 dominantes (amarelas) para 1 recessiva (verde).'
  },
  {
    id: 'qst-04',
    enunciado: 'Por que o fluxo de energia em um ecossistema é estritamente unidirecional, ao contrário do ciclo da matéria?',
    tema: 'Ecologia',
    dificuldade: 'Médio',
    alternativas: [
      'Porque a energia é integralmente consumida pelos produtores primários.',
      'Porque parcela da energia é dissipada em cada nível trófico na forma de calor, não sendo reaproveitada.',
      'Porque os decompositores absorvem 100% da energia restante.',
      'Porque a fotossíntese opera sem perdas energéticas.'
    ],
    respostaCorreta: 1,
    explicacao: 'De acordo com as leis da termodinâmica, a cada nível trófico ocorrem perdas metabólicas na forma de calor não reaproveitável biologicamente.'
  },
  {
    id: 'qst-05',
    enunciado: 'A resistência de bactérias a antibióticos observada em hospitais é mais acuradamente explicada pelo conceito neodarwinista como decorrência de:',
    tema: 'Evolução',
    dificuldade: 'Médio',
    alternativas: [
      'Indução direta de mutações defensivas pelo antibiótico nas bactérias.',
      'Seleção natural de variantes bacterianas pré-existentes portadoras de mutações benéficas de resistência.',
      'Herança dos caracteres adquiridos proposta por Lamarck.',
      'Aclimatização metabólica individual bacteriana.'
    ],
    respostaCorreta: 1,
    explicacao: 'O antibiótico atua como agente seletivo; variantes com mutações favoráveis prévias sobrevivem e proliferam com vantagem adaptativa.'
  },
  {
    id: 'qst-06',
    enunciado: 'Em qual cavidade do coração humano desembocam as quatro veias pulmonares conduzindo sangue arterial oxigenado?',
    tema: 'Fisiologia Humana',
    dificuldade: 'Fácil',
    alternativas: [
      'Átrio direito',
      'Átrio esquerdo',
      'Ventrículo direito',
      'Ventrículo esquerdo'
    ],
    respostaCorreta: 1,
    explicacao: 'O sangue oxigenado na hematose pulmonar retorna ao coração através das veias pulmonares desembocando no átrio esquerdo.'
  },
  {
    id: 'qst-07',
    enunciado: 'Nas angiospermas, o tecido vegetal condutor de seiva elaborada (orgânica rica em sacarose) dos órgãos fotossintetizantes para o restante da planta é o:',
    tema: 'Botânica',
    dificuldade: 'Fácil',
    alternativas: [
      'Xilema',
      'Floema',
      'Esclerênquima',
      'Colênquima'
    ],
    respostaCorreta: 1,
    explicacao: 'O floema (líber) é formado por elementos crivados vivos especializados no transporte de seiva orgânica elaborada.'
  },
  {
    id: 'qst-08',
    enunciado: 'Na técnica de DNA recombinante, qual a função das enzimas de restrição (endonucleases)?',
    tema: 'Biotecnologia',
    dificuldade: 'Difícil',
    alternativas: [
      'Ligar fragmentos de DNA fosfodiéster.',
      'Cortar a molécula de DNA em sequências nucleotídicas palindrômicas específicas.',
      'Sintetizar cópias de RNA mensageiro.',
      'Replicar plasmídeos in vitro sob temperatura constante.'
    ],
    respostaCorreta: 1,
    explicacao: 'As enzimas de restrição atuam como tesouras moleculares reconhecendo sítios palindrômicos específicos de clivagem.'
  }
];

const SEED_SUBMISSIONS = [
  {
    id: 'sub-01',
    atividadeId: 'atv-01',
    atividadeTitulo: 'Atividade 01: Citologia e Fisiologia das Organelas',
    alunoId: 'alu-01',
    alunoNome: 'Lucas Silva',
    alunoEmail: 'aluno@biologia.edu',
    nota: 10.0,
    pontuacaoMaxima: 10.0,
    acertos: 2,
    totalQuestoes: 2,
    dataSubmissao: '2026-03-12T14:35:00Z',
    respostas: [1, 1]
  },
  {
    id: 'sub-02',
    atividadeId: 'atv-01',
    atividadeTitulo: 'Atividade 01: Citologia e Fisiologia das Organelas',
    alunoId: 'alu-02',
    alunoNome: 'Beatriz Costa',
    alunoEmail: 'beatriz@biologia.edu',
    nota: 5.0,
    pontuacaoMaxima: 10.0,
    acertos: 1,
    totalQuestoes: 2,
    dataSubmissao: '2026-03-13T10:15:00Z',
    respostas: [1, 0]
  },
  {
    id: 'sub-03',
    atividadeId: 'atv-02',
    atividadeTitulo: 'Atividade 02: Cruzamentos Genéticos e Mendelismo',
    alunoId: 'alu-01',
    alunoNome: 'Lucas Silva',
    alunoEmail: 'aluno@biologia.edu',
    nota: 10.0,
    pontuacaoMaxima: 10.0,
    acertos: 2,
    totalQuestoes: 2,
    dataSubmissao: '2026-03-18T16:20:00Z',
    respostas: [2, 1]
  }
];

// ============================================================================
// SERVIÇO DE ARMAZENAMENTO HÍBRIDO (LOCALSTORAGE + API MONGODB ATLAS)
// ============================================================================

export const StorageService = {
  isApiAvailable: false,

  async init() {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      this.resetToDefaults();
    }

    // Tenta detectar se a API com MongoDB Atlas está rodando localmente
    if (API_BASE_URL) {
      try {
        const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(1000) });
        if (res.ok) {
          const data = await res.json();
          this.isApiAvailable = true;
          console.log('📡 BioConecta conectado ao backend e MongoDB Atlas!', data);
        }
      } catch {
        this.isApiAvailable = false;
        console.log('💾 BioConecta operando em modo autônomo com LocalStorage.');
      }
    }
  },

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.CONTENTS, JSON.stringify(SEED_CONTENTS));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(SEED_ACTIVITIES));
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(SEED_QUESTIONS));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(SEED_SUBMISSIONS));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(SEED_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  },

  // Conteúdos
  getContents() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTENTS) || '[]');
  },

  getContentById(id) {
    const list = this.getContents();
    return list.find(item => item.id === id) || null;
  },

  saveContent(content) {
    const list = this.getContents();
    if (content.id) {
      const idx = list.findIndex(c => c.id === content.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...content };
      } else {
        list.push(content);
      }
    } else {
      content.id = 'cnt-' + Date.now();
      content.dataPublicacao = new Date().toISOString().split('T')[0];
      list.unshift(content);
    }
    localStorage.setItem(STORAGE_KEYS.CONTENTS, JSON.stringify(list));

    // Se a API estiver ativa, sincroniza em segundo plano com o MongoDB
    if (this.isApiAvailable && API_BASE_URL) {
      fetch(`${API_BASE_URL}/contents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      }).catch(err => console.warn('Sync API warning:', err));
    }

    return content;
  },

  deleteContent(id) {
    let list = this.getContents();
    list = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.CONTENTS, JSON.stringify(list));

    if (this.isApiAvailable && API_BASE_URL) {
      fetch(`${API_BASE_URL}/contents/${id}`, { method: 'DELETE' })
        .catch(err => console.warn('Sync API warning:', err));
    }

    return true;
  },

  // Atividades
  getActivities() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITIES) || '[]');
  },

  getActivityById(id) {
    const list = this.getActivities();
    return list.find(a => a.id === id) || null;
  },

  saveActivity(activity) {
    const list = this.getActivities();
    if (activity.id) {
      const idx = list.findIndex(a => a.id === activity.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...activity };
      } else {
        list.push(activity);
      }
    } else {
      activity.id = 'atv-' + Date.now();
      activity.dataCriacao = new Date().toISOString().split('T')[0];
      list.unshift(activity);
    }
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(list));

    if (this.isApiAvailable && API_BASE_URL) {
      fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity)
      }).catch(err => console.warn('Sync API warning:', err));
    }

    return activity;
  },

  deleteActivity(id) {
    let list = this.getActivities();
    list = list.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(list));

    if (this.isApiAvailable && API_BASE_URL) {
      fetch(`${API_BASE_URL}/activities/${id}`, { method: 'DELETE' })
        .catch(err => console.warn('Sync API warning:', err));
    }

    return true;
  },

  // Questões do Banco
  getQuestions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUESTIONS) || '[]');
  },

  saveQuestion(question) {
    const list = this.getQuestions();
    if (!question.id) {
      question.id = 'qst-' + Date.now();
      list.unshift(question);
    } else {
      const idx = list.findIndex(q => q.id === question.id);
      if (idx !== -1) list[idx] = { ...list[idx], ...question };
    }
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(list));

    if (this.isApiAvailable && API_BASE_URL) {
      fetch(`${API_BASE_URL}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(question)
      }).catch(err => console.warn('Sync API warning:', err));
    }

    return question;
  },

  deleteQuestion(id) {
    let list = this.getQuestions();
    list = list.filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(list));

    if (this.isApiAvailable && API_BASE_URL) {
      fetch(`${API_BASE_URL}/questions/${id}`, { method: 'DELETE' })
        .catch(err => console.warn('Sync API warning:', err));
    }

    return true;
  },

  // Submissões de Alunos
  getSubmissions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
  },

  saveSubmission(submission) {
    const list = this.getSubmissions();
    submission.id = 'sub-' + Date.now();
    submission.dataSubmissao = new Date().toISOString();
    list.unshift(submission);
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));

    if (this.isApiAvailable && API_BASE_URL) {
      fetch(`${API_BASE_URL}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission)
      }).catch(err => console.warn('Sync API warning:', err));
    }

    return submission;
  },

  getSubmissionsByStudent(studentId) {
    const list = this.getSubmissions();
    return list.filter(s => s.alunoId === studentId);
  },

  getSubmissionsByActivity(activityId) {
    const list = this.getSubmissions();
    return list.filter(s => s.atividadeId === activityId);
  },

  // Alunos
  getStudents() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
  }
};
