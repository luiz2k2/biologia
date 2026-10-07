import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  atividadeId: { type: String, required: true },
  atividadeTitulo: { type: String, required: true },
  alunoId: { type: String, required: true },
  alunoNome: { type: String, required: true },
  alunoEmail: { type: String, required: true },
  nota: { type: Number, required: true },
  pontuacaoMaxima: { type: Number, required: true },
  acertos: { type: Number, required: true },
  totalQuestoes: { type: Number, required: true },
  dataSubmissao: { type: String, default: () => new Date().toISOString() },
  respostas: [{ type: Number }]
}, {
  timestamps: true
});

export const Submission = mongoose.model('Submission', SubmissionSchema);
