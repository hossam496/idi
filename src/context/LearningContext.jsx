/**
 * LearningContext — migrated to backend API.
 * All grammar / vocabulary / stats data now comes from the server.
 * Component API is unchanged — same function names, same props.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as grammarService    from '../services/grammarService';
import * as vocabularyService from '../services/vocabularyService';
import { statsAPI }           from '../services/api';

const LearningContext = createContext(null);

// ── Default stats (shown while loading) ──────────────────────────────────────
const DEFAULT_STATS = {
  wordsLearnedCount:   0,
  grammarLearnedCount: 0,
  conversationsCount:  0,
  learningDays:        1,
  achievements: [
    { id: '1', title: 'Primo Incontro',  desc: "Hai avviato la tua prima chat con l'IA",  date: '', unlocked: false },
    { id: '2', title: 'Esploratore',     desc: 'Aggiunto il primo vocabolo al dizionario', date: '', unlocked: false },
    { id: '3', title: 'Grammatico',      desc: 'Salvato la prima regola grammaticale',     date: '', unlocked: false },
    { id: '4', title: 'Cicerone',        desc: 'Completato 5 conversazioni lunghe',        date: '', unlocked: false },
    { id: '5', title: 'Verbologo',       desc: 'Aggiunto il primo verbo con coniugazione', date: '', unlocked: false },
  ],
};

export const LearningProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  const [grammarList,    setGrammarList]    = useState([]);
  const [vocabularyList, setVocabularyList] = useState([]);
  const [stats,          setStats]          = useState({ ...DEFAULT_STATS });
  const [loadingData,    setLoadingData]    = useState(false);

  // ── Load all data from server when user logs in ───────────────────────────
  const loadAllUserData = useCallback(async () => {
    if (!isAuthenticated) {
      setGrammarList([]);
      setVocabularyList([]);
      setStats({ ...DEFAULT_STATS });
      return;
    }
    setLoadingData(true);
    try {
      const [grammar, vocabulary, summary, achievements] = await Promise.all([
        grammarService.getAll(),
        vocabularyService.getAll(),
        statsAPI.getSummary().then(r => r.data.data.stats),
        statsAPI.getAchievements().then(r => r.data.data.achievements),
      ]);
      setGrammarList(grammar);
      setVocabularyList(vocabulary);
      setStats({ ...summary, achievements });
    } catch (err) {
      console.error('Failed to load user data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { loadAllUserData(); }, [loadAllUserData]);

  // ── Refresh stats from server ─────────────────────────────────────────────
  const refreshStats = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [summary, achievements] = await Promise.all([
        statsAPI.getSummary().then(r => r.data.data.stats),
        statsAPI.getAchievements().then(r => r.data.data.achievements),
      ]);
      setStats({ ...summary, achievements });
    } catch (err) {
      console.error('Failed to refresh stats:', err);
    }
  }, [isAuthenticated]);

  // ── Grammar CRUD ──────────────────────────────────────────────────────────

  /** AI auto-save (called from ChatContext after AI reply) */
  const addGrammarItem = useCallback(async (fields) => {
    const result = await grammarService.create({ ...fields, source: 'ai' });
    if (result.ok) {
      setGrammarList(prev => [result.item, ...prev]);
      refreshStats();
    }
    return result;
  }, [refreshStats]);

  /** Manual create from GrammarFormModal */
  const createGrammarItem = useCallback(async (fields) => {
    const result = await grammarService.create({ ...fields, source: 'manual' });
    if (result.ok) {
      setGrammarList(prev => [result.item, ...prev]);
      refreshStats();
    }
    return result;
  }, [refreshStats]);

  /** Edit from GrammarFormModal */
  const updateGrammarItem = useCallback(async (id, fields) => {
    const result = await grammarService.update(id, fields);
    if (result.ok) {
      setGrammarList(prev => prev.map(g => g.id === id ? result.item : g));
    }
    return result;
  }, []);

  /** Delete from Grammar page */
  const deleteGrammarItem = useCallback(async (id) => {
    const result = await grammarService.remove(id);
    if (result.ok) {
      setGrammarList(prev => prev.filter(g => g.id !== id));
      refreshStats();
    }
    return result;
  }, [refreshStats]);

  /** Toggle favorite */
  const toggleFavoriteGrammar = useCallback(async (id) => {
    const result = await grammarService.toggleFavorite(id);
    if (result.ok) {
      setGrammarList(prev => prev.map(g => g.id === id ? result.item : g));
    }
    return result;
  }, []);

  // ── Vocabulary CRUD ───────────────────────────────────────────────────────

  /** AI auto-save */
  const addVocabularyItem = useCallback(async (fields) => {
    const result = await vocabularyService.create({ ...fields, source: 'ai' });
    if (result.ok) {
      setVocabularyList(prev => [result.item, ...prev]);
      refreshStats();
    }
    return result;
  }, [refreshStats]);

  /** Manual create from VocabularyFormModal */
  const createVocabularyItem = useCallback(async (fields) => {
    const result = await vocabularyService.create({ ...fields, source: 'manual' });
    if (result.ok) {
      setVocabularyList(prev => [result.item, ...prev]);
      refreshStats();
    }
    return result;
  }, [refreshStats]);

  /** Edit */
  const updateVocabularyItem = useCallback(async (id, fields) => {
    const result = await vocabularyService.update(id, fields);
    if (result.ok) {
      setVocabularyList(prev => prev.map(v => v.id === id ? result.item : v));
    }
    return result;
  }, []);

  /** Delete */
  const deleteVocabularyItem = useCallback(async (id) => {
    const result = await vocabularyService.remove(id);
    if (result.ok) {
      setVocabularyList(prev => prev.filter(v => v.id !== id));
      refreshStats();
    }
    return result;
  }, [refreshStats]);

  /** Toggle favorite */
  const toggleFavoriteVocabulary = useCallback(async (id) => {
    const result = await vocabularyService.toggleFavorite(id);
    if (result.ok) {
      setVocabularyList(prev => prev.map(v => v.id === id ? result.item : v));
    }
    return result;
  }, []);

  // ── Conversation counter (called from ChatContext) ────────────────────────
  // Stats are now live from DB — just refresh after a new conversation message
  const incrementConversations = useCallback(() => {
    refreshStats();
  }, [refreshStats]);

  // ── Derived values ────────────────────────────────────────────────────────
  const favoritesCount = grammarList.filter(g => g.favorite).length
                       + vocabularyList.filter(v => v.favorite).length;
  const verbCount = vocabularyList.filter(v => v.partOfSpeech === 'Verbo').length;

  return (
    <LearningContext.Provider
      value={{
        grammarList,
        vocabularyList,
        stats,
        loadingData,
        favoritesCount,
        verbCount,

        // Grammar
        addGrammarItem,
        createGrammarItem,
        updateGrammarItem,
        deleteGrammarItem,
        toggleFavoriteGrammar,

        // Vocabulary
        addVocabularyItem,
        createVocabularyItem,
        updateVocabularyItem,
        deleteVocabularyItem,
        toggleFavoriteVocabulary,

        // Misc
        incrementConversations,
        refreshStats,
        loadAllUserData,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error('useLearning deve essere usato dentro LearningProvider');
  return ctx;
};
