import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  enunciado: { type: String, required: true },
  tema: { type: String, required: true },
  dificuldade: { 
    type: String, 
    enum: ['Fácil', 'Médio', 'Difícil'], 
    default: 'Médio' 
  },
  alternativas: [{ type: String, required: true }],
  respostaCorreta: { type: Number, required: true },
  explicacao: { type: String, default: '' }
}, {
  timestamps: true
});

export const Question = mongoose.model('Question', QuestionSchema);
