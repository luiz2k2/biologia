import mongoose from 'mongoose';

const ActivityQuestionSchema = new mongoose.Schema({
  id: { type: String },
  enunciado: { type: String, required: true },
  alternativas: [{ type: String, required: true }],
  respostaCorreta: { type: Number, required: true },
  explicacao: { type: String, default: '' }
});

const ActivitySchema = new mongoose.Schema({
  id: { type: String, unique: true },
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  tema: { type: String, required: true },
  prazoEntrega: { type: String, required: true },
  pontuacao: { type: Number, default: 10.0 },
  dataCriacao: { type: String, default: () => new Date().toISOString().split('T')[0] },
  questoes: [ActivityQuestionSchema]
}, {
  timestamps: true
});

export const Activity = mongoose.model('Activity', ActivitySchema);
