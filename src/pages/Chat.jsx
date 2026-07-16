import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { useLearning } from '../context/LearningContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import {
  FiSend, FiMic, FiVolume2, FiPlus, FiBookOpen, FiBookmark,
  FiMenu, FiX, FiCheck, FiCopy, FiPaperclip, FiFile, FiFileText,
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

// ── File type helpers ─────────────────────────────────────────────────────────

const ACCEPTED = '.jpg,.jpeg,.png,.webp,.pdf,.docx,.txt';
const MAX_BYTES = 20 * 1024 * 1024; // 20 MB

function fileIcon(mimeType) {
  if (!mimeType) return <FiFile size={18} />;
  if (mimeType.startsWith('image/')) return null; // thumbnail used instead
  if (mimeType === 'application/pdf')
    return <span className="text-brand-red font-bold text-xs">PDF</span>;
  if (mimeType.includes('wordprocessingml'))
    return <span className="text-blue-600 font-bold text-xs">DOC</span>;
  return <FiFileText size={18} className="text-brand-navy/60" />;
}

// ── FilePreview chip ──────────────────────────────────────────────────────────

function FilePreview({ file, onRemove, uploading }) {
  const isImage = file.type.startsWith('image/');
  const url     = isImage ? URL.createObjectURL(file) : null;

  useEffect(() => { return () => { if (url) URL.revokeObjectURL(url); }; }, [url]);

  return (
    <div className="relative flex items-center gap-2 pl-2 pr-8 py-1.5 bg-brand-surface border border-brand-border rounded-2xl shadow-soft max-w-[200px]">
      {isImage ? (
        <img src={url} alt={file.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-lg bg-brand-navy/5 flex items-center justify-center shrink-0">
          {fileIcon(file.type)}
        </div>
      )}
      <span className="text-[11px] font-medium text-brand-navy truncate max-w-[100px]">{file.name}</span>
      {!uploading && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute right-1.5 top-1.5 w-4 h-4 rounded-full bg-brand-navy/10 hover:bg-brand-red/20 flex items-center justify-center cursor-pointer"
        >
          <FiX size={9} className="text-brand-navy" />
        </button>
      )}
    </div>
  );
}

// ── Attachment thumbnail inside chat bubble ───────────────────────────────────

