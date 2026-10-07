/**
 * BioConecta - Módulo de Atividades Avaliativas de Biologia
 * Gerencia a listagem, resolução pelo aluno com pontuação automática e gestão pelo professor.
 */

import { StorageService } from './storage.js';
import { AuthService } from './auth.js';

export const ActivityModule = {
  currentActivityBeingSolved: null,
  activeFilter: 'todas', // 'todas', 'pendentes', 'concluidas'

  init() {
    this.bindEvents();
    this.renderActivitiesList();
  },

  bindEvents() {
    const btnNew = document.getElementById('btn-new-activity');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        this.openActivityCreateModal();
      });
    }

    // Filtros de status de atividades (Todas / Pendentes / Concluídas)
    const filterBtns = document.querySelectorAll('.activity-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeFilter = btn.dataset.filter;
        this.renderActivitiesList();
      });
    });

    // Form de nova atividade (Professor)
    const formCreate = document.getElementById('activity-editor-form');
    if (formCreate) {
      formCreate.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveActivity();
      });
    }

    // Botão para adicionar mais uma questão no formulário de criação
    const btnAddQuestion = document.getElementById('btn-add-form-question');
    if (btnAddQuestion) {
      btnAddQuestion.addEventListener('click', () => {
        this.appendQuestionFieldToForm();
      });
    }

    // Submissão do questionário pelo aluno
    const formSolve = document.getElementById('activity-solve-form');
    if (formSolve) {
      formSolve.addEventListener('submit', (e) => {
        e.preventDefault();
        this.submitStudentAnswers();
      });
    }
  },

  renderActivitiesList() {
    const container = document.getElementById('activities-grid');
    if (!container) return;

    const all = StorageService.getActivities();
    const currentUser = AuthService.getCurrentUser();
    const isProfessor = AuthService.isProfessor();
    const studentSubmissions = currentUser && !isProfessor 
      ? StorageService.getSubmissionsByStudent(currentUser.id) 
      : [];

    let filtered = all;

    if (!isProfessor && this.activeFilter !== 'todas') {
      filtered = all.filter(item => {
        const hasSubmitted = studentSubmissions.some(s => s.atividadeId === item.id);
        if (this.activeFilter === 'concluidas') return hasSubmitted;
        if (this.activeFilter === 'pendentes') return !hasSubmitted;
        return true;
      });
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📋</div>
          <h3 class="empty-state-title">Nenhuma atividade encontrada</h3>
          <p>Não há atividades disponíveis para os filtros selecionados.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => {
      const submissions = StorageService.getSubmissionsByActivity(item.id);
      const studentSub = studentSubmissions.find(s => s.atividadeId === item.id);
      const isCompleted = !!studentSub;

      return `
        <div class="card activity-card" data-id="${item.id}">
          <div class="card-header">
            <span class="badge ${this.getThemeBadgeClass(item.tema)}">${item.tema}</span>
            ${!isProfessor ? `
              <span class="badge ${isCompleted ? 'badge-status-concluida' : 'badge-status-pendente'}">
                ${isCompleted ? '✓ Concluída' : '⏳ Pendente'}
              </span>
            ` : `
              <span class="badge" style="background: #e2e8f0; color: #475569;">
                ${submissions.length} entregas
              </span>
            `}
          </div>

          <div class="card-body">
            <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-main);">
              ${item.titulo}
            </h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5;">
              ${item.descricao}
            </p>

            <div style="font-size: 0.82rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.35rem; background: var(--surface-alt); padding: 0.75rem; border-radius: var(--radius-sm);">
              <div><strong>📅 Prazo limite:</strong> ${this.formatDate(item.prazoEntrega)}</div>
              <div><strong>⭐ Pontuação máxima:</strong> ${Number(item.pontuacao).toFixed(1)} pontos</div>
              <div><strong>❓ Quantidade de questões:</strong> ${item.questoes ? item.questoes.length : 0}</div>
              ${isCompleted ? `
                <div style="color: var(--success); font-weight: 700; margin-top: 0.25rem;">
                  🎉 Sua nota: ${Number(studentSub.nota).toFixed(1)} / ${Number(studentSub.pontuacaoMaxima).toFixed(1)} (${studentSub.acertos}/${studentSub.totalQuestoes} acertos)
                </div>
              ` : ''}
            </div>
          </div>

          <div class="card-footer">
            ${isProfessor ? `
              <div style="display: flex; gap: 0.5rem; width: 100%; justify-content: space-between;">
                <button type="button" class="btn btn-primary btn-sm btn-view-submissions" data-id="${item.id}">
                  👥 Ver Submissões (${submissions.length})
                </button>
                <div style="display: flex; gap: 0.35rem;">
                  <button type="button" class="btn btn-outline btn-sm btn-delete-activity" data-id="${item.id}" title="Excluir Atividade" style="color: var(--danger);">
                    🗑️
                  </button>
                </div>
              </div>
            ` : `
              <button type="button" class="btn ${isCompleted ? 'btn-outline' : 'btn-primary'} btn-sm btn-solve-activity" data-id="${item.id}">
                ${isCompleted ? '👁️ Revisar Minhas Respostas' : '✍️ Resolver Atividade Agora'}
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Event listeners dos cards
    container.querySelectorAll('.btn-solve-activity').forEach(btn => {
      btn.addEventListener('click', () => this.openActivitySolveModal(btn.dataset.id));
    });

    if (isProfessor) {
      container.querySelectorAll('.btn-view-submissions').forEach(btn => {
        btn.addEventListener('click', () => this.openSubmissionsModal(btn.dataset.id));
      });
      container.querySelectorAll('.btn-delete-activity').forEach(btn => {
        btn.addEventListener('click', () => this.confirmDeleteActivity(btn.dataset.id));
      });
    }
  },

  getThemeBadgeClass(tema) {
    const slug = (tema || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
    return `badge-${slug}`;
  },

  formatDate(dateStr) {
    if (!dateStr) return 'Não informado';
    try {
      const [ano, mes, dia] = dateStr.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dateStr;
    }
  },

  // =========================================================================
  // RESOLUÇÃO DA ATIVIDADE PELO ALUNO
  // =========================================================================
  openActivitySolveModal(id) {
    const activity = StorageService.getActivityById(id);
    if (!activity) return;

    this.currentActivityBeingSolved = activity;
    const modal = document.getElementById('modal-solve-activity');
    const titleEl = document.getElementById('solve-activity-title');
    const descEl = document.getElementById('solve-activity-desc');
    const questionsContainer = document.getElementById('solve-questions-container');
    const resultBox = document.getElementById('solve-result-box');
    const submitBtn = document.getElementById('btn-submit-answers');

    if (resultBox) resultBox.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'inline-flex';

    if (titleEl) titleEl.textContent = activity.titulo;
    if (descEl) descEl.textContent = `${activity.tema} • Prazo: ${this.formatDate(activity.prazoEntrega)} • Vale ${activity.pontuacao} pontos`;

    const currentUser = AuthService.getCurrentUser();
    const existingSubmission = currentUser 
      ? StorageService.getSubmissionsByStudent(currentUser.id).find(s => s.atividadeId === id)
      : null;

    if (questionsContainer) {
      questionsContainer.innerHTML = activity.questoes.map((q, qIndex) => {
        const studentAnswer = existingSubmission ? existingSubmission.respostas[qIndex] : null;

        return `
          <div class="question-item-box" data-qindex="${qIndex}">
            <div class="question-title-row">
              <span class="question-num-tag">Questão ${qIndex + 1} de ${activity.questoes.length}</span>
            </div>
            <p style="font-weight: 600; color: var(--text-main); margin-bottom: 1rem; line-height: 1.45;">
              ${q.enunciado}
            </p>

            <div class="options-list">
              ${q.alternativas.map((alt, altIndex) => {
                const isSelected = studentAnswer === altIndex;
                let feedbackClass = '';
                if (existingSubmission) {
                  if (altIndex === q.respostaCorreta) feedbackClass = 'correct';
                  else if (isSelected && altIndex !== q.respostaCorreta) feedbackClass = 'incorrect';
                }

                return `
                  <label class="option-choice-label ${isSelected ? 'selected' : ''} ${feedbackClass}">
                    <input type="radio" name="question_${qIndex}" value="${altIndex}" 
                      ${isSelected ? 'checked' : ''} 
                      ${existingSubmission ? 'disabled' : 'required'}>
                    <span style="font-size: 0.92rem;">${alt}</span>
                  </label>
                `;
              }).join('')}
            </div>

            ${existingSubmission ? `
              <div class="question-feedback-box">
                <strong>💡 Explicação pedagógica:</strong> ${q.explicacao || 'Resposta correta: alternativa ' + (q.respostaCorreta + 1)}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    if (existingSubmission) {
      if (submitBtn) submitBtn.style.display = 'none';
      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
          <div style="background: #ecfdf5; border: 1px solid #10b981; border-radius: var(--radius-md); padding: 1rem; text-align: center;">
            <h4 style="color: #065f46; font-size: 1.1rem; margin-bottom: 0.35rem;">Você já concluiu esta atividade!</h4>
            <p style="color: #047857; font-size: 0.95rem;">
              Nota obtida: <strong>${existingSubmission.nota.toFixed(1)} / ${existingSubmission.pontuacaoMaxima.toFixed(1)}</strong> 
              (${existingSubmission.acertos}/${existingSubmission.totalQuestoes} acertos).
            </p>
          </div>
        `;
      }
    }

    if (modal) modal.classList.add('active');
  },

  submitStudentAnswers() {
    if (!this.currentActivityBeingSolved) return;

    const activity = this.currentActivityBeingSolved;
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser) {
      window.showToast?.('Faça login como Aluno para registrar respostas.', 'warning');
      return;
    }

    const answers = [];
    let correctCount = 0;

    for (let i = 0; i < activity.questoes.length; i++) {
      const selected = document.querySelector(`input[name="question_${i}"]:checked`);
      if (!selected) {
        window.showToast?.(`Por favor, responda à questão ${i + 1}.`, 'warning');
        return;
      }
      const choice = parseInt(selected.value, 10);
      answers.push(choice);
      if (choice === activity.questoes[i].respostaCorreta) {
        correctCount++;
      }
    }

    const calculatedGrade = (correctCount / activity.questoes.length) * (activity.pontuacao || 10);

    const submission = {
      atividadeId: activity.id,
      atividadeTitulo: activity.titulo,
      alunoId: currentUser.id,
      alunoNome: currentUser.nome,
      alunoEmail: currentUser.email,
      nota: calculatedGrade,
      pontuacaoMaxima: activity.pontuacao || 10,
      acertos: correctCount,
      totalQuestoes: activity.questoes.length,
      respostas: answers
    };

    StorageService.saveSubmission(submission);
    window.showToast?.(`Atividade enviada! Você tirou ${calculatedGrade.toFixed(1)} pontos (${correctCount}/${activity.questoes.length} acertos).`, 'success');

    // Reabre modal com o gabarito visível
    this.openActivitySolveModal(activity.id);
    this.renderActivitiesList();
    window.updateDashboards?.();
  },

  // =========================================================================
  // GESTÃO DE ATIVIDADES PELO PROFESSOR
  // =========================================================================
  openActivityCreateModal() {
    const modal = document.getElementById('modal-create-activity');
    const form = document.getElementById('activity-editor-form');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('form-questions-wrapper').innerHTML = '';
    // Adiciona 1 questão inicial por padrão
    this.appendQuestionFieldToForm();

    modal.classList.add('active');
  },

  appendQuestionFieldToForm() {
    const wrapper = document.getElementById('form-questions-wrapper');
    if (!wrapper) return;

    const currentCount = wrapper.children.length;
    const qIndex = currentCount;

    const qDiv = document.createElement('div');
    qDiv.className = 'card';
    qDiv.style.padding = '1rem';
    qDiv.style.marginBottom = '1rem';
    qDiv.style.backgroundColor = 'var(--surface-alt)';
    qDiv.dataset.questionIndex = qIndex;

    qDiv.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
        <strong style="color: var(--primary-700);">Questão ${qIndex + 1}</strong>
        ${qIndex > 0 ? `<button type="button" class="btn btn-outline btn-sm btn-remove-q" style="color: var(--danger); font-size: 0.75rem;">Remover</button>` : ''}
      </div>

      <div class="form-group">
        <label class="form-label">Enunciado da Questão <span class="required">*</span></label>
        <textarea class="form-textarea q-enunciado" required rows="2" placeholder="Digite o enunciado biológico..."></textarea>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.75rem;">
        <label class="form-label">Alternativas e Gabarito <span class="required">* (Marque o rádio da correta)</span></label>
        ${[0, 1, 2, 3].map(optIdx => `
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <input type="radio" name="new_correct_${qIndex}" value="${optIdx}" ${optIdx === 0 ? 'checked' : ''} title="Marcar como correta">
            <input type="text" class="form-control q-alt-${optIdx}" required placeholder="Alternativa ${String.fromCharCode(65 + optIdx)}">
          </div>
        `).join('')}
      </div>

      <div class="form-group">
        <label class="form-label">Explicação da Resposta (Feedback pedagógico)</label>
        <input type="text" class="form-control q-explicacao" placeholder="Ex: De acordo com a teoria celular...">
      </div>
    `;

    const removeBtn = qDiv.querySelector('.btn-remove-q');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => qDiv.remove());
    }

    wrapper.appendChild(qDiv);
  },

  handleSaveActivity() {
    const titulo = document.getElementById('act-form-title').value.trim();
    const tema = document.getElementById('act-form-theme').value;
    const descricao = document.getElementById('act-form-desc').value.trim();
    const prazo = document.getElementById('act-form-deadline').value;
    const pontuacao = parseFloat(document.getElementById('act-form-points').value) || 10;

    const wrapper = document.getElementById('form-questions-wrapper');
    const questionCards = wrapper.querySelectorAll('.card');

    if (questionCards.length === 0) {
      window.showToast?.('Adicione pelo menos 1 questão à atividade.', 'warning');
      return;
    }

    const questoes = [];
    for (let i = 0; i < questionCards.length; i++) {
      const card = questionCards[i];
      const enunciado = card.querySelector('.q-enunciado').value.trim();
      const alt0 = card.querySelector('.q-alt-0').value.trim();
      const alt1 = card.querySelector('.q-alt-1').value.trim();
      const alt2 = card.querySelector('.q-alt-2').value.trim();
      const alt3 = card.querySelector('.q-alt-3').value.trim();
      const explicacao = card.querySelector('.q-explicacao').value.trim();
      const correctRadio = card.querySelector(`input[name^="new_correct_"]:checked`);
      const respostaCorreta = correctRadio ? parseInt(correctRadio.value, 10) : 0;

      if (!enunciado || !alt0 || !alt1) {
        window.showToast?.(`Preencha o enunciado e pelo menos as primeiras alternativas da questão ${i + 1}.`, 'warning');
        return;
      }

      questoes.push({
        id: 'q-' + Date.now() + '-' + i,
        enunciado,
        alternativas: [alt0, alt1, alt2, alt3].filter(a => a.length > 0),
        respostaCorreta,
        explicacao: explicacao || 'Resposta conferida pelo professor.'
      });
    }

    const newActivity = {
      titulo,
      tema,
      descricao,
      prazoEntrega: prazo,
      pontuacao,
      questoes
    };

    StorageService.saveActivity(newActivity);
    window.showToast?.('Atividade cadastrada com sucesso!', 'success');

    const modal = document.getElementById('modal-create-activity');
    if (modal) modal.classList.remove('active');

    this.renderActivitiesList();
    window.updateDashboards?.();
  },

  confirmDeleteActivity(id) {
    const act = StorageService.getActivityById(id);
    if (!act) return;

    if (confirm(`Deseja excluir a atividade "${act.titulo}"? Todas as submissões serão desvinculadas.`)) {
      StorageService.deleteActivity(id);
      window.showToast?.('Atividade excluída com sucesso.', 'info');
      this.renderActivitiesList();
      window.updateDashboards?.();
    }
  },

  openSubmissionsModal(activityId) {
    const activity = StorageService.getActivityById(activityId);
    if (!activity) return;

    const modal = document.getElementById('modal-submissions');
    const listEl = document.getElementById('submissions-list-table');
    const titleEl = document.getElementById('modal-submissions-title');

    if (titleEl) titleEl.textContent = `Submissões: ${activity.titulo}`;

    const submissions = StorageService.getSubmissionsByActivity(activityId);

    if (listEl) {
      if (submissions.length === 0) {
        listEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <p>Nenhum aluno submeteu respostas para esta atividade ainda.</p>
          </div>
        `;
      } else {
        listEl.innerHTML = `
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
              <thead>
                <tr style="border-bottom: 2px solid var(--surface-border); color: var(--text-muted);">
                  <th style="padding: 0.75rem;">Aluno</th>
                  <th style="padding: 0.75rem;">E-mail</th>
                  <th style="padding: 0.75rem;">Data</th>
                  <th style="padding: 0.75rem;">Acertos</th>
                  <th style="padding: 0.75rem;">Nota</th>
                </tr>
              </thead>
              <tbody>
                ${submissions.map(s => `
                  <tr style="border-bottom: 1px solid var(--surface-border);">
                    <td style="padding: 0.75rem; font-weight: 600;">${s.alunoNome}</td>
                    <td style="padding: 0.75rem; color: var(--text-muted);">${s.alunoEmail}</td>
                    <td style="padding: 0.75rem;">${new Date(s.dataSubmissao).toLocaleDateString('pt-BR')}</td>
                    <td style="padding: 0.75rem;">${s.acertos} / ${s.totalQuestoes}</td>
                    <td style="padding: 0.75rem; font-weight: 700; color: ${s.nota >= 6 ? 'var(--success)' : 'var(--danger)'};">
                      ${s.nota.toFixed(1)} / ${s.pontuacaoMaxima.toFixed(1)}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;
      }
    }

    if (modal) modal.classList.add('active');
  }
};
