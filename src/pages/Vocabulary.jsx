import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import VocabularyFormModal from '../components/VocabularyFormModal';
import {
  FiSearch, FiHeart, FiCalendar, FiBookmark, FiVolume2,
  FiDownload, FiTrash2, FiEdit2, FiPlus, FiChevronDown, FiChevronUp,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// ── helpers ───────────────────────────────────────────────────────────────────

const POS_COLOR = {
  Verbo:       'green',
  Sostantivo:  'navy',
  Aggettivo:   'red',
  Avverbio:    'gold',
  Espressione: 'gold',
  Interiezione:'gold',
};
const getPosColor = (pos) => POS_COLOR[pos] ?? 'navy';

function speakWord(word) {
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'it-IT';
    window.speechSynthesis.speak(u);
  }
}

// ── DeleteConfirm ─────────────────────────────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className="flex items-center gap-2 bg-brand-red/8 border border-brand-red/20 rounded-xl px-3 py-2">
      <span className="text-[11px] text-brand-red font-semibold">Eliminare?</span>
      <button onClick={onConfirm} className="text-[11px] bg-brand-red text-white px-2.5 py-1 rounded-lg font-bold hover:bg-[#b02222] transition-colors cursor-pointer">Sì</button>
      <button onClick={onCancel}  className="text-[11px] text-brand-navy/60 hover:text-brand-navy px-1.5 py-1 cursor-pointer font-semibold">No</button>
    </div>
  );
}

// ── VerbConjugationPanel ──────────────────────────────────────────────────────

