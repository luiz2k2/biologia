/**
 * BioConecta - Módulo do Banco de Questões de Biologia
 * Prática de exercícios para alunos com explicação imediata e cadastro pelo professor.
 */

import { StorageService } from './storage.js';
import { AuthService } from './auth.js';

export const QuestionModule = {
  activeThemeFilter: 'Todos',
  activeDiffFilter: 'Todas',
  userAnswersState: {}, // Armazena escolhas do usuário durante a sessão de treino

  init() {
    this.bindEvents();
    this.renderQuestionsList();
  },

  bindEvents() {
    const themeSelect = document.getElementById('filter-question-theme');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => {
        this.activeThemeFilter = e.target.value;
        this.renderQuestionsList();
      });
    }

    const diffSelect = document.getElementById('filter-question-diff');
    if (diffSelect) {
      diffSelect.addEventListener('change', (e) => {
        this.activeDiffFilter = e.target.value;
        this.renderQuestionsList();
      });
    }

    const btnNew = document.getElementById('btn-new-question');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        this.openNewQuestionModal();
      });
    }

    const form = document.getElementById('question-create-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveQuestion();
      });
    }
  },

  getThemeBadgeClass(tema) {
    const slug = (tema || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
    return `badge-${slug}`;
  },

  getDiffBadgeClass(diff) {
    if (diff === 'Fácil') return 'badge-diff-facil';
    if (diff === 'Médio') return 'badge-diff-medio';
    if (diff === 'Difícil') return 'badge-diff-dificil';
    return '';
  },

  renderQuestionsList() {
    const container = document.getElementById('questions-list-container');
    if (!container) return;

    const allQuestions = StorageService.getQuestions();
    const isProfessor = AuthService.isProfessor();

    const filtered = allQuestions.filter(q => {
      const matchTheme = (this.activeThemeFilter === 'Todos' || q.tema === this.activeThemeFilter);
      const matchDiff = (this.activeDiffFilter === 'Todas' || q.dificuldade === this.activeDiffFilter);
      return matchTheme && matchDiff;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🧬</div>
          <h3 class="empty-state-title">Nenhuma questão encontrada</h3>
          <p>Tente alterar os filtros de tema ou nível de dificuldade.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((q, idx) => {
      const answeredOption = this.userAnswersState[q.id];
      const isAnswered = answeredOption !== undefined;
      const isCorrect = isAnswered && answeredOption === q.respostaCorreta;

      return `
        <div class="card" style="margin-bottom: 1.5rem;" data-qid="${q.id}">
          <div class="card-header">
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
              <span class="badge ${this.getThemeBadgeClass(q.tema)}">${q.tema}</span>
              <span class="badge ${this.getDiffBadgeClass(q.dificuldade)}">${q.dificuldade}</span>
              <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">Questão #${idx + 1}</span>
            </div>

            ${isProfessor ? `
              <button type="button" class="btn btn-outline btn-sm btn-delete-qst" data-id="${q.id}" title="Excluir questão" style="color: var(--danger);">
                🗑️
              </button>
            ` : ''}
          </div>

          <div class="card-body">
            <p style="font-size: 1rem; font-weight: 600; color: var(--text-main); line-height: 1.5; margin-bottom: 1.25rem;">
              ${q.enunciado}
            </p>

            <div class="options-container" style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${q.alternativas.map((alt, optIdx) => {
                let statusClass = '';
                if (isAnswered) {
                  if (optIdx === q.respostaCorreta) statusClass = 'correct';
                  else if (optIdx === answeredOption) statusClass = 'incorrect';
                }

                return `
                  <label class="option-choice-label ${optIdx === answeredOption ? 'selected' : ''} ${statusClass}" 
                    style="${isAnswered ? 'cursor: default;' : 'cursor: pointer;'}">
                    <input type="radio" name="bank_q_${q.id}" value="${optIdx}" 
                      ${optIdx === answeredOption ? 'checked' : ''}
                      ${isAnswered ? 'disabled' : ''}>
                    <span>${alt}</span>
                  </label>
                `;
              }).join('')}
            </div>

            ${!isAnswered ? `
              <div style="margin-top: 1rem;">
                <button type="button" class="btn btn-primary btn-sm btn-check-answer" data-id="${q.id}">
                  Verificar Resposta
                </button>
              </div>
            ` : `
              <div class="question-feedback-box" style="margin-top: 1.25rem; border-color: ${isCorrect ? 'var(--success)' : 'var(--danger)'};">
                <div style="font-weight: 700; margin-bottom: 0.25rem; color: ${isCorrect ? 'var(--success)' : 'var(--danger)'};">
                  ${isCorrect ? '🎉 Parabéns, resposta correta!' : '❌ Ops! Resposta incorreta.'}
                </div>
                <div><strong>Comentário pedagógico:</strong> ${q.explicacao}</div>
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Listener para verificar resposta
    container.querySelectorAll('.btn-check-answer').forEach(btn => {
      btn.addEventListener('click', () => {
        const qid = btn.dataset.id;
        const selected = container.querySelector(`input[name="bank_q_${qid}"]:checked`);
        if (!selected) {
          window.showToast?.('Selecione uma alternativa antes de verificar.', 'warning');
          return;
        }
        this.userAnswersState[qid] = parseInt(selected.value, 10);
        this.renderQuestionsList();
      });
    });

    if (isProfessor) {
      container.querySelectorAll('.btn-delete-qst').forEach(btn => {
        btn.addEventListener('click', () => this.confirmDeleteQuestion(btn.dataset.id));
      });
    }
  },

  openNewQuestionModal() {
    const modal = document.getElementById('modal-new-question');
    const form = document.getElementById('question-create-form');
    if (!modal || !form) return;

    form.reset();
    modal.classList.add('active');
  },

  handleSaveQuestion() {
    const enunciado = document.getElementById('new-q-enunciado').value.trim();
    const tema = document.getElementById('new-q-tema').value;
    const dificuldade = document.getElementById('new-q-dificuldade').value;
    const alt0 = document.getElementById('new-q-alt-0').value.trim();
    const alt1 = document.getElementById('new-q-alt-1').value.trim();
    const alt2 = document.getElementById('new-q-alt-2').value.trim();
    const alt3 = document.getElementById('new-q-alt-3').value.trim();
    const correctRadio = document.querySelector('input[name="new-q-correct"]:checked');
    const explicacao = document.getElementById('new-q-explicacao').value.trim();

    if (!enunciado || !alt0 || !alt1 || !correctRadio) {
      window.showToast?.('Preencha os campos obrigatórios da questão.', 'warning');
      return;
    }

    const newQ = {
      enunciado,
      tema,
      dificuldade,
      alternativas: [alt0, alt1, alt2, alt3].filter(a => a.length > 0),
      respostaCorreta: parseInt(correctRadio.value, 10),
      explicacao: explicacao || 'Gabarito oficial cadastrado pelo docente.'
    };

    StorageService.saveQuestion(newQ);
    window.showToast?.('Questão adicionada ao banco com sucesso!', 'success');

    const modal = document.getElementById('modal-new-question');
    if (modal) modal.classList.remove('active');

    this.renderQuestionsList();
  },

  confirmDeleteQuestion(id) {
    if (confirm('Deseja excluir esta questão do banco de dados?')) {
      StorageService.deleteQuestion(id);
      window.showToast?.('Questão removida.', 'info');
      this.renderQuestionsList();
    }
  }
};
