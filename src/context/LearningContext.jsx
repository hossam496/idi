import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { saveUserData } from '../services/storage';
import * as grammarService from '../services/grammarService';
import * as vocabularyService from '../services/vocabularyService';
import { loadGrammar, updateGrammarStorage } from '../utils/extractGrammar';

const LearningContext = createContext(null);

// ---------------------------------------------------------------------------
// Default stats template
// ---------------------------------------------------------------------------
const DEFAULT_STATS = {
  wordsLearnedCount: 0,
  grammarLearnedCount: 0,
  conversationsCount: 0,
  learningDays: 1,
  achievements: [
    { id: '1', title: 'Primo Incontro',  desc: "Hai avviato la tua prima chat con l'IA",     date: '', unlocked: false },
    { id: '2', title: 'Esploratore',     desc: 'Aggiunto il primo vocabolo al dizionario',    date: '', unlocked: false },
    { id: '3', title: 'Grammatico',      desc: 'Salvato la prima regola grammaticale',        date: '', unlocked: false },
    { id: '4', title: 'Cicerone',        desc: 'Completato 5 conversazioni lunghe',           date: '', unlocked: false },
    { id: '5', title: 'Verbologo',       desc: 'Aggiunto il primo verbo con coniugazione',    date: '', unlocked: false },
  ],
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const LearningProvider = ({ children }) => {
  const { user } = useAuth();

  const [grammarList,    setGrammarList]    = useState([]);
  const [vocabularyList, setVocabularyList] = useState([]);
  const [stats,          setStats]          = useState({ ...DEFAULT_STATS });

  // ── helpers ──────────────────────────────────────────────────────────────

  /** Recompute and persist stats whenever lists change. */
  const syncStats = useCallback((gList, vList, extra = {}) => {
    if (!user?.id) return;
    setStats(prev => {
      const verbCount = vList.filter(v => v.partOfSpeech === 'Verbo').length;
      const updated = {
        ...prev,
        grammarLearnedCount: gList.length,
        wordsLearnedCount:   vList.length,
        ...extra,
        achievements: prev.achievements.map(a => {
          if (a.unlocked) return a;
          const now = new Date().toISOString().split('T')[0];
          if (a.id === '2' && vList.length > 0)  return { ...a, unlocked: true, date: now };
          if (a.id === '3' && gList.length > 0)  return { ...a, unlocked: true, date: now };
          if (a.id === '5' && verbCount > 0)      return { ...a, unlocked: true, date: now };
          return a;
        }),
      };
      saveUserData(user.id, 'stats', updated);
      return updated;
    });
  }, [user?.id]);

  /** Push a grammar list to state + storage and resync stats. */
  const commitGrammar = useCallback((list, vocabRef) => {
    setGrammarList(list);
    updateGrammarStorage(user?.id, list);
    syncStats(list, vocabRef ?? vocabularyList);
  }, [user?.id, vocabularyList, syncStats]);

  /** Push a vocabulary list to state + storage and resync stats. */
  const commitVocabulary = useCallback((list, grammarRef) => {
    setVocabularyList(list);
    saveUserData(user?.id, 'vocabulary', list);
    syncStats(grammarRef ?? grammarList, list);
  }, [user?.id, grammarList, syncStats]);

  // ── initial load ──────────────────────────────────────────────────────────

  const loadAllUserData = useCallback(() => {
    if (!user?.id) {
      setGrammarList([]);
      setVocabularyList([]);
      setStats({ ...DEFAULT_STATS });
      return;
    }
    const g = grammarService.getAll(user.id);
    const v = vocabularyService.getAll(user.id);
    const s = saveUserData.__loadStats?.(user.id); // no-op shim, stats loaded below
    const storedStats = (() => {
      try {
        const raw = localStorage.getItem(`idi_${user.id}_stats`);
        return raw ? JSON.parse(raw) : null;
      } catch { return null; }
    })();

    setGrammarList(g);
    setVocabularyList(v);
    setStats(storedStats || { ...DEFAULT_STATS });
  }, [user?.id]);

  useEffect(() => { loadAllUserData(); }, [loadAllUserData]);

  // ── cross-context grammar change event (fired by extractGrammar util) ────

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.userId !== user?.id) return;
      const fresh = loadGrammar(user.id);
      setGrammarList(fresh || []);
      syncStats(fresh || [], vocabularyList);
    };
    window.addEventListener('idi_grammar_change', handler);
    return () => window.removeEventListener('idi_grammar_change', handler);
  }, [user?.id, vocabularyList, syncStats]);

  // ── Grammar CRUD ──────────────────────────────────────────────────────────

  /** Called from Chat.jsx when AI extracts a grammar rule → same as manual add. */
  const addGrammarItem = useCallback((fields) => {
    if (!user?.id) return { ok: false };
    const result = grammarService.create(user.id, {
      ...fields,
      source: fields.source || 'ai',
    });
    if (result.ok) commitGrammar(grammarService.getAll(user.id));
    return result;
  }, [user?.id, commitGrammar]);

  /** Called from GrammarFormModal (new manual entry). */
  const createGrammarItem = useCallback((fields) => {
    if (!user?.id) return { ok: false };
    const result = grammarService.create(user.id, { ...fields, source: 'manual' });
    if (result.ok) commitGrammar(grammarService.getAll(user.id));
    return result;
  }, [user?.id, commitGrammar]);

  /** Called from GrammarFormModal (edit existing). */
  const updateGrammarItem = useCallback((id, fields) => {
    if (!user?.id) return { ok: false };
    const result = grammarService.update(user.id, id, fields);
    if (result.ok) commitGrammar(grammarService.getAll(user.id));
    return result;
  }, [user?.id, commitGrammar]);

  /** Called from Grammar.jsx card delete button. */
  const deleteGrammarItem = useCallback((id) => {
    if (!user?.id) return;
    grammarService.remove(user.id, id);
    commitGrammar(grammarService.getAll(user.id));
  }, [user?.id, commitGrammar]);

  const toggleFavoriteGrammar = useCallback((id) => {
    if (!user?.id) return;
    grammarService.toggleFavorite(user.id, id);
    commitGrammar(grammarService.getAll(user.id));
  }, [user?.id, commitGrammar]);

  // ── Vocabulary CRUD ───────────────────────────────────────────────────────

  /** Called from Chat.jsx when AI extracts a vocabulary item → same as manual add. */
  const addVocabularyItem = useCallback((fields) => {
    if (!user?.id) return { ok: false };
    const result = vocabularyService.create(user.id, {
      ...fields,
      source: fields.source || 'ai',
    });
    if (result.ok) commitVocabulary(vocabularyService.getAll(user.id));
    return result;
  }, [user?.id, commitVocabulary]);

  /** Called from VocabularyFormModal (new manual entry). */
  const createVocabularyItem = useCallback((fields) => {
    if (!user?.id) return { ok: false };
    const result = vocabularyService.create(user.id, { ...fields, source: 'manual' });
    if (result.ok) commitVocabulary(vocabularyService.getAll(user.id));
    return result;
  }, [user?.id, commitVocabulary]);

  /** Called from VocabularyFormModal (edit existing). */
  const updateVocabularyItem = useCallback((id, fields) => {
    if (!user?.id) return { ok: false };
    const result = vocabularyService.update(user.id, id, fields);
    if (result.ok) commitVocabulary(vocabularyService.getAll(user.id));
    return result;
  }, [user?.id, commitVocabulary]);

  /** Called from Vocabulary.jsx card delete button. */
  const deleteVocabularyItem = useCallback((id) => {
    if (!user?.id) return;
    vocabularyService.remove(user.id, id);
    commitVocabulary(vocabularyService.getAll(user.id));
  }, [user?.id, commitVocabulary]);

  const toggleFavoriteVocabulary = useCallback((id) => {
    if (!user?.id) return;
    vocabularyService.toggleFavorite(user.id, id);
    commitVocabulary(vocabularyService.getAll(user.id));
  }, [user?.id, commitVocabulary]);

  // ── Conversation counter ──────────────────────────────────────────────────

  const incrementConversations = useCallback(() => {
    if (!user?.id) return;
    setStats(prev => {
      const count = prev.conversationsCount + 1;
      const updated = {
        ...prev,
        conversationsCount: count,
        achievements: prev.achievements.map(a => {
          if (a.unlocked) return a;
          const now = new Date().toISOString().split('T')[0];
          if (a.id === '1') return { ...a, unlocked: true, date: now };
          if (a.id === '4' && count >= 5) return { ...a, unlocked: true, date: now };
          return a;
        }),
      };
      saveUserData(user.id, 'stats', updated);
      return updated;
    });
  }, [user?.id]);

  // ── Seed demo data ────────────────────────────────────────────────────────

  const seedDemoData = useCallback(() => {
    if (!user?.id) return;

    const demoGrammar = [
      {
        id: 'g_demo_1',
        title: 'Passato Prossimo con Essere o Avere',
        arabicTitle: 'زمن الماضي القريب',
        explanationItalian: "Il passato prossimo si forma con l'ausiliare essere o avere al presente indicativo e il participio passato del verbo.",
        explanationArabic: 'يتكون الماضي القريب (Passato Prossimo) باستخدام الفعل المساعد essere أو avere في المضارع مع اسم المفعول من الفعل الأساسي.',
        examples: [
          { it: 'Ho mangiato una pizza deliziosa.', ar: 'أكلتُ بيتزا لذيذة.' },
          { it: 'Sono andato a Roma la settimana scorsa.', ar: 'ذهبتُ إلى روما الأسبوع الماضي.' },
        ],
        difficulty: 'Intermedio',
        tags: ['Passato', 'Ausiliare', 'B1'],
        favorite: true,
        source: 'ai',
        createdAt: '2026-07-10',
        dateLearned: '2026-07-10',
      },
      {
        id: 'g_demo_2',
        title: 'Articoli Determinativi',
        arabicTitle: 'أدوات التعريف',
        explanationItalian: 'Gli articoli determinativi indicano persone, animali o cose precise e concordano in genere e numero con il nome.',
        explanationArabic: 'أدوات التعريف تشير إلى أشخاص أو حيوانات أو أشياء محددة وتتطابق في الجنس والعدد مع الاسم.',
        examples: [
          { it: "Il ragazzo studia l'italiano.", ar: 'الولد يدرس الإيطالية.' },
          { it: 'La casa è bella e spaziosa.',   ar: 'البيت جميل وواسع.' },
        ],
        difficulty: 'Principiante',
        tags: ['Articoli', 'Nomi', 'A1'],
        favorite: false,
        source: 'ai',
        createdAt: '2026-07-11',
        dateLearned: '2026-07-11',
      },
      {
        id: 'g_demo_3',
        title: 'Uso del Condizionale Presente',
        arabicTitle: 'صيغة الشرط / التمني',
        explanationItalian: 'Si usa il condizionale per esprimere desideri, richieste cortesi, dubbi o opinioni personali nel presente.',
        explanationArabic: 'يستخدم صيغة الشرط الحاضر للتعبير عن رغبات، طلبات مهذبة، شكوك، أو آراء شخصية في الوقت الحالي.',
        examples: [
          { it: 'Mi piacerebbe visitare Firenze.', ar: 'أود أن أزور فلورنسا.' },
          { it: 'Vorrei un caffè per favore.',     ar: 'أريد قهوة من فضلك.' },
        ],
        difficulty: 'Avanzato',
        tags: ['Condizionale', 'Desideri', 'B2'],
        favorite: false,
        source: 'manual',
        createdAt: '2026-07-12',
        dateLearned: '2026-07-12',
      },
    ];

    const demoVocab = [
      {
        id: 'v_demo_1',
        italianWord: 'Buongiorno',
        arabicTranslation: 'صباح الخير / يوم سعيد',
        pronunciation: 'بون-جور-نو',
        partOfSpeech: 'Interiezione',
        example: 'Buongiorno, come stai oggi?',
        arabicExample: 'صباح الخير، كيف حالك اليوم؟',
        notes: 'Saluto formale per la mattina.',
        favorite: true,
        source: 'ai',
        dateAdded: '2026-07-09',
      },
      {
        id: 'v_demo_2',
        italianWord: 'Meraviglioso',
        arabicTranslation: 'رائع / مذهل',
        pronunciation: 'مي-را-في-ليو-زو',
        partOfSpeech: 'Aggettivo',
        example: 'Il Colosseo è un monumento meraviglioso.',
        arabicExample: 'الكولوسيوم معلم رائع.',
        notes: '',
        favorite: true,
        source: 'ai',
        dateAdded: '2026-07-10',
      },
      {
        id: 'v_demo_3',
        italianWord: 'Imparare',
        arabicTranslation: 'يتعلم',
        pronunciation: 'إم-با-را-ري',
        partOfSpeech: 'Verbo',
        example: "Voglio imparare l'italiano per viaggiare.",
        arabicExample: 'أريد تعلم الإيطالية للسفر.',
        notes: 'Verbo regolare della prima coniugazione (-are).',
        favorite: false,
        source: 'manual',
        dateAdded: '2026-07-11',
        verbData: {
          infinitive: 'imparare',
          meaning: 'يتعلم',
          presentTense: 'io imparo, tu impari, lui/lei impara, noi impariamo, voi imparate, loro imparano',
          pastTense: 'ho imparato',
          future: 'imparerò',
          imperative: 'impara! (tu)',
          pastParticiple: 'imparato',
          reflexive: false,
          auxiliary: 'Avere',
          conjugationNotes: 'Verbo regolare della 1ª coniugazione.',
          irregular: false,
          examples: [
            { it: "Sto imparando l'italiano ogni giorno.", ar: 'أتعلم الإيطالية كل يوم.' },
          ],
        },
      },
      {
        id: 'v_demo_4',
        italianWord: 'Biblioteca',
        arabicTranslation: 'مكتبة',
        pronunciation: 'بي-بليو-تي-كا',
        partOfSpeech: 'Sostantivo',
        example: 'Studio in biblioteca ogni pomeriggio.',
        arabicExample: 'أدرس في المكتبة كل بعد ظهر.',
        notes: 'Sostantivo femminile.',
        favorite: false,
        source: 'ai',
        dateAdded: '2026-07-12',
      },
      {
        id: 'v_demo_5',
        italianWord: 'Andare',
        arabicTranslation: 'يذهب',
        pronunciation: 'آن-دا-ري',
        partOfSpeech: 'Verbo',
        example: 'Vado a scuola ogni mattina.',
        arabicExample: 'أذهب إلى المدرسة كل صباح.',
        notes: 'Verbo irregolare molto comune.',
        favorite: true,
        source: 'manual',
        dateAdded: '2026-07-13',
        verbData: {
          infinitive: 'andare',
          meaning: 'يذهب / يسير',
          presentTense: 'io vado, tu vai, lui/lei va, noi andiamo, voi andate, loro vanno',
          pastTense: 'sono andato/a',
          future: 'andrò',
          imperative: 'vai! / va\'! (tu)',
          pastParticiple: 'andato',
          reflexive: false,
          auxiliary: 'Essere',
          conjugationNotes: 'Verbo irregolare. Al passato prossimo usa essere come ausiliare.',
          irregular: true,
          examples: [
            { it: 'Dove vai questo weekend?', ar: 'أين ستذهب هذا الأسبوع؟' },
            { it: 'Siamo andati al mare.',    ar: 'ذهبنا إلى البحر.' },
          ],
        },
      },
    ];

    // Write via service so dedup logic runs
    updateGrammarStorage(user.id, demoGrammar);
    setGrammarList(demoGrammar);
    saveUserData(user.id, 'vocabulary', demoVocab);
    setVocabularyList(demoVocab);

    const now = new Date().toISOString().split('T')[0];
    setStats(prev => {
      const updated = {
        ...prev,
        wordsLearnedCount:   demoVocab.length,
        grammarLearnedCount: demoGrammar.length,
        achievements: prev.achievements.map(a => {
          if (a.unlocked) return a;
          if (['2', '3', '5'].includes(a.id)) return { ...a, unlocked: true, date: now };
          return a;
        }),
      };
      saveUserData(user.id, 'stats', updated);
      return updated;
    });
  }, [user?.id]);

  // ── Clear all ─────────────────────────────────────────────────────────────

  const clearAllData = useCallback(() => {
    if (!user?.id) return;
    updateGrammarStorage(user.id, []);
    saveUserData(user.id, 'vocabulary', []);
    setGrammarList([]);
    setVocabularyList([]);
    const reset = { ...DEFAULT_STATS };
    setStats(reset);
    saveUserData(user.id, 'stats', reset);
  }, [user?.id]);

  // ── Derived counters (memoised for Sidebar / Dashboard) ──────────────────

  const favoritesCount = grammarList.filter(g => g.favorite).length
                       + vocabularyList.filter(v => v.favorite).length;

  const verbCount = vocabularyList.filter(v => v.partOfSpeech === 'Verbo').length;

  // ── Context value ─────────────────────────────────────────────────────────

  return (
    <LearningContext.Provider
      value={{
        // Lists
        grammarList,
        vocabularyList,

        // Grammar CRUD
        addGrammarItem,        // ← used by Chat (AI saves)
        createGrammarItem,     // ← used by GrammarFormModal (manual)
        updateGrammarItem,
        deleteGrammarItem,
        toggleFavoriteGrammar,

        // Vocabulary CRUD
        addVocabularyItem,     // ← used by Chat (AI saves)
        createVocabularyItem,  // ← used by VocabularyFormModal (manual)
        updateVocabularyItem,
        deleteVocabularyItem,
        toggleFavoriteVocabulary,

        // Stats & misc
        stats,
        favoritesCount,
        verbCount,
        incrementConversations,
        seedDemoData,
        clearAllData,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const ctx = useContext(LearningContext);
  if (!ctx) throw new Error("useLearning deve essere usato dentro LearningProvider");
  return ctx;
};
