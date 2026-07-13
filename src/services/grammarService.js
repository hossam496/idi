/**
 * Grammar Service — single source of truth for all grammar CRUD operations.
 *
 * Currently backed by localStorage (via extractGrammar utils + storage service).
 * To migrate to a backend, replace each function body with an API call.
 * No React component needs to change — only this file.
 *
 * Example future migration:
 *   export const getAll  = (userId) => api.get(`/grammar?user=${userId}`);
 *   export const create  = (userId, item) => api.post('/grammar', item);
 *   export const update  = (userId, id, patch) => api.put(`/grammar/${id}`, patch);
 *   export const remove  = (userId, id) => api.delete(`/grammar/${id}`);
 */

import { loadGrammar, updateGrammarStorage } from '../utils/extractGrammar';

/** Unique ID generator. */
const newId = () => `grammar_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

/** ISO date string (YYYY-MM-DD). */
const today = () => new Date().toISOString().split('T')[0];

/**
 * Fetch all grammar items for a user.
 * @param {string} userId
 * @returns {Array}
 */
export const getAll = (userId) => loadGrammar(userId) ?? [];

/**
 * Create a new grammar item.
 * Deduplicates by title (case-insensitive).
 * @param {string} userId
 * @param {object} fields  — raw form values
 * @returns {{ ok: boolean, item?: object, error?: string }}
 */
export const create = (userId, fields) => {
  const list = getAll(userId);
  const titleLower = (fields.title || '').trim().toLowerCase();

  if (!titleLower) return { ok: false, error: 'Il titolo è obbligatorio.' };
  if (list.some((g) => g.title.toLowerCase() === titleLower)) {
    return { ok: false, error: 'Questa regola esiste già nel tuo archivio.' };
  }

  const item = buildItem(fields);
  updateGrammarStorage(userId, [item, ...list]);
  return { ok: true, item };
};

/**
 * Update an existing grammar item by id.
 * @param {string} userId
 * @param {string} id
 * @param {object} fields  — updated form values
 * @returns {{ ok: boolean, item?: object, error?: string }}
 */
export const update = (userId, id, fields) => {
  const list = getAll(userId);
  const idx = list.findIndex((g) => g.id === id);
  if (idx === -1) return { ok: false, error: 'Regola non trovata.' };

  const updated = { ...list[idx], ...buildItem(fields), id };
  const next = [...list];
  next[idx] = updated;
  updateGrammarStorage(userId, next);
  return { ok: true, item: updated };
};

/**
 * Delete a grammar item by id.
 * @param {string} userId
 * @param {string} id
 * @returns {{ ok: boolean }}
 */
export const remove = (userId, id) => {
  const list = getAll(userId).filter((g) => g.id !== id);
  updateGrammarStorage(userId, list);
  return { ok: true };
};

/**
 * Toggle the favorite flag for a grammar item.
 * @param {string} userId
 * @param {string} id
 * @returns {{ ok: boolean }}
 */
export const toggleFavorite = (userId, id) => {
  const list = getAll(userId);
  const next = list.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g));
  updateGrammarStorage(userId, next);
  return { ok: true };
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Normalise raw form fields into the canonical grammar item shape.
 * Supports both AI-sourced and manually-entered items.
 */
function buildItem(fields) {
  const examples = (fields.examples || [])
    .filter((ex) => (ex.it || '').trim())
    .map((ex) => ({ it: ex.it.trim(), ar: (ex.ar || '').trim() }));

  const tags = Array.isArray(fields.tags)
    ? fields.tags.filter(Boolean)
    : (fields.tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

  return {
    id: fields.id || newId(),
    title: (fields.title || '').trim(),
    arabicTitle: (fields.arabicTitle || '').trim(),
    italianName: (fields.title || '').trim(),
    // Support both field naming conventions (AI vs manual)
    explanationItalian: (fields.italianExplanation || fields.explanationItalian || '').trim(),
    explanationArabic: (fields.arabicExplanation || fields.explanationArabic || '').trim(),
    examples,
    difficulty: fields.difficulty || fields.level || 'Principiante',
    tags,
    favorite: fields.favorite ?? false,
    source: fields.source || 'manual', // 'manual' | 'ai'
    createdAt: fields.createdAt || today(),
    dateLearned: fields.dateLearned || today(),
  };
}
