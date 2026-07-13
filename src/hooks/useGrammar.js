import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import * as grammarUtils from '../utils/extractGrammar';

/**
 * Custom React hook for student-isolated grammar rule state and functions.
 * Keeps React UI states synced with the underlying storage layer.
 */
export function useGrammar() {
  const { user } = useAuth();
  const userId = user?.id;

  const [grammarList, setGrammarList] = useState(() => {
    return userId ? grammarUtils.loadGrammar(userId) : [];
  });

  // Load grammar from storage
  const load = useCallback(() => {
    if (!userId) {
      setGrammarList([]);
      return [];
    }
    const list = grammarUtils.loadGrammar(userId);
    setGrammarList(list);
    return list;
  }, [userId]);

  // Sync state on mount and user change
  useEffect(() => {
    load();
  }, [load]);

  // Listen to cross-context/window changes to keep data synchronized instantly
  useEffect(() => {
    const handleEventChange = (e) => {
      if (e.detail && e.detail.userId === userId) {
        load();
      }
    };

    window.addEventListener('idi_grammar_change', handleEventChange);
    return () => {
      window.removeEventListener('idi_grammar_change', handleEventChange);
    };
  }, [userId, load]);

  // Adds a single grammar item
  const addGrammar = useCallback((item) => {
    if (!userId || !item) return;
    grammarUtils.saveGrammar(userId, item);
    load();
  }, [userId, load]);

  // Removes a single grammar item by id
  const removeGrammar = useCallback((id) => {
    if (!userId || !id) return;
    const current = grammarUtils.loadGrammar(userId);
    const updated = current.filter(item => item.id !== id);
    grammarUtils.updateGrammarStorage(userId, updated);
    load();
  }, [userId, load]);

  // Clears all grammar rules for the logged-in user
  const clearGrammar = useCallback(() => {
    if (!userId) return;
    grammarUtils.updateGrammarStorage(userId, []);
    load();
  }, [userId, load]);

  // Extracts and saves grammar from the raw/JSON AI response
  const saveGrammarFromResponse = useCallback((aiResponse) => {
    if (!userId || !aiResponse) return;
    const extracted = grammarUtils.extractGrammar(aiResponse);
    if (extracted) {
      grammarUtils.saveGrammar(userId, extracted);
      load();
    }
  }, [userId, load]);

  // Memoize state and functions to optimize performance and prevent unnecessary re-renders
  return useMemo(() => ({
    grammarList,
    loadGrammar: load,
    addGrammar,
    removeGrammar,
    clearGrammar,
    saveGrammarFromResponse
  }), [grammarList, load, addGrammar, removeGrammar, clearGrammar, saveGrammarFromResponse]);
}
