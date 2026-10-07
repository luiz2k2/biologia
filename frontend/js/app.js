/**
 * BioConecta - Controlador Principal da Aplicação (App Controller)
 * Gerencia o roteamento de telas (SPA), dashboards, autenticação e modais globais.
 */

import { StorageService } from './storage.js';
import { AuthService } from './auth.js';
import { ContentModule } from './content.js';
import { ActivityModule } from './activity.js';
import { QuestionModule } from './question.js';

// ============================================================================
// SISTEMA DE NOTIFICAÇÕES (TOAST)
// ============================================================================
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <span style="font-size: 1.2rem;">${icons[type] || 'ℹ️'}</span>
    <span style="font-size: 0.9rem; font-weight: 500; color: var(--text-main);">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
};

// ============================================================================
// OBJETO PRINCIPAL DA APLICAÇÃO
// ============================================================================
const App = {
  currentView: 'home',

  init() {
    StorageService.init();
    this.setupGlobalEvents();
    this.updateUserSessionUI();

    ContentModule.init();
    ActivityModule.init();
    QuestionModule.init();

    this.handleRouting();
    window.addEventListener('hashchange', () => this.handleRouting());

    // Atualização global exposta
    window.updateDashboards = () => this.updateDashboards();
    this.updateDashboards();
  },

  setupGlobalEvents() {
    // Menu mobile toggle
    const hamburgerBtn = document.getElementById('hamburger-toggle');
    const navMenu = document.getElementById('main-nav-menu');
    if (hamburgerBtn && navMenu) {
      hamburgerBtn.addEventListener('click', () => {
        navMenu.classList.toggle('open');
      });
      // Fecha ao clicar em um link
      navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => navMenu.classList.remove('open'));
      });
    }

    // Botão de Sair / Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        AuthService.logout();
        window.showToast('Você saiu da sua conta.', 'info');
        this.updateUserSessionUI();
        window.location.hash = '#login';
      });
    }

    // Formulário de Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-password').value;
        const role = document.querySelector('input[name="login-role"]:checked')?.value || 'aluno';

        AuthService.login(email, senha, role);
        window.showToast(`Bem-vindo(a), ${AuthService.getCurrentUser().nome}!`, 'success');
        this.updateUserSessionUI();
        this.updateDashboards();
        ContentModule.renderContentsList();
        ActivityModule.renderActivitiesList();
        QuestionModule.renderQuestionsList();
        window.location.hash = '#dashboard';
      });
    }

    // Botões de Demonstração Rápida no Login (1 clique)
    const btnDemoProf = document.getElementById('btn-demo-professor');
    if (btnDemoProf) {
      btnDemoProf.addEventListener('click', () => {
        AuthService.switchProfile('professor');
        window.showToast('Conectado como Professora Helena Meireles!', 'success');
        this.updateUserSessionUI();
        this.updateDashboards();
        ContentModule.renderContentsList();
        ActivityModule.renderActivitiesList();
        QuestionModule.renderQuestionsList();
        window.location.hash = '#dashboard';
      });
    }

    const btnDemoAluno = document.getElementById('btn-demo-aluno');
    if (btnDemoAluno) {
      btnDemoAluno.addEventListener('click', () => {
        AuthService.switchProfile('aluno');
        window.showToast('Conectado como Aluno Lucas Silva!', 'success');
        this.updateUserSessionUI();
        this.updateDashboards();
        ContentModule.renderContentsList();
        ActivityModule.renderActivitiesList();
        QuestionModule.renderQuestionsList();
        window.location.hash = '#dashboard';
      });
    }

    // Botão para Resetar dados de demonstração
    const btnResetData = document.getElementById('btn-reset-data');
    if (btnResetData) {
      btnResetData.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Deseja restaurar todos os dados iniciais de demonstração (conteúdos, questões e atividades padrão)?')) {
          StorageService.resetToDefaults();
          window.showToast('Dados restaurados para o padrão de demonstração!', 'success');
          ContentModule.renderContentsList();
          ActivityModule.renderActivitiesList();
          QuestionModule.renderQuestionsList();
          this.updateDashboards();
        }
      });
    }

    // Modais: Fechar ao clicar no backdrop ou botão X
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('.modal-close-btn') || e.target.classList.contains('btn-modal-cancel')) {
          modal.classList.remove('active');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
      }
    });
  },

  updateUserSessionUI() {
    const user = AuthService.getCurrentUser();
    const isProf = AuthService.isProfessor();

    const avatarEl = document.getElementById('user-avatar-circle');
    const nameEl = document.getElementById('user-display-name');
    const roleEl = document.getElementById('user-role-text');
    const userBadgeBox = document.getElementById('user-badge-box');
    const btnLoginNav = document.getElementById('nav-link-login');
    const btnLogout = document.getElementById('btn-logout');

    // Botões restritos ao professor
    const profOnlyButtons = document.querySelectorAll('.prof-only');
    profOnlyButtons.forEach(el => {
      el.style.display = isProf ? 'inline-flex' : 'none';
    });

    if (user) {
      if (userBadgeBox) userBadgeBox.style.display = 'flex';
      if (avatarEl) avatarEl.textContent = user.avatar || user.nome.charAt(0);
      if (nameEl) nameEl.textContent = user.nome;
      if (roleEl) {
        roleEl.textContent = isProf ? 'Professor' : 'Aluno';
        roleEl.className = `user-role-label ${isProf ? 'role-professor' : 'role-aluno'}`;
      }
      if (btnLoginNav) btnLoginNav.style.display = 'none';
      if (btnLogout) btnLogout.style.display = 'inline-flex';
    } else {
      if (userBadgeBox) userBadgeBox.style.display = 'none';
      if (btnLoginNav) btnLoginNav.style.display = 'inline-flex';
      if (btnLogout) btnLogout.style.display = 'none';
    }
  },

  handleRouting() {
    const hash = window.location.hash || '#inicio';
    const isProf = AuthService.isProfessor();

    // Remove active de todas as views
    document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));

    // Roteamento de acordo com o hash
    if (hash === '#inicio') {
      this.activateView('view-home', 'nav-link-home');
    } else if (hash === '#login') {
      this.activateView('view-login', 'nav-link-login');
    } else if (hash === '#conteudos') {
      this.activateView('view-contents', 'nav-link-contents');
      ContentModule.renderContentsList();
    } else if (hash === '#atividades') {
      this.activateView('view-activities', 'nav-link-activities');
      ActivityModule.renderActivitiesList();
    } else if (hash === '#questoes') {
      this.activateView('view-questions', 'nav-link-questions');
      QuestionModule.renderQuestionsList();
    } else if (hash === '#dashboard') {
      // Redireciona para o painel específico
      if (isProf) {
        this.activateView('view-professor-dashboard', 'nav-link-dashboard');
      } else {
        this.activateView('view-student-dashboard', 'nav-link-dashboard');
      }
      this.updateDashboards();
    } else {
      this.activateView('view-home', 'nav-link-home');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  activateView(viewId, navLinkId) {
    const section = document.getElementById(viewId);
    if (section) section.classList.add('active');

    const navLink = document.getElementById(navLinkId);
    if (navLink) navLink.classList.add('active');
  },

  // =========================================================================
  // ATUALIZAÇÃO DOS DASHBOARDS (PROFESSOR & ALUNO)
  // =========================================================================
  updateDashboards() {
    const contents = StorageService.getContents();
    const activities = StorageService.getActivities();
    const questions = StorageService.getQuestions();
    const submissions = StorageService.getSubmissions();
    const students = StorageService.getStudents();
    const currentUser = AuthService.getCurrentUser();

    // 1. Dashboard do Professor
    const elProfTotContents = document.getElementById('prof-kpi-contents');
    const elProfTotActivities = document.getElementById('prof-kpi-activities');
    const elProfTotStudents = document.getElementById('prof-kpi-students');
    const elProfTotSubmissions = document.getElementById('prof-kpi-submissions');

    if (elProfTotContents) elProfTotContents.textContent = contents.length;
    if (elProfTotActivities) elProfTotActivities.textContent = activities.length;
    if (elProfTotStudents) elProfTotStudents.textContent = students.length;
    if (elProfTotSubmissions) elProfTotSubmissions.textContent = submissions.length;

    // Lista de conteúdos recentes do professor
    const profRecentContentsList = document.getElementById('prof-recent-contents-list');
    if (profRecentContentsList) {
      profRecentContentsList.innerHTML = contents.slice(0, 4).map(c => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--surface-border);">
          <div>
            <div style="font-weight: 600; color: var(--text-main);">${c.titulo}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${c.tema} • ${c.dataPublicacao}</div>
          </div>
          <button type="button" class="btn btn-outline btn-sm" onclick="window.location.hash='#conteudos'">Ver</button>
        </div>
      `).join('');
    }

    // Lista de atividades cadastradas do professor
    const profRecentActivitiesList = document.getElementById('prof-recent-activities-list');
    if (profRecentActivitiesList) {
      profRecentActivitiesList.innerHTML = activities.slice(0, 4).map(a => {
        const subsCount = StorageService.getSubmissionsByActivity(a.id).length;
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--surface-border);">
            <div>
              <div style="font-weight: 600; color: var(--text-main);">${a.titulo}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${a.tema} • Prazo: ${a.prazoEntrega} • ${subsCount} entregas</div>
            </div>
            <button type="button" class="btn btn-outline btn-sm" onclick="window.location.hash='#atividades'">Gerenciar</button>
          </div>
        `;
      }).join('');
    }

    // 2. Dashboard do Aluno
    if (currentUser) {
      const studentSubmissions = StorageService.getSubmissionsByStudent(currentUser.id);
      const totalActivities = activities.length;
      const completedCount = studentSubmissions.length;
      const pendingCount = Math.max(0, totalActivities - completedCount);

      // Média de nota do aluno
      let avgScore = 0;
      if (completedCount > 0) {
        const sumGrades = studentSubmissions.reduce((acc, curr) => acc + (curr.nota || 0), 0);
        avgScore = (sumGrades / completedCount);
      }

      const elStudentPending = document.getElementById('student-kpi-pending');
      const elStudentCompleted = document.getElementById('student-kpi-completed');
      const elStudentAverage = document.getElementById('student-kpi-average');
      const elStudentContents = document.getElementById('student-kpi-contents');

      if (elStudentPending) elStudentPending.textContent = pendingCount;
      if (elStudentCompleted) elStudentCompleted.textContent = completedCount;
      if (elStudentAverage) elStudentAverage.textContent = avgScore.toFixed(1);
      if (elStudentContents) elStudentContents.textContent = contents.length;

      // Lista de atividades pendentes do aluno
      const studentPendingList = document.getElementById('student-pending-activities-list');
      if (studentPendingList) {
        const pendingActs = activities.filter(a => !studentSubmissions.some(s => s.atividadeId === a.id));
        if (pendingActs.length === 0) {
          studentPendingList.innerHTML = `
            <div style="text-align: center; padding: 1.5rem; color: var(--text-muted);">
              🎉 Parabéns! Você não possui atividades pendentes no momento.
            </div>
          `;
        } else {
          studentPendingList.innerHTML = pendingActs.map(a => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem; border-radius: var(--radius-md); background: var(--surface-alt); margin-bottom: 0.5rem;">
              <div>
                <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">${a.titulo}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">Tema: ${a.tema} • Prazo: ${a.prazoEntrega} • Vale ${a.pontuacao} pts</div>
              </div>
              <button type="button" class="btn btn-primary btn-sm" onclick="window.location.hash='#atividades'">Resolver</button>
            </div>
          `).join('');
        }
      }

      // Conteúdos recomendados para o aluno
      const studentRecContentsList = document.getElementById('student-recent-contents-list');
      if (studentRecContentsList) {
        studentRecContentsList.innerHTML = contents.slice(0, 3).map(c => `
          <div class="card" style="margin-bottom: 0.75rem; padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
              <span class="badge ${ContentModule.getThemeBadgeClass(c.tema)}">${c.tema}</span>
              <span style="font-size: 0.78rem; color: var(--text-muted);">${c.dataPublicacao}</span>
            </div>
            <h4 style="font-size: 0.98rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.35rem;">${c.titulo}</h4>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 0.75rem;">${c.descricao}</p>
            <button type="button" class="btn btn-outline btn-sm" onclick="window.location.hash='#conteudos'">Estudar Conteúdo</button>
          </div>
        `).join('');
      }
    }
  }
};

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
