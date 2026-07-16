/**
 * ChatContext — migrated to backend API.
 * All messages and conversations now live in MongoDB via the backend.
 * Gemini is called server-side — no API key needed in the frontend.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth }     from './AuthContext';
import { useLearning } from './LearningContext';
import { chatAPI }     from '../services/api';

const ChatContext = createContext(null);

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normalise a backend message into the shape the UI expects. */
function normaliseMessage(msg) {
  return {
    id:               msg.id || msg._id,
    sender:           msg.role === 'ai' ? 'ai' : 'user',
    text:             msg.message,
    translation:      msg.translation  ?? null,
    extractedVocab:   msg.extractedVocab   ?? null,
    extractedGrammar: msg.extractedGrammar ?? null,
    timestamp: msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

/** Normalise a backend conversation into the shape the sidebar expects. */
function normaliseConversation(conv) {
  return {
    id:      conv.id || conv._id,
    title:   conv.title   || 'Nuova conversazione',
    preview: conv.preview || '',
    date:    conv.updatedAt
      ? new Date(conv.updatedAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export const ChatProvider = ({ children }) => {
  const { isAuthenticated }                  = useAuth();
  const { addGrammarItem, addVocabularyItem, incrementConversations } = useLearning();

  const [chats,        setChats]        = useState([]);
  const [allMessages,  setAllMessages]  = useState({});   // { [conversationId]: Message[] }
  const [activeChatId, setActiveChatId] = useState(null);
  const [isTyping,     setIsTyping]     = useState(false);
  const [isListening,  setIsListening]  = useState(false);

  // ── Load conversations on mount / login ───────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setChats([]);
      setAllMessages({});
      setActiveChatId(null);
      return;
    }
    loadConversations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadConversations = useCallback(async () => {
    try {
      const res  = await chatAPI.getConversations();
      const list = (res.data.data.conversations ?? []).map(normaliseConversation);
      setChats(list);
      if (list.length > 0 && !activeChatId) {
        setActiveChatId(list[0].id);
        loadMessages(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  // ── Load messages for a conversation ─────────────────────────────────────
  const loadMessages = useCallback(async (conversationId) => {
    if (allMessages[conversationId]) return; // already cached
    try {
      const res  = await chatAPI.getMessages(conversationId);
      const msgs = (res.data.data.messages ?? []).map(normaliseMessage);
      setAllMessages(prev => ({ ...prev, [conversationId]: msgs }));
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, [allMessages]);

  // ── Select a conversation ─────────────────────────────────────────────────
  const selectChat = useCallback((id) => {
    setActiveChatId(id);
    loadMessages(id);
  }, [loadMessages]);

  // ── Start a new conversation ──────────────────────────────────────────────
  const startNewChat = useCallback(async () => {
    try {
      const res  = await chatAPI.createConversation({ title: 'Nuova conversazione' });
      const conv = normaliseConversation(res.data.data.conversation);

      const welcomeMsg = {
        id:          `msg_welcome_${conv.id}`,
        sender:      'ai',
        text:        'Ciao! Parliamo in italiano. Dimmi qualcosa su di te o chiedimi aiuto per la grammatica.',
        translation: 'مرحباً! دعنا نتحدث بالإيطالية. أخبرني شيئاً عن نفسك أو اطلب مني المساعدة في القواعد.',
        timestamp:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extractedVocab:   null,
        extractedGrammar: null,
      };

      setChats(prev => [conv, ...prev]);
      setAllMessages(prev => ({ ...prev, [conv.id]: [welcomeMsg] }));
      setActiveChatId(conv.id);
    } catch (err) {
      console.error('Failed to create conversation:', err);
    }
  }, []);

  // ── Send a text message ───────────────────────────────────────────────────
  const sendMessage = useCallback(async (text, file = null) => {
    if (!text.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Optimistically show the user message
    const tempUserMsg = {
      id:               `temp_user_${Date.now()}`,
      sender:           'user',
      text,
      translation:      null,
      extractedVocab:   null,
      extractedGrammar: null,
      timestamp:        timeString,
    };

    const currentMsgs = allMessages[activeChatId] || [];
    setAllMessages(prev => ({
      ...prev,
      [activeChatId]: [...currentMsgs, tempUserMsg],
    }));

    // Update sidebar preview
    setChats(prev => prev.map(c =>
      c.id === activeChatId
        ? { ...c, preview: text.slice(0, 40) + (text.length > 40 ? '...' : '') }
        : c
    ));

    setIsTyping(true);

    try {
      // 2. Build FormData (supports optional file attachment)
      const formData = new FormData();
      formData.append('message', text);
      // Only append conversationId when it's a real MongoDB ObjectId — never append null/undefined
      if (activeChatId && activeChatId !== 'null') {
        formData.append('conversationId', activeChatId);
      }
      if (file) formData.append('file', file);

      // 3. Call backend — Gemini runs server-side
      const res  = await chatAPI.sendMessage(formData);
      const data = res.data.data;

      // 4. Build AI message from response
      const aiMsg = {
        id:               data.aiMessage?.id || `ai_${Date.now()}`,
        sender:           'ai',
        text:             data.italianText,
        translation:      data.arabicTranslation,
        extractedVocab:   data.extractedVocab   ?? null,
        extractedGrammar: data.extractedGrammar ?? null,
        timestamp:        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // 5. Replace temp user message with the real one from server + add AI reply
      const realUserMsg = data.userMessage
        ? normaliseMessage(data.userMessage)
        : { ...tempUserMsg, id: `user_${Date.now()}` };

      setAllMessages(prev => ({
        ...prev,
        [activeChatId]: [...currentMsgs, realUserMsg, aiMsg],
      }));

      // 6. Auto-rename conversation if it still has the default title
      const activeChat = chats.find(c => c.id === activeChatId);
      if (activeChat?.title === 'Nuova conversazione') {
        const newTitle = text.slice(0, 30) + (text.length > 30 ? '...' : '');
        setChats(prev => prev.map(c =>
          c.id === activeChatId ? { ...c, title: newTitle } : c
        ));
      }

      // 7. Update stats (conversations counter)
      incrementConversations();

    } catch (err) {
      console.error('Chat error:', err);
      const errMsg = {
        id:          `err_${Date.now()}`,
        sender:      'ai',
        text:        err.response?.data?.message || 'Si è verificato un errore. Riprova più tardi.',
        translation: 'حدث خطأ. يرجى المحاولة مرة أخرى لاحقاً.',
        timestamp:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extractedVocab:   null,
        extractedGrammar: null,
      };
      setAllMessages(prev => ({
        ...prev,
        [activeChatId]: [...currentMsgs, tempUserMsg, errMsg],
      }));
    } finally {
      setIsTyping(false);
    }
  }, [activeChatId, allMessages, chats, incrementConversations]);

  // ── Send a voice message ──────────────────────────────────────────────────
  const sendVoiceMessage = useCallback(async (audioBlob) => {
    setIsTyping(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.webm');
      // Only append conversationId when it's a real MongoDB ObjectId
      if (activeChatId && activeChatId !== 'null') {
        formData.append('conversationId', activeChatId);
      }

      const res  = await chatAPI.sendVoiceMessage(formData);
      const data = res.data.data;

      const userMsg = {
        id:               data.userMessage?.id || `user_${Date.now()}`,
        sender:           'user',
        text:             data.transcript,
        translation:      null,
        extractedVocab:   null,
        extractedGrammar: null,
        timestamp:        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const aiMsg = {
        id:               data.aiMessage?.id || `ai_${Date.now()}`,
        sender:           'ai',
        text:             data.italianText,
        translation:      data.arabicTranslation,
        extractedVocab:   data.extractedVocab   ?? null,
        extractedGrammar: data.extractedGrammar ?? null,
        timestamp:        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      const currentMsgs = allMessages[activeChatId] || [];
      setAllMessages(prev => ({
        ...prev,
        [activeChatId]: [...currentMsgs, userMsg, aiMsg],
      }));

      incrementConversations();
    } catch (err) {
      console.error('Voice error:', err);
    } finally {
      setIsTyping(false);
      setIsListening(false);
    }
  }, [activeChatId, allMessages, incrementConversations]);

  // ── Toggle voice listening ────────────────────────────────────────────────
  const toggleListening = useCallback(() => {
    setIsListening(prev => !prev);
  }, []);

  // ── Delete a conversation ─────────────────────────────────────────────────
  const deleteChat = useCallback(async (id) => {
    try {
      await chatAPI.deleteConversation(id);
      setChats(prev => {
        const remaining = prev.filter(c => c.id !== id);
        if (activeChatId === id) {
          setActiveChatId(remaining[0]?.id ?? null);
          if (remaining[0]) loadMessages(remaining[0].id);
        }
        return remaining;
      });
      setAllMessages(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  }, [activeChatId, loadMessages]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        messages:     allMessages[activeChatId] || [],
        isTyping,
        isListening,
        startNewChat,
        selectChat,
        sendMessage,
        sendVoiceMessage,
        toggleListening,
        deleteChat,
        loadConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat deve essere utilizzato all\'interno di un ChatProvider');
  return ctx;
};
