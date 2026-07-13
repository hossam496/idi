import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useLearning } from '../../context/LearningContext';
import { FiPlus, FiMessageSquare, FiBookOpen, FiBookmark, FiHeart, FiBook, FiSettings, FiVolume2, FiGlobe } from 'react-icons/fi';
import Button from '../common/Button';
import Dialog from '../common/Dialog';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { chats, activeChatId, selectChat, startNewChat } = useChat();
  const { grammarList, vocabularyList, favoritesCount } = useLearning();
  const navigate   = useNavigate();
  const location   = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voiceGender, setVoiceGender]       = useState('female');
  const [speechSpeed, setSpeechSpeed]       = useState('1.0');

  const verbCount = vocabularyList.filter(v => v.partOfSpeech === 'Verbo').length;

  const navLinks = [
    { path: '/grammar',    icon: FiBookOpen,  label: 'Grammatica',  count: grammarList.length },
    { path: '/vocabulary', icon: FiBook,      label: 'Vocabolario', count: vocabularyList.length },
    { path: '/vocabulary', icon: FiBookmark,  label: 'Verbi',       count: verbCount, sub: true },
    { path: '/grammar',    icon: FiHeart,     label: 'Preferiti',   count: favoritesCount, sub: true },
  ];

  const handleNewChat = () => {
    startNewChat();
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const handleSelectChat = (id) => {
    selectChat(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      <aside className={`w-72 bg-brand-surface border-r border-brand-border h-full flex flex-col justify-between shrink-0`}>
        {/* Top Actions & Chat History */}
        <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-6">
          {/* New Chat Button */}
          <Button 
            onClick={handleNewChat} 
            variant="primary" 
            className="w-full justify-center space-x-2 py-3 shadow-md"
          >
            <FiPlus size={16} />
            <span>Nuova Chat</span>
          </Button>

          {/* Chat History Section */}
          <div className="flex flex-col space-y-2">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/55 px-2">
              Cronologia Chat
            </h4>
            <div className="space-y-1">
              {chats.map((chat) => {
                const isActive = chat.id === activeChatId;
                return (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className={`w-full text-left px-3 py-3 rounded-xl transition-all flex items-start space-x-3 cursor-pointer group ${
                      isActive 
                        ? 'bg-brand-navy/5 border-l-4 border-brand-green text-brand-navy' 
                        : 'text-brand-navy/70 hover:bg-brand-navy/5 hover:text-brand-navy'
                    }`}
                  >
                    <FiMessageSquare className="shrink-0 mt-0.5 text-brand-green" size={16} />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold truncate block">
                          {chat.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-brand-textSecondary truncate block mt-0.5">
                        {chat.preview}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Learning Library Counters */}
          <div className="flex flex-col space-y-1">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-navy/55 px-2 mb-1">
              La Mia Libreria
            </h4>
            {navLinks.filter(l => !l.sub).map(({ path, icon: Icon, label, count }) => (
              <button
                key={label}
                onClick={() => { navigate(path); if (setIsMobileOpen) setIsMobileOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer group ${
                  location.pathname === path
                    ? 'bg-brand-navy/5 text-brand-navy'
                    : 'text-brand-navy/65 hover:bg-brand-navy/5 hover:text-brand-navy'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={15} className={location.pathname === path ? 'text-brand-green' : 'text-brand-navy/50 group-hover:text-brand-green'} />
                  <span className="text-xs font-semibold">{label}</span>
                </div>
                {count > 0 && (
                  <span className="text-[10px] font-bold bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full min-w-[22px] text-center">
                    {count}
                  </span>
                )}
              </button>
            ))}
            {/* Sub-counters row */}
            <div className="flex gap-2 px-3 pt-1 pb-0.5">
              {navLinks.filter(l => l.sub).map(({ icon: Icon, label, count }) => (
                <div key={label} className="flex items-center gap-1 text-[10px] text-brand-navy/45 font-semibold">
                  <Icon size={11} className="text-brand-navy/40" />
                  <span>{label}</span>
                  <span className="font-bold text-brand-navy/60">{count}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
        <div className="p-4 border-t border-brand-border space-y-1">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-brand-navy/70 hover:bg-brand-navy/5 hover:text-brand-navy text-sm font-sans font-medium transition-all cursor-pointer"
          >
            <FiSettings size={16} className="text-brand-navy/60" />
            <span>Impostazioni Tutor</span>
          </button>
        </div>
      </aside>

      {/* Settings Dialog */}
      <Dialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Impostazioni Tutor IA"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-navy/80 block">
              Voce dell'Assistente
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setVoiceGender('female')}
                className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center space-y-1 transition-all ${
                  voiceGender === 'female'
                    ? 'border-brand-green bg-brand-green/5 text-brand-navy font-semibold'
                    : 'border-brand-border bg-white text-brand-navy/70 hover:border-brand-navy/35'
                }`}
              >
                <FiVolume2 size={20} className={voiceGender === 'female' ? 'text-brand-green' : ''} />
                <span className="text-xs">Voce Femminile (Sofia)</span>
              </button>
              <button
                onClick={() => setVoiceGender('male')}
                className={`py-3 px-4 border rounded-xl flex flex-col items-center justify-center space-y-1 transition-all ${
                  voiceGender === 'male'
                    ? 'border-brand-green bg-brand-green/5 text-brand-navy font-semibold'
                    : 'border-brand-border bg-white text-brand-navy/70 hover:border-brand-navy/35'
                }`}
              >
                <FiVolume2 size={20} className={voiceGender === 'male' ? 'text-brand-green' : ''} />
                <span className="text-xs">Voce Maschile (Matteo)</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-navy/80">
                Velocità di Pronuncia
              </label>
              <span className="text-xs font-bold text-brand-green">{speechSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.1"
              value={speechSpeed}
              onChange={(e) => setSpeechSpeed(e.target.value)}
              className="w-full accent-brand-green cursor-pointer h-1 bg-brand-border rounded-lg appearance-none"
            />
            <div className="flex justify-between text-[10px] text-brand-textSecondary font-medium">
              <span>Più Lento</span>
              <span>Normale</span>
              <span>Più Veloce</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-navy/80 block">
              Dialetto di Conversazione
            </label>
            <div className="relative">
              <FiGlobe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/40" />
              <select className="w-full pl-10 pr-4 py-3 bg-white border border-brand-border rounded-xl font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-brand-navy">
                <option value="standard">Italiano Standard (Fiorentino)</option>
                <option value="roman">Italiano Centrale (Romano)</option>
                <option value="milanese">Italiano Settentrionale (Milanese)</option>
              </select>
            </div>
          </div>

          <div className="roman-divider my-4"></div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Annulla
            </Button>
            <Button variant="primary" onClick={() => setIsSettingsOpen(false)}>
              Salva Configurazione
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default Sidebar;