function AttachmentChip({ attachment }) {
  if (!attachment) return null;
  const isImage = attachment.mimeType?.startsWith('image/');
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-navy/5 rounded-xl text-[10px] text-brand-navy/70 font-medium mb-1.5">
      {isImage ? '🖼️' : '📄'}
      <span className="truncate max-w-[160px]">{attachment.originalName}</span>
      <span className="shrink-0">({(attachment.size / 1024).toFixed(0)} KB)</span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const Chat = () => {
  const {
    messages, isTyping, isListening,
    sendMessage, toggleListening, startNewChat,
    uploadProgress,
  } = useChat();

  const { addVocabularyItem, addGrammarItem } = useLearning();

  const [inputVal,    setInputVal]    = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [savedItems,  setSavedItems]  = useState({});
  const [copiedId,    setCopiedId]    = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError,    setFileError]    = useState('');
  const [isDragging,   setIsDragging]   = useState(false);

  const chatEndRef  = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── File selection ──────────────────────────────────────────────────────────

  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    setFileError('');
    if (file.size > MAX_BYTES) {
      setFileError('File too large — max 20 MB.');
      return;
    }
    const okTypes = ['image/jpeg','image/jpg','image/png','image/webp',
                     'application/pdf',
                     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                     'text/plain'];
    if (!okTypes.includes(file.type)) {
      setFileError('Unsupported type. Use jpg, png, webp, pdf, docx, or txt.');
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files?.[0] ?? null);
    e.target.value = '';
  };

  const removeFile = () => { setSelectedFile(null); setFileError(''); };

  // ── Drag & drop ─────────────────────────────────────────────────────────────

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0] ?? null);
  };

  // ── Send ────────────────────────────────────────────────────────────────────

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim() && !selectedFile) return;
    sendMessage(inputVal, selectedFile);
    setInputVal('');
    setSelectedFile(null);
    setFileError('');
  };

  const handleSuggestClick = (suggestion) => sendMessage(suggestion);

  // ── Save helpers ────────────────────────────────────────────────────────────

  const handleSaveVocab = (msgId, vocab) => {
    if (savedItems[msgId + '_vocab']) return;
    addVocabularyItem(vocab);
    setSavedItems(prev => ({ ...prev, [msgId + '_vocab']: true }));
  };

  const handleSaveGrammar = (msgId, grammar) => {
    if (savedItems[msgId + '_grammar']) return;
    addGrammarItem(grammar);
    setSavedItems(prev => ({ ...prev, [msgId + '_grammar']: true }));
  };

  const copyText = (msgId, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'it-IT';
      window.speechSynthesis.speak(u);
    }
  };

  const suggestions = [
    { text: 'Ciao! Come posso migliorare la mia pronuncia?', label: 'Saluto iniziale 👋' },
    { text: 'Vorrei ordinare del cibo al ristorante.', label: 'Ordinare al bar 🍕' },
    { text: 'Spiegami la differenza tra essere e avere al passato.', label: 'Grammatica: Passato 📚' },
  ];

  /**
   * Checks if a string is predominantly Arabic.
   * Returns true if more than 40% of its characters are Arabic script.
   */
  function isPredominantlyArabic(str) {
    if (!str) return false;
    const arabicChars = (str.match(/[\u0600-\u06FF]/g) || []).length;
    return arabicChars / str.length > 0.25;
  }

  const isSending = isTyping;

  return (
    <div
      className="bg-brand-cream min-h-screen flex flex-col font-sans"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Navbar />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-brand-green/10 border-4 border-dashed border-brand-green rounded-none pointer-events-none"
          >
            <div className="bg-brand-surface px-8 py-6 rounded-2xl shadow-premium text-center">
              <FiPaperclip size={32} className="mx-auto text-brand-green mb-2" />
              <p className="font-bold text-brand-navy">Rilascia il file per allegarlo</p>
              <p className="text-xs text-brand-textSecondary mt-1">jpg, png, webp, pdf, docx, txt — max 20 MB</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED}
        onChange={handleFileInputChange}
        className="hidden"
        aria-label="Allega file"
      />

      {/* Main chat window */}
      <div className="flex-1 flex overflow-hidden max-w-7xl w-full mx-auto bg-brand-surface border-x border-b border-brand-border h-[calc(100vh-80px)] relative">

        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full"><Sidebar /></div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-brand-navy/30 backdrop-blur-xs"
              />
              <motion.div
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative z-10 h-full flex"
              >
                <Sidebar isMobileOpen={sidebarOpen} setIsMobileOpen={setSidebarOpen} />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-4 right-[-48px] bg-brand-navy text-white p-2.5 rounded-r-xl border-l border-white/10"
                >
                  <FiX size={20} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div className="flex-grow flex flex-col justify-between h-full bg-brand-cream/15 relative">

          {/* Header */}
          <div className="px-6 py-4 border-b border-brand-border bg-brand-surface flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-brand-navy/5 text-brand-navy rounded-xl cursor-pointer"
              >
                <FiMenu size={20} />
              </button>
              <div>
                <h2 className="font-serif font-bold text-base text-brand-navy">Tutor di Conversazione</h2>
                <p className="text-[10px] text-brand-green font-semibold uppercase tracking-wider">AI Alimentato • Spiegazioni Bilingue</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="green" size="sm">Italiano standard</Badge>
            </div>
          </div>

          {/* Messages stream */}
          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">

            {messages.length === 1 && messages[0].sender === 'ai' && (
              <div className="max-w-2xl mx-auto mb-8 space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="font-serif text-xl font-bold text-brand-navy">Pronto a praticare? 🇮🇹</h3>
                  <p className="text-xs text-brand-textSecondary">Seleziona uno spunto o allega un file per iniziare.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestClick(s.text)}
                      className="p-4 bg-brand-surface border border-brand-border hover:border-brand-green rounded-2xl text-left hover:shadow-premium transition-all cursor-pointer flex flex-col justify-between space-y-3 h-32 group"
                    >
                      <span className="text-[10px] uppercase font-bold text-brand-green tracking-wider">{s.label}</span>
                      <span className="text-xs text-brand-navy font-semibold group-hover:text-brand-green leading-snug line-clamp-3">"{s.text}"</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => {
                const isAi = msg.sender === 'ai';
                return (
                  <div key={msg.id} className="space-y-3">
                    <div className={`flex ${isAi ? 'justify-start' : 'justify-end'} items-start space-x-3`}>
                      {isAi && (
                        <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-serif font-bold text-xs shrink-0 shadow-soft">IA</div>
                      )}
                      <div className="flex flex-col max-w-[85%] sm:max-w-[70%] space-y-1">
                        <div className={`rounded-3xl px-5 py-3.5 text-sm font-sans shadow-soft border ${
                          isAi
                            ? 'bg-brand-surface text-brand-navy border-brand-border rounded-tl-sm'
                            : 'bg-brand-navy text-white border-brand-navy rounded-tr-sm'
                        }`}>
                          {/* Attachment chip (user messages) */}
                          {!isAi && msg.fileAttachment && (
                            <AttachmentChip attachment={msg.fileAttachment} />
                          )}

                          {isAi && (
                            <div className="flex items-center space-x-1.5 mb-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-green">🇮🇹 Italian</span>
                            </div>
                          )}
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                          {isAi && msg.translation && isPredominantlyArabic(msg.translation) && (
                            <div className="mt-3 pt-3 border-t border-brand-border/60">
                              <div className="bg-brand-navy/[0.03] rounded-xl p-3">
                                <div className="flex items-center space-x-1.5 mb-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-navy/60">🇪🇬 العربية</span>
                                </div>
                                <p className="text-[13px] leading-relaxed text-brand-navy/85 font-sans" dir="rtl" style={{ textAlign: 'right' }}>
                                  {msg.translation}
                                </p>
                              </div>
                            </div>
                          )}

                          {isAi && (
                            <div className="mt-2.5 flex items-center space-x-2 pt-2 border-t border-brand-border/60">
                              <button
                                onClick={() => speakText(msg.text)}
                                className="text-brand-green hover:text-[#097b46] p-1 rounded hover:bg-brand-navy/5 transition-colors flex items-center space-x-1 cursor-pointer text-xs font-semibold"
                              >
                                <FiVolume2 size={14} /><span>Ascolta</span>
                              </button>
                              <button
                                onClick={() => copyText(msg.id, msg.text + (msg.translation ? '\n\n' + msg.translation : ''))}
                                className="text-brand-navy/60 hover:text-brand-navy p-1 rounded hover:bg-brand-navy/5 transition-colors flex items-center space-x-1 cursor-pointer text-xs font-medium"
                              >
                                {copiedId === msg.id
                                  ? <><FiCheck size={14} className="text-brand-green" /><span className="text-brand-green">Copiato</span></>
                                  : <><FiCopy size={14} /><span>Copia</span></>}
                              </button>
                            </div>
                          )}
                        </div>
                        <span className={`text-[9px] text-brand-textSecondary/50 font-medium px-2 ${!isAi ? 'text-right' : 'text-left'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Extracted Cards */}
                    {isAi && (msg.extractedVocab || msg.extractedGrammar) && (
                      <div className="pl-11 max-w-[85%] sm:max-w-[70%] space-y-2">
                        {msg.extractedVocab && (
                          <div className="bg-[#eefcf5] border border-brand-green/20 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-soft">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant="green" size="sm">Vocabolo Estratto 💡</Badge>
                                <span className="text-xs text-brand-navy/60 italic">/{msg.extractedVocab.pronunciation}/</span>
                              </div>
                              <h4 className="font-serif font-bold text-brand-navy text-sm">
                                {msg.extractedVocab.italianWord} <span className="font-sans font-normal text-xs text-brand-navy/70">– {msg.extractedVocab.arabicTranslation}</span>
                              </h4>
                              <p className="text-[11px] text-brand-textSecondary leading-snug">Esempio: "{msg.extractedVocab.example}"</p>
                            </div>
                            <Button variant={savedItems[msg.id + '_vocab'] ? 'outline' : 'primary'} size="sm" onClick={() => handleSaveVocab(msg.id, msg.extractedVocab)} className="shrink-0 space-x-1">
                              {savedItems[msg.id + '_vocab']
                                ? <><FiCheck size={12} className="text-brand-green" /><span className="text-brand-green">Salvato</span></>
                                : <><FiPlus size={12} /><span>Salva</span></>}
                            </Button>
                          </div>
                        )}
                        {msg.extractedGrammar && (
                          <div className="bg-[#fcf3f3] border border-brand-red/20 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-soft">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <Badge variant="red" size="sm">Regola Grammaticale 💡</Badge>
                                <Badge variant="navy" size="sm" className="bg-brand-navy/5 text-brand-navy uppercase text-[9px]">{msg.extractedGrammar.difficulty}</Badge>
                              </div>
                              <h4 className="font-serif font-bold text-brand-navy text-sm">{msg.extractedGrammar.title}</h4>
                              <p className="text-[11px] text-brand-textSecondary leading-snug">
                                {msg.extractedGrammar.italianExplanation?.slice(0, 75)}...
                              </p>
                            </div>
                            <Button variant={savedItems[msg.id + '_grammar'] ? 'outline' : 'danger'} size="sm" onClick={() => handleSaveGrammar(msg.id, msg.extractedGrammar)} className="shrink-0 space-x-1">
                              {savedItems[msg.id + '_grammar']
                                ? <><FiCheck size={12} className="text-brand-green" /><span className="text-brand-green">Salvata</span></>
                                : <><FiPlus size={12} /><span>Salva</span></>}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex justify-start items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-serif font-bold text-xs shrink-0">IA</div>
                  <div className="bg-brand-surface border border-brand-border rounded-3xl px-5 py-4 flex items-center space-x-1.5 shadow-soft rounded-tl-sm">
                    <span className="w-2 h-2 bg-brand-navy/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-brand-navy/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-brand-navy/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Listening overlay */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
                className="absolute inset-x-6 bottom-24 bg-brand-navy text-white p-4 rounded-2xl flex items-center justify-between shadow-premium z-20"
              >
                <div className="flex items-center space-x-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red"></span>
                  </span>
                  <span className="text-xs font-semibold tracking-wide">Sto ascoltando... Parla in italiano! / تكلّم بالإيطالية</span>
                </div>
                <button onClick={toggleListening} className="text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer">
                  Annulla
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area */}
          <div className="p-4 border-t border-brand-border bg-brand-surface">

            {/* Upload progress bar */}
            <AnimatePresence>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-3xl mx-auto mb-2"
                >
                  <div className="h-1 bg-brand-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-green transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-brand-green font-medium mt-0.5 text-right">{uploadProgress}%</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* File error */}
            <AnimatePresence>
              {fileError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="max-w-3xl mx-auto mb-2 text-[11px] text-brand-red font-medium flex items-center gap-1"
                >
                  ⚠️ {fileError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* File preview chip */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                  className="max-w-3xl mx-auto mb-2"
                >
                  <FilePreview file={selectedFile} onRemove={removeFile} uploading={isSending} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input row */}
            <form onSubmit={handleSend} className="max-w-3xl mx-auto flex items-center space-x-2">

              {/* Voice button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={isSending}
                className={`p-3.5 rounded-full border transition-all cursor-pointer hover:shadow-soft flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-brand-red text-white border-brand-red animate-pulse'
                    : 'bg-brand-cream text-brand-navy border-brand-border hover:bg-brand-navy/5'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Registra voce"
              >
                <FiMic size={18} />
              </button>

              {/* Attachment button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSending}
                className={`p-3.5 rounded-full border transition-all cursor-pointer hover:shadow-soft flex items-center justify-center shrink-0 ${
                  selectedFile
                    ? 'bg-brand-green text-white border-brand-green'
                    : 'bg-brand-cream text-brand-navy border-brand-border hover:bg-brand-navy/5'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                title="Allega immagine, PDF, DOCX o TXT"
                aria-label="Allega file"
              >
                <FiPaperclip size={18} />
              </button>

              {/* Text input */}
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={selectedFile ? 'Aggiungi un messaggio (opzionale)...' : 'Scrivi un messaggio in italiano o arabo...'}
                className="flex-1 px-5 py-3 border border-brand-border bg-brand-cream/30 hover:bg-brand-cream/10 rounded-full font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-brand-navy"
                disabled={isListening || isSending}
              />

              {/* Send button */}
              <button
                type="submit"
                disabled={(!inputVal.trim() && !selectedFile) || isSending}
                className="p-3.5 rounded-full bg-brand-green text-white hover:bg-[#097b46] transition-colors flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Invia messaggio"
              >
                {isSending
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <FiSend size={18} />}
              </button>
            </form>

            <p className="max-w-3xl mx-auto mt-1.5 text-[10px] text-brand-textSecondary/50 text-center">
              Trascina un file qui, o clicca 📎 · jpg, png, webp, pdf, docx, txt · max 20 MB
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Chat;
