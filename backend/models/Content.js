import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  titulo: { type: String, required: true },
  tema: { 
    type: String, 
    required: true,
    enum: [
      'Citologia', 'Genética', 'Ecologia', 'Evolução', 
      'Fisiologia Humana', 'Botânica', 'Zoologia', 
      'Microbiologia', 'Biotecnologia'
    ]
  },
  descricao: { type: String, required: true },
  texto: { type: String, required: true },
  imagem: { type: String, default: '' },
  linkComplementar: { type: String, default: '' },
  dataPublicacao: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, {
  timestamps: true
});

export const Content = mongoose.model('Content', ContentSchema);
