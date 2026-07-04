/**
 * pt-BR is the shipped language. All user-facing copy lives here so English can
 * be added later as a sibling file without touching components. The brand's
 * cinephile vocabulary (Ordem Cinéfila, Filme Versus) is intentional, not a
 * translation gap — keep it.
 */
export const ptBR = {
  common: {
    appName: 'CENA',
    tagline: 'Sua cena favorita, toda noite.',
    continue: 'Continuar',
    cancel: 'Cancelar',
    save: 'Salvar',
    retry: 'Tentar novamente',
    loading: 'Carregando…',
    seeAll: 'Ver tudo',
    comingSoon: 'Em breve',
  },
  tabs: {
    feed: 'Feed',
    search: 'Buscar',
    log: 'Registrar',
    ranking: 'Ranking',
    profile: 'Perfil',
  },
  feed: {
    title: 'Feed',
    empty: 'Seu feed está tranquilo por aqui. Siga cinéfilos para ver o que estão assistindo.',
  },
  search: {
    title: 'Buscar',
    placeholder: 'Filmes, séries, pessoas…',
    empty: 'Busque um filme ou série para começar.',
  },
  ranking: {
    title: 'Ranking',
    empty: 'O ranking aparece aqui conforme você e quem você segue assiste.',
  },
  profile: {
    title: 'Perfil',
    watched: 'Assistidos',
    watching: 'Assistindo',
    wantToWatch: 'Quero assistir',
    followers: 'Seguidores',
    following: 'Seguindo',
  },
  log: {
    title: 'Registrar',
    subtitle: 'O que você assistiu?',
    markWatched: 'Marcar como assistido',
    startVersus: 'Criar Filme Versus',
  },
  watchState: {
    assistido: 'Assistido',
    assistindo: 'Assistindo',
    para_assistir: 'Quero assistir',
  },
  settings: {
    title: 'Ajustes',
    appearance: 'Aparência',
    themeSystem: 'Sistema',
    themeLight: 'Claro',
    themeDark: 'Escuro',
  },
} as const;

export type Strings = typeof ptBR;
