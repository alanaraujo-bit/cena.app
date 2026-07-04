/** A title's watch state. Three explicit, parallel states — not one hidden enum. */
export const WATCH_STATES = ['assistido', 'assistindo', 'para_assistir'] as const;
export type WatchState = (typeof WATCH_STATES)[number];

/** Media types sourced from TMDB. */
export const MEDIA_TYPES = ['movie', 'tv'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

/** Self-rated cinephile level captured during onboarding (cold-start signal only). */
export const CINEPHILE_LEVELS = ['iniciante', 'intermediario', 'avancado', 'especialista'] as const;
export type CinephileLevel = (typeof CINEPHILE_LEVELS)[number];

/** Profile privacy modes. */
export const PRIVACY_MODES = ['publico', 'apenas_amigos', 'privado'] as const;
export type PrivacyMode = (typeof PRIVACY_MODES)[number];

/** Polymorphic activity feed item types. */
export const ACTIVITY_TYPES = [
  'rating',
  'review',
  'watched',
  'want_to_watch',
  'list_created',
  'referral',
  'versus_created',
  'versus_voted',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** Notification types — each maps to its own icon/copy in the app. */
export const NOTIFICATION_TYPES = [
  'like',
  'unlike',
  'comment',
  'new_follower',
  'follow_request',
  'follow_accepted',
  'profile_interaction',
  'versus_vote',
  'frame_gift',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Profile frame rarity tiers. */
export const FRAME_RARITIES = ['comum', 'especial', 'lendario', 'staff'] as const;
export type FrameRarity = (typeof FRAME_RARITIES)[number];

/** How a frame was unlocked/granted — drives the "de onde veio" flair in the UI. */
export const FRAME_SOURCES = ['starter', 'rank_unlock', 'founder_gift'] as const;
export type FrameSource = (typeof FRAME_SOURCES)[number];

/** Animated frame effect kinds (rendered via Reanimated, not GIFs). */
export const FRAME_EFFECTS = [
  'none',
  'glow',
  'pulse',
  'rotate',
  'shimmer',
  'orbital',
  'prismatic',
  'scanline',
] as const;
export type FrameEffect = (typeof FRAME_EFFECTS)[number];

/** Append-only ranking event kinds. */
export const RANKING_EVENT_TYPES = ['add', 'remove'] as const;
export type RankingEventType = (typeof RANKING_EVENT_TYPES)[number];

/** Opening-message classification. */
export const OPENING_MESSAGE_TYPES = ['phrase', 'curiosity', 'reflection', 'meta'] as const;
export type OpeningMessageType = (typeof OPENING_MESSAGE_TYPES)[number];

export const OPENING_MESSAGE_CONTEXTS = ['movie', 'series', 'cinema', 'general'] as const;
export type OpeningMessageContext = (typeof OPENING_MESSAGE_CONTEXTS)[number];

/** Subscription entitlement tiers. */
export const ENTITLEMENT_TIERS = ['free', 'premium'] as const;
export type EntitlementTier = (typeof ENTITLEMENT_TIERS)[number];

/** Rating scale — 0 to 10 in half steps, used everywhere in the product. */
export const RATING_MIN = 0;
export const RATING_MAX = 10;
export const RATING_STEP = 0.5;
