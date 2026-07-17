/**
 * Vocabulary Service — migrated to backend API.
 * All operations now call the real REST API instead of localStorage.
 * The function signatures are unchanged so no component needs to update.
 */

import { vocabularyAPI } from './api';

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * Fetch all vocabulary items for the authenticated user.
 * Returns a Promise<Array>.
 */
export const getAll = async () => {
  const res = await vocabularyAPI.getAll();
  return res.data.data.vocabulary ?? [];
};

/**
 * Fetch a single vocabulary item by id.
 */
export const getById = async (id) => {
  const res = await vocabularyAPI.getById(id);
  return res.data.data.vocabulary;
};

// ── Write ─────────────────────────────────────────────────────────────────────

/**
 * Create a new vocabulary item.
 * @param {object} fields
 * @returns {Promise<{ ok: boolean, item?: object, error?: string }>}
 */
export const create = async (fields) => {
  try {
    const res = await vocabularyAPI.create(fields);
    return { ok: true, item: res.data.data.vocabulary };
  } catch (err) {
    const message = err.response?.data?.message || 'Errore durante il salvataggio.';
    console.error('[vocabularyService.create] 400 error:', message, '| payload:', JSON.stringify(fields));
    return { ok: false, error: message };
  }
};

/**
 * Update an existing vocabulary item by id.
 * @param {string} id
 * @param {object} fields
 * @returns {Promise<{ ok: boolean, item?: object, error?: string }>}
 */
export const update = async (id, fields) => {
  try {
    const res = await vocabularyAPI.update(id, fields);
    return { ok: true, item: res.data.data.vocabulary };
  } catch (err) {
    const message = err.response?.data?.message || 'Errore durante l\'aggiornamento.';
    return { ok: false, error: message };
  }
};

/**
 * Delete a vocabulary item by id.
 * @param {string} id
 * @returns {Promise<{ ok: boolean }>}
 */
export const remove = async (id) => {
  try {
    await vocabularyAPI.remove(id);
    return { ok: true };
  } catch (err) {
    const message = err.response?.data?.message || 'Errore durante l\'eliminazione.';
    return { ok: false, error: message };
  }
};

/**
 * Delete ALL vocabulary items for the authenticated user.
 * @returns {Promise<{ ok: boolean }>}
 */
export const removeAll = async () => {
  try {
    await vocabularyAPI.removeAll();
    return { ok: true };
  } catch (err) {
    const message = err.response?.data?.message || 'Errore durante l\'eliminazione.';
    return { ok: false, error: message };
  }
};

/**
 * Toggle the favorite flag on a vocabulary item.
 * @param {string} id
 * @returns {Promise<{ ok: boolean, item?: object }>}
 */
export const toggleFavorite = async (id) => {
  try {
    const res = await vocabularyAPI.toggleFavorite(id);
    return { ok: true, item: res.data.data.vocabulary };
  } catch (err) {
    const message = err.response?.data?.message || 'Errore nel toggle preferito.';
    return { ok: false, error: message };
  }
};
