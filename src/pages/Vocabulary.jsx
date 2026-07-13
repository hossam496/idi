import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { FiSearch, FiHeart, FiCalendar, FiBookmark, FiVolume2, FiDownload, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Vocabulary = () => {
  const { 
    vocabularyList, 
    toggleFavoriteVocabulary, 
    seedDemoData, 
    clearAllData 
  } = useLearning();

  const [searchQuery, setSearchQuery] = useState('');
  const [posFilter, setPosFilter] = useState('all'); // Part of speech
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // newest, alphabetical

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'it-IT';
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Pronuncia vocale (UI soltanto): "${word}"`);
    }
  };

  // Filter & Sort Logic
  const filteredList = vocabularyList
    .filter(item => {
      const matchesSearch = 
        item.italianWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.arabicTranslation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.pronunciation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.example.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPos = posFilter === 'all' || item.partOfSpeech === posFilter;
      const matchesFavorite = !favoriteFilter || item.favorite;

      return matchesSearch && matchesPos && matchesFavorite;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.dateAdded) - new Date(a.dateAdded);
      if (sortBy === 'alphabetical') return a.italianWord.localeCompare(b.italianWord);
      return 0;
    });

  const getPosColor = (pos) => {
    if (pos === 'Verbo') return 'green';
    if (pos === 'Sostantivo') return 'navy';
    if (pos === 'Aggettivo') return 'red';
    return 'gold';
  };

  return (
    <div className="bg-brand-cream min-h-screen font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-brand-border">
          <div>
            <h1 className="font-serif text-3xl font-bold text-brand-navy">Vocabolario Personale</h1>
            <p className="text-xs text-brand-textSecondary mt-1">
              Il tuo dizionario dinamico di parole italiane salvate durante la conversazione.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {vocabularyList.length === 0 ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={seedDemoData}
                className="space-x-1.5"
              >
                <FiDownload size={14} />
                <span>Carica Dati Demo</span>
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllData}
                className="text-brand-red hover:bg-brand-red/5 space-x-1.5"
              >
                <FiTrash2 size={14} />
                <span>Cancella Tutto</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid md:grid-cols-12 gap-4 items-center">
          
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca parole, traduzioni... / ابحث في الكلمات"
              className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-brand-navy"
            />
          </div>

          {/* Part of Speech Dropdown */}
          <div className="md:col-span-3">
            <select
              value={posFilter}
              onChange={(e) => setPosFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-brand-navy"
            >
              <option value="all">Tutte le parti del discorso / جميع الأقسام</option>
              <option value="Sostantivo">Sostantivi (Nome)</option>
              <option value="Verbo">Verbi</option>
              <option value="Aggettivo">Aggettivi</option>
              <option value="Interiezione">Interiezioni / Altro</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-brand-navy"
            >
              <option value="newest">Aggiunte di recente</option>
              <option value="alphabetical">Alfabetico</option>
            </select>
          </div>

          {/* Favorites Checkbox */}
          <div className="md:col-span-2 flex justify-start md:justify-end">
            <button
              onClick={() => setFavoriteFilter(!favoriteFilter)}
              className={`flex items-center space-x-2 px-4 py-2.5 border rounded-xl font-sans text-sm transition-all cursor-pointer ${
                favoriteFilter 
                  ? 'bg-brand-red/10 border-brand-red/20 text-brand-red font-semibold' 
                  : 'bg-brand-surface border-brand-border text-brand-navy hover:bg-brand-navy/5'
              }`}
            >
              <FiHeart className={favoriteFilter ? 'fill-current' : ''} />
              <span>Preferiti</span>
            </button>
          </div>

        </div>

        {/* Empty State vs Cards Grid */}
        <AnimatePresence mode="popLayout">
          {filteredList.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="w-full"
            >
              <Card className="p-12 text-center rounded-3xl border-dashed border-2 border-brand-border max-w-2xl mx-auto flex flex-col items-center space-y-5 bg-brand-surface">
                <div className="p-4 bg-brand-navy/5 text-brand-navy rounded-full">
                  <FiBookmark size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-brand-navy">Vocabolario vuoto / قاموس فارغ</h3>
                  <p className="text-xs text-brand-textSecondary max-w-sm mx-auto">
                    Le parole suggerite dal tutor IA compariranno qui dopo aver fatto clic su "Salva" all'interno della chat.
                  </p>
                  <p className="text-[11px] text-brand-textSecondary/60 italic dir-rtl text-center max-w-sm mx-auto">
                    المفردات المقترحة من المعلم ستظهر هنا بعد النقر على زر "حفظ" في الدردشة.
                  </p>
                </div>
                <div className="flex space-x-3 pt-2">
                  <Button variant="primary" onClick={seedDemoData}>
                    Carica Dati Demo
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredList.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full flex flex-col justify-between p-6 border-brand-border/80 hover:shadow-premiumHover hover:-translate-y-0.5 transition-all">
                    
                    {/* Header: Heart and Part of speech badge */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Badge variant={getPosColor(item.partOfSpeech)} size="sm">
                          {item.partOfSpeech}
                        </Badge>
                        <button
                          onClick={() => toggleFavoriteVocabulary(item.id)}
                          className={`p-2 rounded-full cursor-pointer hover:bg-brand-red/5 transition-colors ${
                            item.favorite ? 'text-brand-red' : 'text-brand-navy/35'
                          }`}
                          aria-label="Aggiungi ai preferiti"
                        >
                          <FiHeart size={18} className={item.favorite ? 'fill-current' : ''} />
                        </button>
                      </div>

                      {/* Word & Audio play */}
                      <div className="flex items-center space-x-2">
                        <h3 className="font-serif text-xl font-bold text-brand-navy">
                          {item.italianWord}
                        </h3>
                        <button
                          onClick={() => speakWord(item.italianWord)}
                          className="text-brand-green hover:text-[#097b46] p-1.5 rounded-full hover:bg-brand-navy/5 transition-colors cursor-pointer"
                          title="Ascolta pronuncia"
                        >
                          <FiVolume2 size={16} />
                        </button>
                      </div>
                      
                      {/* Phonetic Pronunciation */}
                      <p className="text-[11px] text-brand-textSecondary/60 italic font-sans font-medium">
                        Pronuncia: /{item.pronunciation}/
                      </p>
                    </div>

                    {/* Middle: Translation and Example */}
                    <div className="space-y-4 py-4 flex-grow border-y border-brand-border/60 my-3">
                      <div className="text-right dir-rtl">
                        <span className="text-[9px] uppercase font-bold text-brand-red tracking-wider">الترجمة</span>
                        <p className="text-sm font-semibold text-brand-navy font-sans mt-0.5">
                          {item.arabicTranslation}
                        </p>
                      </div>
                      
                      <div className="text-left">
                        <span className="text-[9px] uppercase font-bold text-brand-navy/60 tracking-wider">Contesto d'uso</span>
                        <p className="text-xs text-brand-textSecondary italic mt-1 leading-relaxed">
                          "{item.example}"
                        </p>
                      </div>
                    </div>

                    {/* Footer: Date Added */}
                    <div className="flex items-center text-[10px] text-brand-textSecondary/50 font-semibold">
                      <FiCalendar className="mr-1.5" />
                      <span>Aggiunta il {item.dateAdded}</span>
                    </div>

                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};

export default Vocabulary;
