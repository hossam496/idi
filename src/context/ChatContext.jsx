/**
 * ChatContext — migrated to backend API.
 * All messages and conversations now live in MongoDB via the backend.
 * Groq AI is called server-side — no API key needed in the frontend.
 *
 * Reliability additions:
 *   - isSendingRef  : prevents duplicate in-flight requests (double-click, React StrictMode)
 *   - 429 handling  : reads error.retryAfter / error.friendlyIt / error.friendlyAr
 *                     set by the Axios interceptor in api.js
 *   - 503 handling  : friendly bilingual message
 */

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useRef,
} from 'react';
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
    translation:      msg.translation      ?? null,
    extractedVocab:   msg.extractedVocab   ?? null,
    extractedGrammar: msg.extractedGrammar ?? null,
    fileAttachment:   msg.fileAttachment   ?? null,
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

/**
 * Build a friendly AI error message object from a caught Axios error.
 * The Axios 429 interceptor in api.js pre-fills error.friendlyIt / friendlyAr / retryAfter.
 */
function buildErrorMessage(err, fallbackTimestamp) {
  const status      = err.response?.status;
  const serverMsg   = err.response?.data?.message;

  // 429 — interceptor already built a friendly message
  if (status === 429 || err.retryAfter) {
    return {
      itText: err.friendlyIt ?? `⏳ Troppe richieste. Riprova tra ${err.retryAfter ?? 60} secondi.`,
      arText: err.friendlyAr ?? `⏳ طلبات كثيرة. أعد المحاولة بعد ${err.retryAfter ?? 60} ثانية.`,
    };
  }

  // 503 — AI service down
  if (status === 503) {
    return {
      itText: '🔌 Il servizio AI non è disponibile al momento. Riprova tra poco.',
      arText: '🔌 خدمة الذكاء الاصطناعي غير متاحة حالياً. حاول مرة أخرى بعد قليل.',
    };
  }

  // 403
  if (status === 403) {
    return {
      itText: '🚫 Accesso al servizio AI negato.',
      arText: '🚫 تم رفض الوصول إلى خدمة الذكاء الاصطناعي.',
    };
  }

  // Generic
  return {
    itText: serverMsg || 'Si è verificato un errore. Riprova più tardi.',
    arText: 'حدث خطأ. يرجى المحاولة مرة أخرى لاحقاً.',
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export const ChatProvider = ({ children }) => {
  const { isAuthenticated }                              = useAuth();
  const { addGrammarItem, addVocabularyItem, incrementConversations } = useLearning();

  const [chats,          setChats]          = useState([]);
  const [allMessages,    setAllMessages]    = useState({});
  const [activeChatId,   setActiveChatId]   = useState(null);
  const [isTyping,       setIsTyping]       = useState(false);
  const [isListening,    setIsListening]    = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Prevents duplicate in-flight requests (double-click, React StrictMode double-invoke)
  const isSendingRef = useRef(false);

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
        id:               `msg_welcome_${conv.id}`,
        sender:           'ai',
        text:             'Ciao! Parliamo in italiano. Dimmi qualcosa su di te o chiedimi aiuto per la grammatica.',
        translation:      'مرحباً! دعنا نتحدث بالإيطالية. أخبرني شيئاً عن نفسك أو اطلب مني المساعدة في القواعد.',
        timestamp:        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  // ── Send a text / file message ────────────────────────────────────────────
  const sendMessage = useCallback(async (text, file = null) => {
    if (!text?.trim() && !file) return;

    // ── In-flight guard — ignore duplicate clicks ─────────────────────────
    if (isSendingRef.current) return;
    isSendingRef.current = true;

    const timeString  = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentMsgs = allMessages[activeChatId] || [];

    // Optimistic user message
    const tempUserMsg = {
      id:               `temp_user_${Date.now()}`,
      sender:           'user',
      text:             text || '',
      translation:      null,
      extractedVocab:   null,
      extractedGrammar: null,
      fileAttachment:   file
        ? { originalName: file.name, mimeType: file.type, size: file.size }
        : null,
      timestamp: timeString,
    };

    setAllMessages(prev => ({ ...prev, [activeChatId]: [...currentMsgs, tempUserMsg] }));
    setChats(prev => prev.map(c =>
      c.id === activeChatId
        ? { ...c, preview: (text || file?.name || '').slice(0, 40) }
        : c
    ));

    setIsTyping(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      // message is required by the validator — always send at least a placeholder
      const msgText = text?.trim() || (file ? `[File: ${file.name}]` : '(empty)');
      formData.append('message', msgText);
      if (activeChatId && activeChatId !== 'null') {
        formData.append('conversationId', activeChatId);
      }
      if (file) formData.append('file', file);

      const res  = await chatAPI.sendMessage(formData, (pct) => setUploadProgress(pct));
      const data = res.data.data;

      const realUserMsg = data.userMessage
        ? normaliseMessage(data.userMessage)
        : { ...tempUserMsg, id: `user_${Date.now()}` };

      const aiMsg = {
        id:               data.aiMessage?.id || `ai_${Date.now()}`,
        sender:           'ai',
        text:             data.italianText,
        translation:      data.arabicTranslation,
        extractedVocab:   data.extractedVocab   ?? null,
        extractedGrammar: data.extractedGrammar ?? null,
        fileAttachment:   null,
        timestamp:        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setAllMessages(prev => ({
        ...prev,
        [activeChatId]: [...currentMsgs, realUserMsg, aiMsg],
      }));

      const activeChat = chats.find(c => c.id === activeChatId);
      if (activeChat?.title === 'Nuova conversazione') {
        const newTitle = (text || file?.name || 'File').slice(0, 30);
        setChats(prev => prev.map(c =>
          c.id === activeChatId ? { ...c, title: newTitle } : c
        ));
      }

      incrementConversations();

    } catch (err) {
      console.error('Chat error:', err);
      const { itText, arText } = buildErrorMessage(err, timeString);

      setAllMessages(prev => ({
        ...prev,
        [activeChatId]: [
          ...currentMsgs,
          tempUserMsg,
          {
            id:               `err_${Date.now()}`,
            sender:           'ai',
            text:             itText,
            translation:      arText,
            timestamp:        timeString,
            extractedVocab:   null,
            extractedGrammar: null,
            fileAttachment:   null,
          },
        ],
      }));
    } finally {
      setIsTyping(false);
      setUploadProgress(0);
      isSendingRef.current = false;   // unlock for next message
    }
  }, [activeChatId, allMessages, chats, incrementConversations]);

  // ── Send a voice message ──────────────────────────────────────────────────
  const sendVoiceMessage = useCallback(async (audioBlob) => {
    if (isSendingRef.current) return;
    isSendingRef.current = true;

    setIsTyping(true);
    const timeString  = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentMsgs = allMessages[activeChatId] || [];

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.webm');
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
        timestamp:        timeString,
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

      setAllMessages(prev => ({
        ...prev,
        [activeChatId]: [...currentMsgs, userMsg, aiMsg],
      }));

      incrementConversations();

    } catch (err) {
      console.error('Voice error:', err);
      const { itText, arText } = buildErrorMessage(err, timeString);

      setAllMessages(prev => ({
        ...prev,
        [activeChatId]: [
          ...currentMsgs,
          {
            id:               `err_${Date.now()}`,
            sender:           'ai',
            text:             itText,
            translation:      arText,
            timestamp:        timeString,
            extractedVocab:   null,
            extractedGrammar: null,
            fileAttachment:   null,
          },
        ],
      }));
    } finally {
      setIsTyping(false);
      setIsListening(false);
      isSendingRef.current = false;
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
        messages:      allMessages[activeChatId] || [],
        isTyping,
        isListening,
        uploadProgress,
        isSending:     isSendingRef,   // expose ref so UI can disable the send button
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
  if (!ctx) throw new Error("useChat deve essere utilizzato all'interno di un ChatProvider");
  return ctx;
};
