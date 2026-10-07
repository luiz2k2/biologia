/**
 * BioConecta - Módulo de Autenticação e Sessão de Usuários
 * Controla os perfis de Professor e Aluno para demonstração acadêmica.
 */

const AUTH_USER_KEY = 'bioconecta_current_user_v1';

export const AuthService = {
  // Usuários padrão pré-configurados para a demonstração
  DEMO_USERS: {
    professor: {
      id: 'prof-01',
      nome: 'Prof. Dra. Helena Meireles',
      email: 'professor@biologia.edu',
      senhaPadrao: '123456',
      perfil: 'professor',
      cargo: 'Docente de Biologia e Genética',
      avatar: 'HM'
    },
    aluno: {
      id: 'alu-01',
      nome: 'Lucas Silva',
      email: 'aluno@biologia.edu',
      senhaPadrao: '123456',
      perfil: 'aluno',
      turma: '3º Ano A - Ensino Médio',
      avatar: 'LS'
    }
  },

  getCurrentUser() {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
      // Inicia por padrão com o Aluno logado para facilidade de demonstração inicial
      const defaultUser = this.DEMO_USERS.aluno;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return this.DEMO_USERS.aluno;
    }
  },

  login(email, senha, role = 'aluno') {
    // Validação flexível para demonstração acadêmica
    let user;
    if (role === 'professor' || email.toLowerCase().includes('prof')) {
      user = {
        ...this.DEMO_USERS.professor,
        email: email || this.DEMO_USERS.professor.email
      };
    } else {
      user = {
        ...this.DEMO_USERS.aluno,
        email: email || this.DEMO_USERS.aluno.email
      };
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('auth:change', { detail: user }));
    return user;
  },

  logout() {
    localStorage.removeItem(AUTH_USER_KEY);
    window.dispatchEvent(new CustomEvent('auth:change', { detail: null }));
  },

  isProfessor() {
    const user = this.getCurrentUser();
    return user && user.perfil === 'professor';
  },

  isStudent() {
    const user = this.getCurrentUser();
    return user && user.perfil === 'aluno';
  },

  switchProfile(targetRole) {
    if (targetRole === 'professor') {
      return this.login(this.DEMO_USERS.professor.email, '123456', 'professor');
    } else {
      return this.login(this.DEMO_USERS.aluno.email, '123456', 'aluno');
    }
  }
};
