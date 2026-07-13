/**
 * Utility for automatic grammar rule extraction and user-isolated storage.
 * All functions are encapsulated here to comply with DRY, SOLID, and KISS principles.
 */

/**
 * Generates a deterministic hash from a string to use as a stable id.
 */
function hashString(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Automatically extracts a grammar rule from the AI response (JSON or plain text).
 * Returns a formatted grammar object, or null if no grammar rule is found.
 * 
 * @param {string|object} aiResponse
 * @returns {object|null}
 */
export function extractGrammar(aiResponse) {
  if (!aiResponse) return null;

  try {
    let parsed = aiResponse;
    if (typeof aiResponse === 'string') {
      // Try to parse JSON from the response
      parsed = JSON.parse(aiResponse);
    }

    // Standard path: Extracted grammar is already part of the structured JSON response
    if (parsed && parsed.extractedGrammar && parsed.extractedGrammar.title) {
      const eg = parsed.extractedGrammar;
      const title = eg.title.trim();
      const id = `grammar_${hashString(title)}`;

      // Generate a descriptive Arabic title from description/explanation or rules
      let arabicTitle = '';
      if (title.toLowerCase().includes('essere')) {
        arabicTitle = 'فعل Essere (يكون)';
      } else if (title.toLowerCase().includes('avere')) {
        arabicTitle = 'فعل Avere (يملك)';
      } else if (title.toLowerCase().includes('articolo') || title.toLowerCase().includes('articoli')) {
        arabicTitle = 'أدوات التعريف والتنكير';
      } else if (title.toLowerCase().includes('preposizion')) {
        arabicTitle = 'حروف الجر الإيطالية';
      } else if (title.toLowerCase().includes('condizionale')) {
        arabicTitle = 'صيغة الشرط / التمني';
      } else if (title.toLowerCase().includes('passato')) {
        arabicTitle = 'زمن الماضي القريب';
      } else if (title.toLowerCase().includes('presente')) {
        arabicTitle = 'زمن المضارع البسيط';
      } else if (eg.arabicExplanation) {
        // Fallback to first part of explanation or general translation
        const cleanExplanation = eg.arabicExplanation.split(/[.،:]/)[0].trim();
        arabicTitle = cleanExplanation.length < 35 ? cleanExplanation : title;
      } else {
        arabicTitle = title;
      }

      return {
        id,
        title: title,
        arabicTitle: arabicTitle,
        italianName: title,
        explanationItalian: eg.italianExplanation || '',
        explanationArabic: eg.arabicExplanation || '',
        examples: eg.examples || [],
        difficulty: eg.difficulty || 'Principiante', // Keep metadata for sorting / filtering compatibility
        createdAt: new Date().toISOString().split('T')[0]
      };
    }
  } catch (e) {
    // Ignore and proceed to text analysis fallback
  }

  // Fallback path: Plain-text search/regex analysis of the response for grammar topics
  const text = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);
  const textLower = text.toLowerCase();

  // Search for the verb "Essere" (matches irregular verbs / explanations)
  if (textLower.includes('essere') && (textLower.includes('verbo') || textLower.includes('conjugation') || textLower.includes('coniugazione'))) {
    return {
      id: `grammar_${hashString('Verb Essere')}`,
      title: 'Verb Essere',
      arabicTitle: 'فعل Essere (يكون)',
      italianName: 'Verb Essere',
      explanationItalian: 'Il verbo "essere" (to be) è un verbo ausiliare irregolare essenziale per esprimere identità, stati d\'animo, provenienza e per coniugare i tempi verbali composti.',
      explanationArabic: 'فعل الكينونة "essere" (يكون) هو فعل مساعد غير منتظم (شاذ)، أساسي للتعبير عن الهوية، الحالة، الجنسية، وتصريف الأزمنة المركبة.',
      examples: [
        { it: 'Io sono Ahmed.', ar: 'أنا أحمد.' },
        { it: 'Lei è italiana.', ar: 'هي إيطالية.' }
      ],
      difficulty: 'Principiante',
      createdAt: new Date().toISOString().split('T')[0]
    };
  }

  // Search for the verb "Avere"
  if (textLower.includes('avere') && (textLower.includes('verbo') || textLower.includes('conjugation') || textLower.includes('coniugazione'))) {
    return {
      id: `grammar_${hashString('Verb Avere')}`,
      title: 'Verb Avere',
      arabicTitle: 'فعل Avere (يملك)',
      italianName: 'Verb Avere',
      explanationItalian: 'Il verbo "avere" (to have) è un verbo irregolare impiegato per esprimere possesso, sensazioni fisiche e come ausiliare nei tempi composti.',
      explanationArabic: 'فعل الملكية "avere" (يملك) هو فعل غير منتظم (شاذ) يستخدم للتعبير عن الملكية، المشاعر الجسدية، وكفعل مساعد في الأزمنة المركبة.',
      examples: [
        { it: 'Io ho fame.', ar: 'أنا جائع (لدي جوع).' },
        { it: 'Noi abbiamo una casa.', ar: 'لدينا منزل.' }
      ],
      difficulty: 'Principiante',
      createdAt: new Date().toISOString().split('T')[0]
    };
  }

  return null;
}

/**
 * Loads all grammar rules for a specific student from user-isolated storage.
 * 
 * @param {string} userId
 * @returns {Array}
 */
export function loadGrammar(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`grammar_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load grammar from localStorage", e);
    return [];
  }
}

/**
 * Checks if a grammar rule already exists in the user's list.
 * 
 * @param {string} userId
 * @param {string} idOrTitle
 * @returns {boolean}
 */
export function isGrammarExists(userId, idOrTitle) {
  if (!userId || !idOrTitle) return false;
  const currentList = loadGrammar(userId);
  const term = idOrTitle.trim().toLowerCase();
  return currentList.some(item => 
    item.id.toLowerCase() === term || 
    item.title.toLowerCase() === term
  );
}

/**
 * Updates the user-isolated localStorage array.
 * 
 * @param {string} userId
 * @param {Array} list
 */
export function updateGrammarStorage(userId, list) {
  if (!userId) return;
  try {
    localStorage.setItem(`grammar_${userId}`, JSON.stringify(list));
    // Trigger custom window event to sync hook/context state React-wide
    window.dispatchEvent(new CustomEvent('idi_grammar_change', { detail: { userId } }));
  } catch (e) {
    console.error("Failed to save grammar to localStorage", e);
  }
}

/**
 * Saves a grammar rule to the student's isolated storage if it doesn't already exist.
 * 
 * @param {string} userId
 * @param {object} grammarItem
 * @returns {boolean} True if successfully added, false if duplicate or invalid.
 */
export function saveGrammar(userId, grammarItem) {
  if (!userId || !grammarItem || !grammarItem.title) return false;

  // Prevent duplicates using title or id
  if (isGrammarExists(userId, grammarItem.id) || isGrammarExists(userId, grammarItem.title)) {
    return false;
  }

  const currentList = loadGrammar(userId);
  const updatedList = [grammarItem, ...currentList];
  updateGrammarStorage(userId, updatedList);
  return true;
}
