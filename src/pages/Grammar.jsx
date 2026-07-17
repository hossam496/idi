import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import GrammarFormModal from '../components/GrammarFormModal';
import { FiSearch, FiHeart, FiBookOpen, FiTrash2, FiEdit2, FiPlus, FiCalendar, FiTag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// ── helpers ───────────────────────────────────────────────────────────────────

const DIFFICULTY_COLOR = {
  Principiante: 'green',
  Intermedio:   'navy',
  Avanzato:     'red',
};
const getDiffColor = (d) => DIFFICULTY_COLOR[d] ?? 'navy';

// ── DeleteConfirm inline ──────────────────────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel }) {
  return (
    <div className="flex items-center gap-2 bg-brand-red/8 border border-brand-red/20 rounded-xl px-3 py-2">
      <span className="text-[11px] text-brand-red font-semibold">Eliminare?</span>
      <button onClick={onConfirm} className="text-[11px] bg-brand-red text-white px-2.5 py-1 rounded-lg font-bold hover:bg-[#b02222] transition-colors cursor-pointer">Sì</button>
      <button onClick={onCancel}  className="text-[11px] text-brand-navy/60 hover:text-brand-navy px-1.5 py-1 cursor-pointer font-semibold">No</button>
    </div>
  );
}

// ── GrammarCard ───────────────────────────────────────────────────────────────

