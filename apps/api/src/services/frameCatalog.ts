import type { CinephileRank, FrameEffect, FrameRarity } from '@cena/shared';

export interface FrameDefinition {
  key: string;
  name: string;
  description: string;
  rarity: FrameRarity;
  effect: FrameEffect;
  colors: string[];
  /** Null for the starter frame and the founder-exclusive staff frames. */
  unlockRank: CinephileRank | null;
}

/** The starter frame every account owns from day one. */
export const STARTER_FRAME_KEY = 'classico';

/**
 * The frame catalog (brief §5.6). Rank-gated frames unlock automatically as
 * the Ordem Cinéfila rank rises (see frameService); staff frames are only
 * ever granted directly by the founder account via gifting.
 */
export const FRAME_CATALOG: FrameDefinition[] = [
  {
    key: STARTER_FRAME_KEY,
    name: 'Clássico',
    description: 'O anel padrão de todo cinéfilo, desde a primeira sessão.',
    rarity: 'comum',
    effect: 'none',
    colors: [],
    unlockRank: null,
  },
  {
    key: 'brilho-sutil',
    name: 'Brilho Sutil',
    description: 'Um halo suave — desbloqueado ao alcançar o patamar Apreciador.',
    rarity: 'comum',
    effect: 'glow',
    colors: ['#7dd3fc', '#38bdf8'],
    unlockRank: 'apreciador',
  },
  {
    key: 'pulso-cinefilo',
    name: 'Pulso Cinéfilo',
    description: 'Pulsa no ritmo de quem não para de assistir — patamar Cinético.',
    rarity: 'especial',
    effect: 'pulse',
    colors: ['#a78bfa', '#7c3aed'],
    unlockRank: 'cinetico',
  },
  {
    key: 'giro-de-cena',
    name: 'Giro de Cena',
    description: 'Um giro constante ao redor do avatar — patamar Cinéfilo.',
    rarity: 'especial',
    effect: 'rotate',
    colors: ['#fb7185', '#f43f5e'],
    unlockRank: 'cinefilo',
  },
  {
    key: 'cintilante',
    name: 'Cintilante',
    description: 'Reflexos dourados de quem já é referência — patamar Curador.',
    rarity: 'lendario',
    effect: 'shimmer',
    colors: ['#fbbf24', '#f59e0b'],
    unlockRank: 'curador',
  },
  {
    key: 'orbita-cinefila',
    name: 'Órbita Cinéfila',
    description: 'Partículas orbitando o avatar — reservado ao topo da Ordem, Arquiteto.',
    rarity: 'lendario',
    effect: 'orbital',
    colors: ['#34d399', '#059669'],
    unlockRank: 'arquiteto',
  },
  {
    key: 'estrela-de-cena',
    name: 'Estrela de Cena',
    description: 'Moldura exclusiva do fundador da CENA — só chega por presente.',
    rarity: 'staff',
    effect: 'prismatic',
    colors: ['#f472b6', '#a78bfa', '#38bdf8'],
    unlockRank: null,
  },
  {
    key: 'assinatura-cena',
    name: 'Assinatura CENA',
    description: 'A assinatura da casa — presente exclusivo do fundador.',
    rarity: 'staff',
    effect: 'scanline',
    colors: ['#e2e8f0', '#94a3b8'],
    unlockRank: null,
  },
];
