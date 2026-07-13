/**
 * Vocabulary Service — single source of truth for all vocabulary CRUD operations.
 *
 * Currently backed by localStorage via storage.js.
 * To migrate to a backend, replace each function body with an API call.
 * No React component needs to change — only this file.
 *
 * Example future migration:
 *   export const getAll = (userId) => api.get(`/vocabulary?user=${userId}`);
 *   export const create = (userId, item) => api.post('/vocabulary', item);
 *   export const update = (userId, id, patch) => api.put(`/vocabulary/${id}`, patch);
 *   export const remove = (userId, id) => api.delete(`/vocabulary/${id}`);
 */

import { loadUserData, saveUserData } from './storage';

const STORAGE_KEY = 'vocabulary';

/** Unique ID generator. */
const newId = () => `vocab_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/** ISO date string (YYYY-MM-DD). */
const today = () => new Date().toISOString().split('T')[0];

/**
 * Fetch all vocabulary items for a user.
 * @param {string} userId
 * @returns {Array}
 */
export const getAll = (userId) => loadUserData(userId, STORAGE_KEY) ?? [];

/**
 * Create a new vocabulary item.
 * Deduplicates by italianWord (case-insensitive).
 * @param {string} userId
 * @param {object} fields  — raw form values
 * @returns {{ ok: boolean, item?: object, error?: string }}
 */
export const create = (userId, fields) => {
  const list = getAll(userId);
  const wordLower = (fields.italianWord || '').trim().toLowerCase();

  if (!wordLower) return { ok: false, error: 'La parola italiana è obbligatoria.' };
  if (list.some((v) => v.italianWord.toLowerCase() === wordLower)) {
    return { ok: false, error: 'Questa parola esiste già nel tuo vocabolario.' };
  }

  const item = buildItem(fields);
  persist(userId, [item, ...list]);
  return { ok: true, item };
};

/**
 * Update an existing vocabulary item by id.
 * @param {string} userId
 * @param {string} id
 * @param {object} fields  — updated form values
 * @returns {{ ok: boolean, item?: object, error?: string }}
 */
export const update = (userId, id, fields) => {
  const list = getAll(userId);
  const idx = list.findIndex((v) => v.id === id);
  if (idx === -1) return { ok: false, error: 'Parola non trovata.' };

  const updated = { ...list[idx], ...buildItem(fields), id };
  const next = [...list];
  next[idx] = updated;
  persist(userId, next);
  return { ok: true, item: updated };
};

/**
 * Delete a vocabulary item by id.
 * @param {string} userId
 * @param {string} id
 * @returns {{ ok: boolean }}
 */
export const remove = (userId, id) => {
  persist(userId, getAll(userId).filter((v) => v.id !== id));
  return { ok: true };
};

/**
 * Toggle the favorite flag for a vocabulary item.
 * @param {string} userId
 * @param {string} id
 * @returns {{ ok: boolean }}
 */
export const toggleFavorite = (userId, id) => {
  const next = getAll(userId).map((v) =>
    v.id === id ? { ...v, favorite: !v.favorite } : v
  );
  persist(userId, next);
  return { ok: true };
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Write list back to storage. */
const persist = (userId, list) => saveUserData(userId, STORAGE_KEY, list);

/**
 * Normalise raw form fields into the canonical vocabulary item shape.
 * Handles both AI-sourced and manually-entered items including verb conjugations.
 */
function buildItem(fields) {
  const base = {
    id: fields.id || newId(),
    italianWord: (fields.italianWord || '').trim(),
    arabicTranslation: (fields.arabicTranslation || '').trim(),
    pronunciation: (fields.pronunciation || '').trim(),
    partOfSpeech: fields.partOfSpeech || 'Sostantivo',
    example: (fields.example || '').trim(),
    arabicExample: (fields.arabicExample || '').trim(),
    notes: (fields.notes || '').trim(),
    favorite: fields.favorite ?? false,
    source: fields.source || 'manual', // 'manual' | 'ai'
    dateAdded: fields.dateAdded || today(),
  };

  // Attach verb-specific conjugation block only when applicable
  if (fields.partOfSpeech === 'Verbo' || fields.verbData) {
    base.verbData = {
      infinitive: (fields.verbData?.infinitive ?? fields.italianWord ?? '').trim(),
      meaning: (fields.verbData?.meaning ?? fields.arabicTranslation ?? '').trim(),
      presentTense: (fields.verbData?.presentTense || '').trim(),
      pastTense: (fields.verbData?.pastTense || '').trim(),
      future: (fields.verbData?.future || '').trim(),
      imperative: (fields.verbData?.imperative || '').trim(),
      pastParticiple: (fields.verbData?.pastParticiple || '').trim(),
      reflexive: fields.verbData?.reflexive ?? false,
      auxiliary: fields.verbData?.auxiliary || 'Avere', // 'Essere' | 'Avere'
      conjugationNotes: (fields.verbData?.conjugationNotes || '').trim(),
      irregular: fields.verbData?.irregular ?? false,
      examples: (fields.verbData?.examples || [])
        .filter((e) => (e.it || '').trim())
        .map((e) => ({ it: e.it.trim(), ar: (e.ar || '').trim() })),
    };
  }

  return base;
}
