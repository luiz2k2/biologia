/**
 * BioConecta - Módulo de Conteúdos Didáticos de Biologia
 * Gerencia a renderização, filtros, pesquisa, leitura e operações de CRUD
 */

import { StorageService } from './storage.js';
import { AuthService } from './auth.js';

export const ContentModule = {
  activeThemeFilter: 'Todos',
  searchTerm: '',

  TEMAS: [
    'Todos',
    'Citologia',
    'Genética',
    'Ecologia',
    'Evolução',
    'Fisiologia Humana',
    'Botânica',
    'Zoologia',
    'Microbiologia',
    'Biotecnologia'
  ],

  init() {
    this.renderThemePills();
    this.bindEvents();
    this.renderContentsList();
  },

  bindEvents() {
    const searchInput = document.getElementById('content-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.renderContentsList();
      });
    }

    const newBtn = document.getElementById('btn-new-content');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        this.openContentFormModal();
      });
    }

    const form = document.getElementById('content-editor-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }
  },

  renderThemePills() {
    const container = document.getElementById('content-theme-pills');
    if (!container) return;

    container.innerHTML = this.TEMAS.map(tema => `
      <button type="button" class="theme-chip-btn ${this.activeThemeFilter === tema ? 'active' : ''}" data-tema="${tema}">
        ${tema}
      </button>
    `).join('');

    container.querySelectorAll('.theme-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.theme-chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeThemeFilter = btn.dataset.tema;
        this.renderContentsList();
      });
    });
  },

  getThemeBadgeClass(tema) {
    const slug = tema.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');
    return `badge-${slug}`;
  },

  renderContentsList() {
    const grid = document.getElementById('contents-grid');
    if (!grid) return;

    const allContents = StorageService.getContents();
    const isProfessor = AuthService.isProfessor();

    // Filtros por tema e busca
    const filtered = allContents.filter(item => {
      const matchTheme = (this.activeThemeFilter === 'Todos' || item.tema === this.activeThemeFilter);
      const matchSearch = !this.searchTerm || 
        item.titulo.toLowerCase().includes(this.searchTerm) ||
        item.descricao.toLowerCase().includes(this.searchTerm) ||
        item.tema.toLowerCase().includes(this.searchTerm) ||
        item.texto.toLowerCase().includes(this.searchTerm);
      return matchTheme && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🔬</div>
          <h3 class="empty-state-title">Nenhum conteúdo encontrado</h3>
          <p>Tente ajustar o termo pesquisado ou selecionar outro tema biológico.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const badgeClass = this.getThemeBadgeClass(item.tema);
      return `
        <article class="card content-card" data-id="${item.id}">
          <div class="content-thumb">
            ${item.imagem ? `
              <img src="${item.imagem}" alt="${item.titulo}" loading="lazy" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'content-thumb-placeholder\\'><span>🌿 Biologia</span></div>';">
            ` : `
              <div class="content-thumb-placeholder">
                <span style="font-size: 2rem;">🌿</span>
                <span>${item.tema}</span>
              </div>
            `}
            <span class="badge ${badgeClass} content-badge-float">${item.tema}</span>
          </div>

          <div class="card-body">
            <div class="content-date">Publicado em: ${this.formatDate(item.dataPublicacao)}</div>
            <h3 class="content-title">${item.titulo}</h3>
            <p class="content-desc">${item.descricao}</p>
          </div>

          <div class="card-footer">
            <button type="button" class="btn btn-outline btn-sm btn-read-content" data-id="${item.id}">
              Ler Conteúdo Completo
            </button>

            ${isProfessor ? `
              <div style="display: flex; gap: 0.35rem;">
                <button type="button" class="btn btn-outline btn-sm btn-edit-content" data-id="${item.id}" title="Editar Conteúdo">
                  ✏️
                </button>
                <button type="button" class="btn btn-outline btn-sm btn-delete-content" data-id="${item.id}" title="Excluir Conteúdo" style="color: var(--danger);">
                  🗑️
                </button>
              </div>
            ` : ''}
          </div>
        </article>
      `;
    }).join('');

    // Adiciona ouvintes nos botões gerados
    grid.querySelectorAll('.btn-read-content').forEach(btn => {
      btn.addEventListener('click', () => this.openContentReadModal(btn.dataset.id));
    });

    if (isProfessor) {
      grid.querySelectorAll('.btn-edit-content').forEach(btn => {
        btn.addEventListener('click', () => this.openContentFormModal(btn.dataset.id));
      });

      grid.querySelectorAll('.btn-delete-content').forEach(btn => {
        btn.addEventListener('click', () => this.confirmDeleteContent(btn.dataset.id));
      });
    }
  },

  formatDate(dateStr) {
    if (!dateStr) return 'Recente';
    try {
      const [ano, mes, dia] = dateStr.split('-');
      return `${dia}/${mes}/${ano}`;
    } catch {
      return dateStr;
    }
  },

  openContentReadModal(id) {
    const item = StorageService.getContentById(id);
    if (!item) return;

    const modal = document.getElementById('modal-read-content');
    if (!modal) return;

    const titleEl = document.getElementById('modal-read-title');
    const badgeEl = document.getElementById('modal-read-theme');
    const dateEl = document.getElementById('modal-read-date');
    const textEl = document.getElementById('modal-read-body');
    const linkEl = document.getElementById('modal-read-link');
    const imgEl = document.getElementById('modal-read-image');

    if (titleEl) titleEl.textContent = item.titulo;
    if (badgeEl) {
      badgeEl.textContent = item.tema;
      badgeEl.className = `badge ${this.getThemeBadgeClass(item.tema)}`;
    }
    if (dateEl) dateEl.textContent = `Publicado em ${this.formatDate(item.dataPublicacao)}`;
    if (textEl) {
      // Formatação simples de quebras e listas
      const formatted = item.texto
        .replace(/\n\n/g, '</p><p style="margin-bottom: 0.85rem;">')
        .replace(/\n/g, '<br>');
      textEl.innerHTML = `<p style="margin-bottom: 0.85rem;">${formatted}</p>`;
    }

    if (imgEl) {
      if (item.imagem) {
        imgEl.src = item.imagem;
        imgEl.style.display = 'block';
      } else {
        imgEl.style.display = 'none';
      }
    }

    if (linkEl) {
      if (item.linkComplementar) {
        linkEl.href = item.linkComplementar;
        linkEl.style.display = 'inline-flex';
        linkEl.textContent = '🔗 Acessar Material Complementar / Fonte';
      } else {
        linkEl.style.display = 'none';
      }
    }

    modal.classList.add('active');
  },

  openContentFormModal(id = null) {
    const modal = document.getElementById('modal-content-form');
    const form = document.getElementById('content-editor-form');
    const titleModal = document.getElementById('modal-content-form-title');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('content-form-id').value = '';

    if (id) {
      const item = StorageService.getContentById(id);
      if (item) {
        if (titleModal) titleModal.textContent = 'Editar Conteúdo Didático';
        document.getElementById('content-form-id').value = item.id;
        document.getElementById('content-form-title').value = item.titulo;
        document.getElementById('content-form-theme').value = item.tema;
        document.getElementById('content-form-desc').value = item.descricao;
        document.getElementById('content-form-text').value = item.texto;
        document.getElementById('content-form-image').value = item.imagem || '';
        document.getElementById('content-form-link').value = item.linkComplementar || '';
      }
    } else {
      if (titleModal) titleModal.textContent = 'Cadastrar Novo Conteúdo Didático';
    }

    modal.classList.add('active');
  },

  handleFormSubmit() {
    const id = document.getElementById('content-form-id').value;
    const titulo = document.getElementById('content-form-title').value.trim();
    const tema = document.getElementById('content-form-theme').value;
    const descricao = document.getElementById('content-form-desc').value.trim();
    const texto = document.getElementById('content-form-text').value.trim();
    const imagem = document.getElementById('content-form-image').value.trim();
    const linkComplementar = document.getElementById('content-form-link').value.trim();

    if (!titulo || !tema || !descricao || !texto) {
      window.showToast?.('Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    const payload = {
      titulo,
      tema,
      descricao,
      texto,
      imagem,
      linkComplementar
    };

    if (id) payload.id = id;

    StorageService.saveContent(payload);
    window.showToast?.(id ? 'Conteúdo atualizado com sucesso!' : 'Novo conteúdo cadastrado com sucesso!', 'success');

    const modal = document.getElementById('modal-content-form');
    if (modal) modal.classList.remove('active');

    this.renderContentsList();
    window.updateDashboards?.();
  },

  confirmDeleteContent(id) {
    const item = StorageService.getContentById(id);
    if (!item) return;

    if (confirm(`Deseja realmente excluir o conteúdo "${item.titulo}"? Esta ação não pode ser desfeita.`)) {
      StorageService.deleteContent(id);
      window.showToast?.('Conteúdo excluído com sucesso.', 'info');
      this.renderContentsList();
      window.updateDashboards?.();
    }
  }
};
