import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import { Content } from './models/Content.js';
import { Activity } from './models/Activity.js';
import { Question } from './models/Question.js';
import { Submission } from './models/Submission.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://isabella:isabella@cluster0.exdsbj0.mongodb.net/biologia?retryWrites=true&w=majority&appName=Cluster0';

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o MongoDB Atlas
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Conexão estabelecida com sucesso com o MongoDB Atlas!');
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB Atlas:', err.message);
  });

// ============================================================================
// ROTAS DA API
// ============================================================================

// 1. Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado',
    timestamp: new Date().toISOString()
  });
});

// 2. Conteúdos Didáticos
app.get('/api/contents', async (req, res) => {
  try {
    const { tema, search } = req.query;
    const filter = {};
    if (tema && tema !== 'Todos') filter.tema = tema;
    if (search) {
      filter.$or = [
        { titulo: new RegExp(search, 'i') },
        { descricao: new RegExp(search, 'i') },
        { texto: new RegExp(search, 'i') }
      ];
    }
    const contents = await Content.find(filter).sort({ createdAt: -1 });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/contents/:id', async (req, res) => {
  try {
    const item = await Content.findOne({ id: req.params.id });
    if (!item) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/contents', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.id) payload.id = 'cnt-' + Date.now();
    if (!payload.dataPublicacao) payload.dataPublicacao = new Date().toISOString().split('T')[0];

    const content = new Content(payload);
    await content.save();
    res.status(201).json(content);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/contents/:id', async (req, res) => {
  try {
    const updated = await Content.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/contents/:id', async (req, res) => {
  try {
    await Content.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Atividades Avaliativas
app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/activities/:id', async (req, res) => {
  try {
    const act = await Activity.findOne({ id: req.params.id });
    if (!act) return res.status(404).json({ error: 'Atividade não encontrada' });
    res.json(act);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.id) payload.id = 'atv-' + Date.now();
    if (!payload.dataCriacao) payload.dataCriacao = new Date().toISOString().split('T')[0];

    const activity = new Activity(payload);
    await activity.save();
    res.status(201).json(activity);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    await Activity.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Submissões de Alunos
app.get('/api/submissions', async (req, res) => {
  try {
    const { atividadeId, alunoId } = req.query;
    const filter = {};
    if (atividadeId) filter.atividadeId = atividadeId;
    if (alunoId) filter.alunoId = alunoId;

    const list = await Submission.find(filter).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/submissions', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.id) payload.id = 'sub-' + Date.now();
    if (!payload.dataSubmissao) payload.dataSubmissao = new Date().toISOString();

    const sub = new Submission(payload);
    await sub.save();
    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Banco de Questões
app.get('/api/questions', async (req, res) => {
  try {
    const { tema, dificuldade } = req.query;
    const filter = {};
    if (tema && tema !== 'Todos') filter.tema = tema;
    if (dificuldade && dificuldade !== 'Todas') filter.dificuldade = dificuldade;

    const questions = await Question.find(filter).sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/questions', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.id) payload.id = 'qst-' + Date.now();

    const qst = new Question(payload);
    await qst.save();
    res.status(201).json(qst);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/questions/:id', async (req, res) => {
  try {
    await Question.findOneAndDelete({ id: req.params.id });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`🚀 BioConecta API rodando na porta ${PORT}`);
  console.log(`📍 Endpoint base: http://localhost:${PORT}/api`);
});