function VerbConjugationPanel({ verbData }) {
  const [open, setOpen] = useState(false);
  if (!verbData) return null;

  const rows = [
    { label: 'Presente',           value: verbData.presentTense },
    { label: 'Passato Prossimo',   value: verbData.pastTense },
    { label: 'Futuro',             value: verbData.future },
    { label: 'Imperativo',         value: verbData.imperative },
    { label: 'Participio Passato', value: verbData.pastParticiple },
  ].filter(r => r.value);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-[11px] font-bold text-brand-green hover:text-[#097b46] transition-colors cursor-pointer"
      >
        {open ? <FiChevronUp size={13} /> : <FiChevronDown size={13} />}
        {open ? 'Nascondi coniugazione' : 'Mostra coniugazione'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-3 bg-brand-green/5 border border-brand-green/15 rounded-xl space-y-2">
              {/* Metadata badges */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                <Badge variant="green" size="sm">Aus: {verbData.auxiliary}</Badge>
                {verbData.irregular && <Badge variant="red" size="sm">Irregolare</Badge>}
                {verbData.reflexive && <Badge variant="navy" size="sm">Riflessivo</Badge>}
              </div>

              {rows.map(({ label, value }) => (
                <div key={label} className="grid grid-cols-[110px_1fr] gap-2 text-xs">
                  <span className="font-bold text-brand-navy/60 shrink-0">{label}:</span>
                  <span className="text-brand-navy">{value}</span>
                </div>
              ))}

              {verbData.conjugationNotes && (
                <p className="text-[11px] text-brand-textSecondary/70 italic border-t border-brand-green/10 pt-2 mt-1">
                  {verbData.conjugationNotes}
                </p>
              )}

              {verbData.examples?.filter(e => e.it).map((ex, i) => (
                <div key={i} className="text-xs space-y-0.5 border-t border-brand-green/10 pt-2">
                  <p className="text-brand-navy font-medium">🇮🇹 {ex.it}</p>
                  {ex.ar && <p className="text-brand-textSecondary/80" dir="rtl">🇪🇬 {ex.ar}</p>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── VocabCard ─────────────────────────────────────────────────────────────────

function VocabCard({ item, onFavorite, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isVerb = item.partOfSpeech === 'Verbo';

  return (
    <motion.div layout key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
      <Card className="h-full flex flex-col justify-between p-6 border-brand-border/80 hover:shadow-premiumHover hover:-translate-y-0.5 transition-all">

        {/* Header */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant={getPosColor(item.partOfSpeech)} size="sm">{item.partOfSpeech}</Badge>
              {item.source === 'manual' && <Badge variant="gold" size="sm">✏️ Manuale</Badge>}
              {isVerb && item.verbData?.irregular && <Badge variant="red" size="sm">Irreg.</Badge>}
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => onFavorite(item.id)}
                className={`p-1.5 rounded-full hover:bg-brand-red/5 transition-colors cursor-pointer ${item.favorite ? 'text-brand-red' : 'text-brand-navy/30'}`}
                aria-label="Preferito"
              >
                <FiHeart size={16} className={item.favorite ? 'fill-current' : ''} />
              </button>
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 rounded-full hover:bg-brand-navy/5 text-brand-navy/35 hover:text-brand-navy transition-colors cursor-pointer"
                aria-label="Modifica"
              >
                <FiEdit2 size={14} />
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-full hover:bg-brand-red/5 text-brand-navy/30 hover:text-brand-red transition-colors cursor-pointer"
                aria-label="Elimina"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>

          {/* Word + TTS */}
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-xl font-bold text-brand-navy">{item.italianWord}</h3>
            <button
              onClick={() => speakWord(item.italianWord)}
              className="text-brand-green hover:text-[#097b46] p-1.5 rounded-full hover:bg-brand-navy/5 transition-colors cursor-pointer"
              title="Ascolta pronuncia"
            >
              <FiVolume2 size={16} />
            </button>
          </div>

          {item.pronunciation && (
            <p className="text-[11px] text-brand-textSecondary/60 italic font-medium">
              /{item.pronunciation}/
            </p>
          )}
        </div>

        {/* Body */}
        <div className="space-y-3 py-3 flex-grow border-y border-brand-border/60 my-3">
          <div className="text-right" dir="rtl">
            <span className="text-[9px] uppercase font-bold text-brand-red tracking-wider">الترجمة</span>
            <p className="text-sm font-semibold text-brand-navy font-sans mt-0.5">{item.arabicTranslation}</p>
          </div>

          {item.example && (
            <div>
              <span className="text-[9px] uppercase font-bold text-brand-navy/55 tracking-wider">Esempio</span>
              <p className="text-xs text-brand-textSecondary italic mt-0.5 leading-relaxed">"{item.example}"</p>
            </div>
          )}

          {item.arabicExample && (
            <div className="text-right" dir="rtl">
              <p className="text-[11px] text-brand-textSecondary/70 italic font-sans">"{item.arabicExample}"</p>
            </div>
          )}

          {item.notes && (
            <p className="text-[11px] text-brand-textSecondary/60 bg-brand-cream/60 rounded-lg px-2.5 py-1.5">{item.notes}</p>
          )}

          {/* Verb conjugation expandable panel */}
          {isVerb && <VerbConjugationPanel verbData={item.verbData} />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1.5 text-[10px] text-brand-textSecondary/50 font-semibold">
            <FiCalendar size={11} />
            <span>{item.dateAdded}</span>
          </div>
          {confirmDelete && (
            <DeleteConfirm
              onConfirm={() => { onDelete(item.id); setConfirmDelete(false); }}
              onCancel={() => setConfirmDelete(false)}
            />
          )}
        </div>

      </Card>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const Vocabulary = () => {
  const {
    vocabularyList,
    toggleFavoriteVocabulary,
    createVocabularyItem,
    updateVocabularyItem,
    deleteVocabularyItem,
    seedDemoData,
    clearAllData,
  } = useLearning();

  const [searchQuery,    setSearchQuery]    = useState('');
  const [posFilter,      setPosFilter]      = useState('all');
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [sortBy,         setSortBy]         = useState('newest');

  // Modal state
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const openAdd  = ()     => { setEditingItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setModalOpen(true); };
  const closeModal = ()   => { setModalOpen(false);  setEditingItem(null); };

  const handleSave = (fields) => {
    if (editingItem) return updateVocabularyItem(editingItem.id, fields);
    return createVocabularyItem(fields);
  };

  // Filter + sort
  const filteredList = vocabularyList
    .filter(item => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.italianWord.toLowerCase().includes(q) ||
        item.arabicTranslation.toLowerCase().includes(q) ||
        (item.pronunciation || '').toLowerCase().includes(q) ||
        (item.example || '').toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q);
      const matchPos = posFilter === 'all' || item.partOfSpeech === posFilter;
      const matchFav = !favoriteFilter || item.favorite;
      return matchSearch && matchPos && matchFav;
    })
    .sort((a, b) => {
      if (sortBy === 'newest')       return new Date(b.dateAdded) - new Date(a.dateAdded);
      if (sortBy === 'alphabetical') return a.italianWord.localeCompare(b.italianWord);
      return 0;
    });

  const selectCls = 'w-full px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-brand-navy';

  return (
    <div className="bg-brand-cream min-h-screen font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">

        {/* Page header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-brand-border">
          <div>
            <h1 className="font-serif text-3xl font-bold text-brand-navy">Vocabolario Personale</h1>
            <p className="text-xs text-brand-textSecondary mt-1">
              Il tuo dizionario italiano — dall'IA e aggiunto da te, compresi i verbi con coniugazione.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {vocabularyList.length === 0 ? (
              <Button variant="outline" size="sm" onClick={seedDemoData} className="space-x-1.5">
                <FiDownload size={14} /><span>Carica Demo</span>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={clearAllData} className="text-brand-red hover:bg-brand-red/5 space-x-1.5">
                <FiTrash2 size={14} /><span>Cancella Tutto</span>
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={openAdd} className="space-x-1.5">
              <FiPlus size={14} /><span>Aggiungi Parola</span>
            </Button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="grid md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cerca parole, traduzioni, note... / ابحث"
              className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-brand-navy"
            />
          </div>
          <div className="md:col-span-3">
            <select value={posFilter} onChange={e => setPosFilter(e.target.value)} className={selectCls}>
              <option value="all">Tutte le parti del discorso</option>
              <option value="Verbo">Verbi 🔵</option>
              <option value="Sostantivo">Sostantivi</option>
              <option value="Aggettivo">Aggettivi</option>
              <option value="Avverbio">Avverbi</option>
              <option value="Espressione">Espressioni</option>
              <option value="Interiezione">Interiezioni</option>
              <option value="Altro">Altro</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectCls}>
              <option value="newest">Più recenti</option>
              <option value="alphabetical">Alfabetico</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-start md:justify-end">
            <button
              onClick={() => setFavoriteFilter(f => !f)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm transition-all cursor-pointer ${
                favoriteFilter ? 'bg-brand-red/10 border-brand-red/20 text-brand-red font-semibold' : 'bg-brand-surface border-brand-border text-brand-navy hover:bg-brand-navy/5'
              }`}
            >
              <FiHeart className={favoriteFilter ? 'fill-current' : ''} size={15} />
              <span>Preferiti</span>
            </button>
          </div>
        </div>

        {/* Cards / empty state */}
        <AnimatePresence mode="popLayout">
          {filteredList.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Card className="p-12 text-center rounded-3xl border-dashed border-2 border-brand-border max-w-2xl mx-auto flex flex-col items-center space-y-5 bg-brand-surface">
                <div className="p-4 bg-brand-navy/5 text-brand-navy rounded-full"><FiBookmark size={36} /></div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-brand-navy">Vocabolario vuoto</h3>
                  <p className="text-xs text-brand-textSecondary max-w-sm mx-auto">
                    Aggiungi parole manualmente oppure salvale dalla chat con il tutor IA.
                  </p>
                  <p className="text-[11px] text-brand-textSecondary/60 italic text-center max-w-sm mx-auto" dir="rtl">
                    أضف الكلمات يدوياً أو احفظها من المحادثة مع المعلم.
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center pt-2">
                  <Button variant="primary" onClick={openAdd} className="space-x-1.5">
                    <FiPlus size={14} /><span>Prima Parola</span>
                  </Button>
                  <Button variant="outline" onClick={seedDemoData}>Carica Demo</Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredList.map(item => (
                <VocabCard
                  key={item.id}
                  item={item}
                  onFavorite={toggleFavoriteVocabulary}
                  onEdit={openEdit}
                  onDelete={deleteVocabularyItem}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Add button */}
      {vocabularyList.length > 0 && (
        <button
          onClick={openAdd}
          className="fixed bottom-8 right-8 w-14 h-14 bg-brand-green hover:bg-[#097b46] text-white rounded-full shadow-premiumHover flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-40"
          aria-label="Aggiungi parola al vocabolario"
          title="Aggiungi Parola"
        >
          <FiPlus size={24} />
        </button>
      )}

      {/* Modal */}
      <VocabularyFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initial={editingItem}
      />
    </div>
  );
};

export default Vocabulary;