function GrammarCard({ item, onFavorite, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div layout key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
      <Card className="h-full flex flex-col p-6 border-brand-border/80 hover:shadow-premiumHover hover:-translate-y-0.5 transition-all">

        {/* Header row */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getDiffColor(item.difficulty)} size="sm">{item.difficulty}</Badge>
            {item.source === 'manual' && (
              <Badge variant="gold" size="sm">✏️ Manuale</Badge>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {/* Favorite */}
            <button
              onClick={() => onFavorite(item.id)}
              className={`p-1.5 rounded-full hover:bg-brand-red/5 transition-colors cursor-pointer ${item.favorite ? 'text-brand-red' : 'text-brand-navy/30'}`}
              aria-label="Preferito"
            >
              <FiHeart size={16} className={item.favorite ? 'fill-current' : ''} />
            </button>
            {/* Edit */}
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-full hover:bg-brand-navy/5 text-brand-navy/40 hover:text-brand-navy transition-colors cursor-pointer"
              aria-label="Modifica"
            >
              <FiEdit2 size={15} />
            </button>
            {/* Delete */}
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-full hover:bg-brand-red/5 text-brand-navy/30 hover:text-brand-red transition-colors cursor-pointer"
              aria-label="Elimina"
            >
              <FiTrash2 size={15} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg font-bold text-brand-navy leading-snug mb-0.5">
          {item.title}
        </h3>
        {item.arabicTitle && item.arabicTitle !== item.title && (
          <p className="text-xs text-brand-navy/55 font-sans mb-3">({item.arabicTitle})</p>
        )}

        <div className="flex-grow space-y-4 py-2">
          {/* Italian explanation */}
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-green tracking-wider">Spiegazione</span>
            <p className="text-xs text-brand-textSecondary leading-relaxed mt-1">
              {item.explanationItalian || item.italianExplanation}
            </p>
          </div>

          {/* Arabic explanation */}
          <div className="text-right border-r-2 border-brand-red/20 pr-3 py-1">
            <span className="text-[10px] uppercase font-bold text-brand-red tracking-wider">الشرح</span>
            <p className="text-xs text-brand-textSecondary/90 leading-relaxed mt-1 font-sans" dir="rtl">
              {item.explanationArabic || item.arabicExplanation}
            </p>
          </div>

          {/* Examples */}
          {item.examples?.length > 0 && (
            <div className="p-3 bg-brand-cream/50 rounded-xl space-y-2">
              <span className="text-[9px] uppercase font-bold text-brand-navy/50 tracking-wider">Esempi Pratici</span>
              {item.examples.map((ex, i) => (
                <div key={i} className="text-xs space-y-0.5 border-t border-brand-border/40 first:border-none pt-1.5 first:pt-0">
                  <p className="text-brand-navy font-medium">🇮🇹 {ex.it}</p>
                  {ex.ar && <p className="text-brand-textSecondary/80 font-sans" dir="rtl">🇪🇬 {ex.ar}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <FiTag size={11} className="text-brand-navy/30" />
              {item.tags.map((tag, i) => (
                <span key={i} className="text-[10px] bg-brand-navy/5 text-brand-navy/60 px-2 py-0.5 rounded-full font-medium">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Footer: date */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-brand-border/60">
          <div className="flex items-center gap-1.5 text-[10px] text-brand-textSecondary/60">
            <FiCalendar size={11} />
            <span>{item.createdAt || item.dateLearned}</span>
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

const Grammar = () => {
  const {
    grammarList,
    toggleFavoriteGrammar,
    createGrammarItem,
    updateGrammarItem,
    deleteGrammarItem,
    deleteAllGrammarItems,
  } = useLearning();

  const [searchQuery,      setSearchQuery]      = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [favoriteFilter,   setFavoriteFilter]   = useState(false);
  const [sortBy,           setSortBy]           = useState('newest');
  const [deletingAll,      setDeletingAll]      = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);

  // Modal state
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingItem,  setEditingItem]  = useState(null); // null = add mode

  const openAdd  = ()     => { setEditingItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setModalOpen(true); };
  const closeModal = ()   => { setModalOpen(false);  setEditingItem(null); };

  const handleSave = (fields) => {
    if (editingItem) return updateGrammarItem(editingItem.id, fields);
    return createGrammarItem(fields);
  };

  const seedDemoData = async () => {
    const demos = [
      {
        title: 'Presente Indicativo',
        arabicTitle: 'المضارع الإخباري',
        difficulty: 'Principiante',
        explanationItalian: 'Il presente indicativo esprime azioni che accadono ora o abitualmente.',
        explanationArabic: 'يُعبّر عن أفعال تحدث الآن أو بشكل اعتيادي.',
        examples: [
          { it: 'Io mangio la pizza.', ar: 'أنا آكل البيتزا.' },
          { it: 'Lei studia italiano ogni giorno.', ar: 'هي تدرس الإيطالية كل يوم.' },
        ],
        tags: ['verbi', 'presente'],
        source: 'manual',
        favorite: false,
      },
      {
        title: 'Passato Prossimo',
        arabicTitle: 'الماضي القريب',
        difficulty: 'Intermedio',
        explanationItalian: 'Il passato prossimo indica un\'azione completata nel passato recente.',
        explanationArabic: 'يدل على فعل اكتمل في الماضي القريب.',
        examples: [
          { it: 'Ho mangiato la pizza ieri.', ar: 'أكلت البيتزا أمس.' },
          { it: 'Siamo andati al cinema.', ar: 'ذهبنا إلى السينما.' },
        ],
        tags: ['verbi', 'passato'],
        source: 'manual',
        favorite: false,
      },
      {
        title: 'Congiuntivo Presente',
        arabicTitle: 'المضارع الشرطي',
        difficulty: 'Avanzato',
        explanationItalian: 'Il congiuntivo si usa per esprimere dubbio, opinione o desiderio.',
        explanationArabic: 'يُستخدم للتعبير عن الشك أو الرأي أو الرغبة.',
        examples: [
          { it: 'Penso che lui abbia ragione.', ar: 'أعتقد أنه على حق.' },
          { it: 'Voglio che tu venga con me.', ar: 'أريدك أن تأتي معي.' },
        ],
        tags: ['congiuntivo', 'avanzato'],
        source: 'manual',
        favorite: false,
      },
    ];
    for (const demo of demos) {
      await createGrammarItem(demo);
    }
  };

  const handleDeleteAll = async () => {
    setDeletingAll(true);
    await deleteAllGrammarItems();
    setDeletingAll(false);
    setConfirmDeleteAll(false);
  };

  // Filter + sort
  const filteredList = grammarList
    .filter(item => {
      const itExp  = (item.explanationItalian || item.italianExplanation || '').toLowerCase();
      const arExp  = (item.explanationArabic  || item.arabicExplanation  || '').toLowerCase();
      const q      = searchQuery.toLowerCase();
      const matchSearch =
        item.title.toLowerCase().includes(q) ||
        (item.arabicTitle || '').toLowerCase().includes(q) ||
        itExp.includes(q) || arExp.includes(q) ||
        (item.tags || []).some(t => t.toLowerCase().includes(q));

      const matchDiff = difficultyFilter === 'all' || item.difficulty === difficultyFilter;
      const matchFav  = !favoriteFilter || item.favorite;
      return matchSearch && matchDiff && matchFav;
    })
    .sort((a, b) => {
      const dA = new Date(a.createdAt || a.dateLearned || 0);
      const dB = new Date(b.createdAt || b.dateLearned || 0);
      if (sortBy === 'newest')      return dB - dA;
      if (sortBy === 'oldest')      return dA - dB;
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
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
            <h1 className="font-serif text-3xl font-bold text-brand-navy">Archivio Grammaticale</h1>
            <p className="text-xs text-brand-textSecondary mt-1">
              Spiegazioni bilingue ed esempi pratici — dall'IA e aggiunte da te.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {grammarList.length > 0 && (
              confirmDeleteAll ? (
                <div className="flex items-center gap-2 bg-brand-red/8 border border-brand-red/20 rounded-xl px-3 py-2">
                  <span className="text-[11px] text-brand-red font-semibold">Eliminare tutto?</span>
                  <button
                    onClick={handleDeleteAll}
                    disabled={deletingAll}
                    className="text-[11px] bg-brand-red text-white px-2.5 py-1 rounded-lg font-bold hover:bg-[#b02222] transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {deletingAll ? '...' : 'Sì'}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteAll(false)}
                    className="text-[11px] text-brand-navy/60 hover:text-brand-navy px-1.5 py-1 cursor-pointer font-semibold"
                  >
                    No
                  </button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDeleteAll(true)}
                  className="text-brand-red hover:bg-brand-red/5 space-x-1.5"
                >
                  <FiTrash2 size={14} /><span>Cancella Tutto</span>
                </Button>
              )
            )}
            <Button variant="primary" size="sm" onClick={openAdd} className="space-x-1.5">
              <FiPlus size={14} /><span>Aggiungi Regola</span>
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
              placeholder="Cerca regole, spiegazioni, tag... / ابحث"
              className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-brand-navy"
            />
          </div>
          <div className="md:col-span-3">
            <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} className={selectCls}>
              <option value="all">Tutti i livelli</option>
              <option value="Principiante">Principiante (A1–A2)</option>
              <option value="Intermedio">Intermedio (B1–B2)</option>
              <option value="Avanzato">Avanzato (C1–C2)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectCls}>
              <option value="newest">Più recenti</option>
              <option value="oldest">Meno recenti</option>
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

        {/* Cards grid / empty state */}
        <AnimatePresence mode="popLayout">
          {filteredList.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Card className="p-12 text-center rounded-3xl border-dashed border-2 border-brand-border max-w-2xl mx-auto flex flex-col items-center space-y-5 bg-brand-surface">
                <div className="p-4 bg-brand-navy/5 text-brand-navy rounded-full"><FiBookOpen size={36} /></div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-brand-navy">Archivio vuoto</h3>
                  <p className="text-xs text-brand-textSecondary max-w-sm mx-auto">
                    Aggiungi manualmente le tue regole oppure lascia che il tutor IA le estragga durante la chat.
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap justify-center pt-2">
                  <Button variant="primary" onClick={openAdd} className="space-x-1.5">
                    <FiPlus size={14} /><span>Prima Regola</span>
                  </Button>
                  <Button variant="outline" onClick={seedDemoData}>Carica Demo</Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div layout className="grid gap-6 md:grid-cols-2">
              {filteredList.map(item => (
                <GrammarCard
                  key={item.id}
                  item={item}
                  onFavorite={toggleFavoriteGrammar}
                  onEdit={openEdit}
                  onDelete={deleteGrammarItem}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Add button — always visible when list is non-empty */}
      {grammarList.length > 0 && (
        <button
          onClick={openAdd}
          className="fixed bottom-8 right-8 w-14 h-14 bg-brand-green hover:bg-[#097b46] text-white rounded-full shadow-premiumHover flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer z-40"
          aria-label="Aggiungi regola grammaticale"
          title="Aggiungi Regola"
        >
          <FiPlus size={24} />
        </button>
      )}

      {/* Modal */}
      <GrammarFormModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        initial={editingItem}
      />
    </div>
  );
};

export default Grammar;
