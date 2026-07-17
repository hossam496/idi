/**
 * Grammar Service — migrated to backend API.
 * All operations now call the real REST API instead of localStorage.
 * The function signatures are unchanged so no component needs to update.
 */

import { grammarAPI } from './api';

// ── Read ──────────────────────────────────────────────────────────────────────

/**
 * Fetch all grammar items for the authenticated user.
 * Returns a Promise<Array>.
 */
export const getAll = async () => {
  const res = await grammarAPI.getAll();
  return res.data.data.grammar ?? [];
};

/**
 * Fetch a single grammar item by id.
 */
export const getById = async (id) => {
  const res = await grammarAPI.getById(id);
  return res.data.data.grammar;
};

// ── Write ─────────────────────────────────────────────────────────────────────

/**
 * Create a new grammar item.
 * @param {object} fields
 * @returns {Promise<{ ok: boolean, item?: object, error?: string }>}
 */
export const create = async (fields) => {
  try {
    const res = await grammarAPI.create(fields);
    return { ok: true, item: res.data.data.grammar };
  } catch (err) {
    const message = err.response?.data?.message || 'Errore durante il salvataggio.';
    console.error('[grammarService.create] 400 error:', message, '| payload:', JSON.stringify(fields));
    return { ok: false, error: message };
  }
};

/**
 * Update an existing grammar item by id.
 * @param {string} id
 * @param {object} fields
 * @returns {Promise<{ ok: boolean, item?: object, error?: string }>}
 */
export const update = async (id, fields) => {
  try {
    const res = await grammarAPI.update(id, fields);
    return { ok: true, item: res.data.data.grammar };
  } catch (err) {
    const message = err.response?.data?.message || 'Errore durante l\'aggiornamento.';
    return { ok: false, error: message };
  }
};

/**
 * Delete a grammar item by id.
 * @param {string} id
 * @returns {Promise<{ ok: boolean }>}
 */
export const remove = async (id) => {
  try {
    await grammarAPI.remove(id);
    return { ok: true };
  } catch (err) {
    const message = err.response?.data?.message || 'Errore durante l\'eliminazione.';
    return { ok: false, error: message };
  }
};

/**
 * Delete ALL grammar items for the authenticated user.
 * @returns {Promise<{ ok: boolean }>}
 */
export const removeAll = async () => {
  try {
    await grammarAPI.removeAll();
    return { ok: true };
  } catch (err) {
    const message = err.response?.data?.message || 'Errore durante l\'eliminazione.';
    return { ok: false, error: message };
  }
};
export const toggleFavorite = async (id) => {
  try {
    const res = await grammarAPI.toggleFavorite(id);
    return { ok: true, item: res.data.data.grammar };
  } catch (err) {
    const message = err.response?.data?.message || 'Errore nel toggle preferito.';
    return { ok: false, error: message };
  }
};
