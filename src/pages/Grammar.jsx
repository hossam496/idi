import React, { useState } from 'react';
import { useLearning } from '../context/LearningContext';
import Navbar from '../components/layout/Navbar';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { FiSearch, FiHeart, FiCalendar, FiBookOpen, FiDownload, FiTrash2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Grammar = () => {
  const { 
    grammarList, 
    toggleFavoriteGrammar, 
    seedDemoData, 
    clearAllData 
  } = useLearning();

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [favoriteFilter, setFavoriteFilter] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, alphabetical

  // Filter & Sort Logic
  const filteredList = grammarList
    .filter(item => {
      const itExplanation = (item.explanationItalian || item.italianExplanation || '').toLowerCase();
      const arExplanation = item.explanationArabic || item.arabicExplanation || '';
      const arTitle = item.arabicTitle || '';
      
      const matchesSearch = 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        arTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itExplanation.includes(searchQuery.toLowerCase()) ||
        arExplanation.includes(searchQuery);
      
      const matchesDifficulty = difficultyFilter === 'all' || item.difficulty === difficultyFilter;
      
      const matchesFavorite = !favoriteFilter || item.favorite;

      return matchesSearch && matchesDifficulty && matchesFavorite;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.dateLearned || 0);
      const dateB = new Date(b.createdAt || b.dateLearned || 0);
      if (sortBy === 'newest') return dateB - dateA;
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'alphabetical') return a.title.localeCompare(b.title);
      return 0;
    });

  const getDifficultyColor = (diff) => {
    if (diff === 'Principiante') return 'green';
    if (diff === 'Intermedio') return 'navy';
    if (diff === 'Avanzato') return 'red';
    return 'navy';
  };

  return (
    <div className="bg-brand-cream min-h-screen font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-brand-border">
          <div>
            <h1 className="font-serif text-3xl font-bold text-brand-navy">Archivio Grammaticale</h1>
            <p className="text-xs text-brand-textSecondary mt-1">
              Spiegazioni bilingue ed esempi pratici estratti dalle tue conversazioni con l'IA.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {grammarList.length === 0 ? (
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
              placeholder="Cerca regole grammaticali... / ابحث في القواعد"
              className="w-full pl-10 pr-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-brand-navy"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="md:col-span-3">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-brand-navy"
            >
              <option value="all">Tutti i livelli / جميع المستويات</option>
              <option value="Principiante">Principiante (A1-A2)</option>
              <option value="Intermedio">Intermedio (B1-B2)</option>
              <option value="Avanzato">Avanzato (C1-C2)</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 bg-brand-surface border border-brand-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-brand-navy"
            >
              <option value="newest">Più recenti</option>
              <option value="oldest">Meno recenti</option>
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
                  <FiBookOpen size={36} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-xl font-bold text-brand-navy">Archivio vuoto / سجل فارغ</h3>
                  <p className="text-xs text-brand-textSecondary max-w-sm mx-auto">
                    Le regole grammaticali verranno estratte automaticamente dai tuoi dialoghi con il tutor IA.
                  </p>
                  <p className="text-[11px] text-brand-textSecondary/60 italic dir-rtl text-center max-w-sm mx-auto">
                    سيتم استخراج القواعد النحوية تلقائياً من محادثاتك مع معلم الذكاء الاصطناعي.
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
              className="grid gap-6 md:grid-cols-2"
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
                    
                    {/* Header: Title & Heart Favorite & Difficulty */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge variant={getDifficultyColor(item.difficulty)} size="sm">
                          {item.difficulty}
                        </Badge>
                        <button
                          onClick={() => toggleFavoriteGrammar(item.id)}
                          className={`p-2 rounded-full cursor-pointer hover:bg-brand-red/5 transition-colors ${
                            item.favorite ? 'text-brand-red' : 'text-brand-navy/35'
                          }`}
                          aria-label="Aggiungi ai preferiti"
                        >
                          <FiHeart size={18} className={item.favorite ? 'fill-current' : ''} />
                        </button>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-brand-navy">
                        {item.title} {item.arabicTitle && item.arabicTitle !== item.title && (
                          <span className="font-sans font-normal text-xs text-brand-navy/60 block mt-0.5">({item.arabicTitle})</span>
                        )}
                      </h3>
                      
                      <div className="roman-divider my-2"></div>
                    </div>

                    {/* Explanations */}
                    <div className="space-y-4 py-2 flex-grow">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-brand-green tracking-wider">Spiegazione</span>
                        <p className="text-xs text-brand-textSecondary leading-relaxed mt-1">
                          {item.explanationItalian || item.italianExplanation}
                        </p>
                      </div>
                      
                      <div className="text-right dir-rtl border-r-2 border-brand-red/20 pr-3 py-1">
                        <span className="text-[10px] uppercase font-bold text-brand-red tracking-wider">الشرح</span>
                        <p className="text-xs text-brand-textSecondary/90 leading-relaxed mt-1 font-sans">
                          {item.explanationArabic || item.arabicExplanation}
                        </p>
                      </div>
                    </div>

                    {/* Examples Section */}
                    {item.examples && item.examples.length > 0 && (
                      <div className="mt-4 p-3 bg-brand-cream/40 rounded-xl space-y-2">
                        <span className="text-[9px] uppercase font-bold text-brand-navy/60 tracking-wider">Esempi Pratici</span>
                        {item.examples.map((ex, index) => (
                          <div key={index} className="text-xs space-y-0.5 border-t border-brand-border/40 first:border-none pt-1 first:pt-0">
                            <p className="font-semibold text-brand-navy">Ex: {ex.it}</p>
                            <p className="text-brand-textSecondary text-[10px] italic">{ex.ar}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer: Date Added */}
                    <div className="mt-5 pt-3 border-t border-brand-border/60 flex items-center text-[10px] text-brand-textSecondary/50 font-semibold">
                      <FiCalendar className="mr-1.5" />
                      <span>Estratto il {item.createdAt || item.dateLearned}</span>
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

export default Grammar;
