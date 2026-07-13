import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { loadUserData, saveUserData } from '../services/storage';
import { loadGrammar, updateGrammarStorage } from '../utils/extractGrammar';

const LearningContext = createContext(null);

// Default empty stats template for new users
const DEFAULT_STATS = {
  wordsLearnedCount: 0,
  grammarLearnedCount: 0,
  conversationsCount: 0,
  learningDays: 1,
  achievements: [
    { id: '1', title: 'Primo Incontro', desc: 'Hai avviato la tua prima chat con l\'IA', date: '', unlocked: false },
    { id: '2', title: 'Esploratore', desc: 'Aggiunto il primo vocabolo al dizionario', date: '', unlocked: false },
    { id: '3', title: 'Grammatico', desc: 'Salvato la prima regola grammaticale', date: '', unlocked: false },
    { id: '4', title: 'Cicerone', desc: 'Completato 5 conversazioni lunghe', date: '', unlocked: false },
  ],
};

export const LearningProvider = ({ children }) => {
  const { user } = useAuth();

  const [grammarList, setGrammarList] = useState([]);
  const [vocabularyList, setVocabularyList] = useState([]);
  const [stats, setStats] = useState({ ...DEFAULT_STATS });

  // Re-load user-specific data whenever the logged-in user changes
  const loadAllUserData = useCallback(() => {
    if (!user?.id) {
      setGrammarList([]);
      setVocabularyList([]);
      setStats({ ...DEFAULT_STATS });
      return;
    }

    const storedGrammar = loadGrammar(user.id);
    const storedVocab = loadUserData(user.id, 'vocabulary');
    const storedStats = loadUserData(user.id, 'stats');

    setGrammarList(storedGrammar || []);
    setVocabularyList(storedVocab || []);
    setStats(storedStats || { ...DEFAULT_STATS });
  }, [user?.id]);

  useEffect(() => {
    loadAllUserData();
  }, [loadAllUserData]);

  // Listen to cross-context/window changes to keep learning context synced instantly
  useEffect(() => {
    const handleEventChange = (e) => {
      if (e.detail && e.detail.userId === user?.id) {
        const storedGrammar = loadGrammar(user.id);
        setGrammarList(storedGrammar || []);
        setStats(prev => {
          const updatedStats = { ...prev, grammarLearnedCount: (storedGrammar || []).length };
          return updatedStats;
        });
      }
    };

    window.addEventListener('idi_grammar_change', handleEventChange);
    return () => {
      window.removeEventListener('idi_grammar_change', handleEventChange);
    };
  }, [user?.id]);

  // Sync grammar to user-scoped localStorage
  const saveGrammar = useCallback((list) => {
    if (!user?.id) return;
    setGrammarList(list);
    updateGrammarStorage(user.id, list);

    // Update stats count
    setStats(prev => {
      const updatedStats = { ...prev, grammarLearnedCount: list.length };
      // Unlock grammatico achievement
      if (list.length > 0) {
        updatedStats.achievements = updatedStats.achievements.map(a =>
          a.id === '3' ? { ...a, unlocked: true, date: a.date || new Date().toISOString().split('T')[0] } : a
        );
      }
      saveUserData(user.id, 'stats', updatedStats);
      return updatedStats;
    });
  }, [user?.id]);

  // Sync vocabulary to user-scoped localStorage
  const saveVocabulary = useCallback((list) => {
    if (!user?.id) return;
    setVocabularyList(list);
    saveUserData(user.id, 'vocabulary', list);

    // Update stats count
    setStats(prev => {
      const updatedStats = { ...prev, wordsLearnedCount: list.length };
      // Unlock esploratore achievement
      if (list.length > 0) {
        updatedStats.achievements = updatedStats.achievements.map(a =>
          a.id === '2' ? { ...a, unlocked: true, date: a.date || new Date().toISOString().split('T')[0] } : a
        );
      }
      saveUserData(user.id, 'stats', updatedStats);
      return updatedStats;
    });
  }, [user?.id]);

  const toggleFavoriteGrammar = (id) => {
    const updated = grammarList.map(item =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    );
    saveGrammar(updated);
  };

  const toggleFavoriteVocabulary = (id) => {
    const updated = vocabularyList.map(item =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    );
    saveVocabulary(updated);
  };

  const addGrammarItem = (item) => {
    // Avoid duplicate grammar rules by title
    const exists = grammarList.some(g => g.title === item.title);
    if (exists) return;

    const newItem = {
      id: `grammar_${Date.now()}`,
      favorite: false,
      dateLearned: new Date().toISOString().split('T')[0],
      ...item
    };
    saveGrammar([newItem, ...grammarList]);
  };

  const addVocabularyItem = (item) => {
    // Avoid duplicate vocabulary by Italian word
    const exists = vocabularyList.some(v => v.italianWord === item.italianWord);
    if (exists) return;

    const newItem = {
      id: `vocab_${Date.now()}`,
      favorite: false,
      dateAdded: new Date().toISOString().split('T')[0],
      ...item
    };
    saveVocabulary([newItem, ...vocabularyList]);
  };

  const incrementConversations = () => {
    if (!user?.id) return;
    setStats(prev => {
      const updatedStats = { ...prev, conversationsCount: prev.conversationsCount + 1 };
      if (updatedStats.conversationsCount >= 5) {
        updatedStats.achievements = updatedStats.achievements.map(a =>
          a.id === '4' ? { ...a, unlocked: true, date: a.date || new Date().toISOString().split('T')[0] } : a
        );
      }
      saveUserData(user.id, 'stats', updatedStats);
      return updatedStats;
    });
  };

  // Seeding method to let users quickly explore the design
  const seedDemoData = () => {
    if (!user?.id) return;

    const demoGrammar = [
      {
        id: 'g_1',
        title: 'Passato Prossimo con Essere o Avere',
        italianExplanation: 'Il passato prossimo si forma con l\'ausiliare essere o avere al presente indicativo e il participio passato del verbo.',
        arabicExplanation: 'يتكون الماضي القريب (Passato Prossimo) باستخدام الفعل المساعد essere (يكون) o avere (يملك) في المضارع مع اسم المفعول من الفعل الأساسي.',
        examples: [
          { it: 'Ho mangiato una pizza deliziosa.', ar: 'أكلتُ بيتزا لذيذة.' },
          { it: 'Sono andato a Roma la settimana scorsa.', ar: 'ذهبتُ إلى روما الأسبوع الماضي.' }
        ],
        difficulty: 'Intermedio',
        dateLearned: '2026-07-10',
        favorite: true
      },
      {
        id: 'g_2',
        title: 'Articoli Determinativi',
        italianExplanation: 'Gli articoli determinativi indicano persone, animali o cose precise e concordano in genere e numero con il nome.',
        arabicExplanation: 'أدوات التعريف تشير إلى أشخاص أو حيوانات أو أشياء محددة وتتطابق في الجنس (مذكر/مؤنث) والعدد (مفرد/جمع) مع الاسم.',
        examples: [
          { it: 'Il ragazzo studia l\'italiano.', ar: 'الولد يدرس الإيطالية.' },
          { it: 'La casa è bella e spaziosa.', ar: 'البيت جميل وواسع.' }
        ],
        difficulty: 'Principiante',
        dateLearned: '2026-07-11',
        favorite: false
      },
      {
        id: 'g_3',
        title: 'Uso del Condizionale Presente',
        italianExplanation: 'Si usa il condizionale per esprimere desideri, richieste cortesi, dubbi o opinioni personali nel presente.',
        arabicExplanation: 'يستخدم صيغة الشرط الحاضر (Condizionale Presente) للتعبير عن رغبات، طلبات مهذبة، شكوك، أو آراء شخصية في الوقت الحالي.',
        examples: [
          { it: 'Mi piacerebbe visitare Firenze.', ar: 'أود أن أزور فلورنسا.' },
          { it: 'Vorrei un caffè per favore.', ar: 'أريد قهوة من فضلك.' }
        ],
        difficulty: 'Avanzato',
        dateLearned: '2026-07-12',
        favorite: false
      }
    ];

    const demoVocab = [
      {
        id: 'v_1',
        italianWord: 'Buongiorno',
        arabicTranslation: 'صباح الخير / يوم سعيد',
        pronunciation: 'بون-جور-نو',
        example: 'Buongiorno, come stai oggi?',
        partOfSpeech: 'Interiezione',
        dateAdded: '2026-07-09',
        favorite: true
      },
      {
        id: 'v_2',
        italianWord: 'Meraviglioso',
        arabicTranslation: 'رائع / مذهل',
        pronunciation: 'مي-را-في-ليو-زو',
        example: 'Il Colosseo è un monumento meraviglioso.',
        partOfSpeech: 'Aggettivo',
        dateAdded: '2026-07-10',
        favorite: true
      },
      {
        id: 'v_3',
        italianWord: 'Imparare',
        arabicTranslation: 'يتعلم',
        pronunciation: 'إم-با-را-ري',
        example: 'Voglio imparare l\'italiano per viaggiare.',
        partOfSpeech: 'Verbo',
        dateAdded: '2026-07-11',
        favorite: false
      },
      {
        id: 'v_4',
        italianWord: 'Biblioteca',
        arabicTranslation: 'مكتبة',
        pronunciation: 'بي-بليو-تي-كا',
        example: 'Studio in biblioteca ogni pomeriggio.',
        partOfSpeech: 'Sostantivo',
        dateAdded: '2026-07-12',
        favorite: false
      }
    ];

    saveGrammar(demoGrammar);
    saveVocabulary(demoVocab);

    setStats(prev => {
      const updatedStats = {
        ...prev,
        wordsLearnedCount: demoVocab.length,
        grammarLearnedCount: demoGrammar.length,
        achievements: prev.achievements.map(a =>
          a.id === '2' || a.id === '3'
            ? { ...a, unlocked: true, date: new Date().toISOString().split('T')[0] }
            : a
        )
      };
      if (user?.id) saveUserData(user.id, 'stats', updatedStats);
      return updatedStats;
    });
  };

  const clearAllData = () => {
    if (!user?.id) return;

    setGrammarList([]);
    setVocabularyList([]);
    updateGrammarStorage(user.id, []);
    saveUserData(user.id, 'vocabulary', []);

    const resetStats = { ...DEFAULT_STATS };
    setStats(resetStats);
    saveUserData(user.id, 'stats', resetStats);
  };

  return (
    <LearningContext.Provider
      value={{
        grammarList,
        vocabularyList,
        stats,
        toggleFavoriteGrammar,
        toggleFavoriteVocabulary,
        addGrammarItem,
        addVocabularyItem,
        incrementConversations,
        seedDemoData,
        clearAllData
      }}
    >
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning deve essere utilizzato all\'interno di un LearningProvider');
  }
  return context;
};
