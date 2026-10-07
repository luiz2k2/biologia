import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Content } from './models/Content.js';
import { Activity } from './models/Activity.js';
import { Question } from './models/Question.js';
import { Submission } from './models/Submission.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://isabella:isabella@cluster0.exdsbj0.mongodb.net/biologia?retryWrites=true&w=majority&appName=Cluster0';

const SEED_CONTENTS = [
  {
    id: 'cnt-01',
    titulo: 'Estrutura Celular e Organelas Citoplasmáticas',
    tema: 'Citologia',
    descricao: 'Compreenda a organização da célula eucariótica animal e vegetal, o papel das organelas e o modelo do mosaico fluido da membrana plasmática.',
    texto: `A célula é a unidade básica estrutural e funcional de todos os organismos vivos. Nas células eucarióticas, destacam-se estruturas membranosas altamente especializadas:

1. Membrana Plasmática: Composta por uma bicamada fosfolipídica associada a proteínas (modelo do mosaico fluido). Controla a permeabilidade seletiva e a sinalização intercelular.
2. Mitocôndrias: Responsáveis pela respiração celular aeróbica e síntese de ATP via ciclo de Krebs e fosforilação oxidativa. Possuem DNA próprio.
3. Complexo Golgiense: Modifica, empacota e secreta proteínas originadas do RER, além de sintetizar lisossomos.
4. Retículo Endoplasmático: Rugoso (síntese de proteínas de exportação) e Liso (síntese de lipídios e desintoxicação celular).
5. Lisossomos: Bolsas enzimáticas que realizam digestão intracelular autofágica e heterofágica.`,
    imagem: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80',
    linkComplementar: 'https://brasilescola.uol.com.br/biologia/citologia.htm',
    dataPublicacao: '2026-03-01'
  },
  {
    id: 'cnt-02',
    titulo: 'Genética Clássica: 1ª e 2ª Leis de Mendel',
    tema: 'Genética',
    descricao: 'Fundamentos da hereditariedade mendeliana, segregação independente, monoibridismo e heredogramas.',
    texto: `Gregor Johann Mendel, em seus experimentos com ervilhas-de-cheiro (Pisum sativum), desvendou as bases matemáticas da transmissão das características hereditárias:

- 1ª Lei de Mendel (Segregação dos Fatores): Cada característica é determinada por dois fatores que se separam na formação dos gametas.
- 2ª Lei de Mendel (Segregação Independente): Alelos de dois ou mais genes diferentes distribuem-se para os gametas de modo independente.`,
    imagem: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    linkComplementar: 'https://mundoeducacao.uol.com.br/biologia/leis-mendel.htm',
    dataPublicacao: '2026-03-08'
  },
  {
    id: 'cnt-03',
    titulo: 'Dinâmica de Ecossistemas e Cadeias Tróficas',
    tema: 'Ecologia',
    descricao: 'Fluxo unidirecional de energia, ciclos biogeoquímicos e níveis tróficos produtores e consumidores.',
    texto: `A ecologia investiga as relações entre os seres vivos e o meio ambiente físico-químico. O fluxo de energia é unidirecional e decrescente ao longo dos níveis tróficos, enquanto a matéria é cíclica graças aos decompositores.`,
    imagem: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    linkComplementar: 'https://www.biologianet.com/ecologia/cadeia-alimentar.htm',
    dataPublicacao: '2026-03-15'
  }
];

const SEED_ACTIVITIES = [
  {
    id: 'atv-01',
    titulo: 'Atividade 01: Citologia e Fisiologia das Organelas',
    descricao: 'Avaliação de fixação sobre os papéis das organelas celulares e o transporte através da membrana.',
    tema: 'Citologia',
    dataCriacao: '2026-03-02',
    prazoEntrega: '2026-04-20',
    pontuacao: 10.0,
    questoes: [
      {
        id: 'q1',
        enunciado: 'Qual organela celular é a principal responsável pela produção aeróbica de ATP e possui seu próprio DNA circular?',
        alternativas: [
          'Complexo Golgiense',
          'Mitocôndria',
          'Retículo Endoplasmático Liso',
          'Ribossomo 80S'
        ],
        respostaCorreta: 1,
        explicacao: 'A mitocôndria é responsável pela respiração celular aeróbica e possui DNA circular próprio.'
      }
    ]
  }
];

const SEED_QUESTIONS = [
  {
    id: 'qst-01',
    enunciado: 'Qual organela celular é responsável pela modificação de proteínas e formação do acrossomo nos espermatozoides?',
    tema: 'Citologia',
    dificuldade: 'Fácil',
    alternativas: [
      'Complexo Golgiense',
      'Retículo Endoplasmático Rugoso',
      'Centríolo',
      'Peroxissomo'
    ],
    respostaCorreta: 0,
    explicacao: 'O Complexo Golgiense processa e secreta macromoléculas e origina o acrossomo.'
  }
];

async function seed() {
  try {
    console.log('Conectando ao MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado!');

    console.log('Populando dados didáticos...');
    await Content.deleteMany({});
    await Activity.deleteMany({});
    await Question.deleteMany({});

    await Content.insertMany(SEED_CONTENTS);
    await Activity.insertMany(SEED_ACTIVITIES);
    await Question.insertMany(SEED_QUESTIONS);

    console.log('✅ Seed executado com sucesso no MongoDB Atlas!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao executar seed:', err);
    process.exit(1);
  }
}

seed();
