import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useLearning } from './LearningContext';
import { loadUserData, saveUserData } from '../services/storage';
import { sendMessage as sendGeminiMessage } from '../services/gemini';
import { extractGrammar, saveGrammar } from '../utils/extractGrammar';

const ChatContext = createContext(null);

// Default welcome chat for brand-new users
function createDefaultChats() {
  return {
    chats: [
      {
        id: 'chat_1',
        title: 'Conversazione iniziale',
        date: new Date().toISOString().split('T')[0],
        preview: 'Ciao! Come posso aiutarti oggi?'
      }
    ],
    messages: {
      'chat_1': [
        {
          id: 'msg_0',
          sender: 'ai',
          text: 'Ciao! Sono il tuo tutor IDI alimentato da Intelligenza Artificiale. Come va il tuo apprendimento dell\'italiano oggi?',
          translation: 'مرحباً! أنا معلم معهد IDI المدعوم بالذكاء الاصطناعي. كيف حال تعلمك للغة الإيطالية اليوم؟',
          timestamp: '12:00',
          extractedVocab: {
            italianWord: 'Apprendimento',
            arabicTranslation: 'التعلم / عملية التعلم',
            pronunciation: 'أب-برين-دي-مين-تو',
            example: 'L\'apprendimento di una nuova lingua richiede pazienza.',
            partOfSpeech: 'Sostantivo'
          }
        }
      ]
    }
  };
}

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { addVocabularyItem, addGrammarItem, incrementConversations } = useLearning();

  const [chats, setChats] = useState([]);
  const [allMessages, setAllMessages] = useState({});
  const [activeChatId, setActiveChatId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Re-load user-specific chat data whenever the logged-in user changes
  useEffect(() => {
    if (!user?.id) {
      // User logged out — reset to empty state
      setChats([]);
      setAllMessages({});
      setActiveChatId(null);
      return;
    }

    // Load this user's chat data from namespaced localStorage
    const storedChats = loadUserData(user.id, 'chat_list');
    const storedMessages = loadUserData(user.id, 'chat_messages');

    if (storedChats && storedChats.length > 0) {
      // Existing user — restore their data
      setChats(storedChats);
      setAllMessages(storedMessages || {});
      setActiveChatId(storedChats[0].id);
    } else {
      // Brand-new user — seed with default welcome chat
      const defaults = createDefaultChats();
      setChats(defaults.chats);
      setAllMessages(defaults.messages);
      setActiveChatId(defaults.chats[0].id);

      // Persist defaults immediately
      saveUserData(user.id, 'chat_list', defaults.chats);
      saveUserData(user.id, 'chat_messages', defaults.messages);
    }
  }, [user?.id]);

  // Helper to persist chats + messages for the current user
  const saveChatsAndMessages = useCallback((newChats, newMessages) => {
    setChats(newChats);
    setAllMessages(newMessages);
    if (user?.id) {
      saveUserData(user.id, 'chat_list', newChats);
      saveUserData(user.id, 'chat_messages', newMessages);
    }
  }, [user?.id]);

  const startNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const newChat = {
      id: newChatId,
      title: `Nuova conversazione`,
      date: new Date().toISOString().split('T')[0],
      preview: 'Inizia a digitare...'
    };

    const initialMessages = [
      {
        id: `msg_init_${Date.now()}`,
        sender: 'ai',
        text: 'Ciao! Parliamo in italiano. Dimmi qualcosa su di te o chiedimi aiuto per la grammatica.',
        translation: 'مرحباً! دعنا نتحدث بالإيطالية. أخبرني شيئاً عن نفسك أو اطلب مني المساعدة في القواعد.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    const updatedChats = [newChat, ...chats];
    const updatedMessages = {
      ...allMessages,
      [newChatId]: initialMessages
    };

    setActiveChatId(newChatId);
    saveChatsAndMessages(updatedChats, updatedMessages);
  };

  const selectChat = (id) => {
    setActiveChatId(id);
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: timeString
    };

    const chatMsgs = allMessages[activeChatId] || [];
    const updatedChatMsgs = [...chatMsgs, userMsg];

    // Update the preview in the chats list
    const updatedChats = chats.map(c =>
      c.id === activeChatId ? { ...c, preview: text.slice(0, 40) + (text.length > 40 ? '...' : '') } : c
    );

    const newMessages = {
      ...allMessages,
      [activeChatId]: updatedChatMsgs
    };

    saveChatsAndMessages(updatedChats, newMessages);
    setIsTyping(true);

    try {
      // Call Gemini API passing userMsg text and previous conversation history
      const responseText = await sendGeminiMessage(text, chatMsgs);

      // Parse the JSON output from Gemini
      const responseData = JSON.parse(responseText);

      const aiMsg = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: responseData.text,
        translation: responseData.translation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extractedVocab: responseData.extractedVocab && responseData.extractedVocab.italianWord ? responseData.extractedVocab : null,
        extractedGrammar: responseData.extractedGrammar && responseData.extractedGrammar.title ? responseData.extractedGrammar : null
      };

      const finalMsgs = [...updatedChatMsgs, aiMsg];
      const finalMessagesObj = {
        ...allMessages,
        [activeChatId]: finalMsgs
      };

      // Auto rename chat title if it was default
      const currentChat = chats.find(c => c.id === activeChatId);
      let finalChats = updatedChats;
      if (currentChat && currentChat.title === 'Nuova conversazione') {
        finalChats = updatedChats.map(c =>
          c.id === activeChatId ? { ...c, title: text.slice(0, 20) + (text.length > 20 ? '...' : '') } : c
        );
      }

      saveChatsAndMessages(finalChats, finalMessagesObj);
      incrementConversations();

      // Auto-extract and save grammar rule from response without user interaction
      if (user?.id) {
        const extracted = extractGrammar(responseText);
        if (extracted) {
          saveGrammar(user.id, extracted);
        }
      }
    } catch (error) {
      console.error("Failed to fetch response from Gemini:", error);

      // Create a user-friendly system message bubble indicating the error
      const errorMsg = {
        id: `msg_error_${Date.now()}`,
        sender: 'ai',
        text: error.message || "Si è verificato un errore imprevisto. Riprova più tardi.",
        translation: "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى لاحقاً.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMsgs = [...updatedChatMsgs, errorMsg];
      const finalMessagesObj = {
        ...allMessages,
        [activeChatId]: finalMsgs
      };

      saveChatsAndMessages(chats, finalMessagesObj);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    setIsListening(prev => !prev);
    // Simulate voice detection trigger
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        // Automatically insert a voice-to-text simulation in the chat box later
      }, 3000);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChatId,
        messages: allMessages[activeChatId] || [],
        isTyping,
        isListening,
        startNewChat,
        selectChat,
        sendMessage,
        toggleListening
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat deve essere utilizzato all\'interno di un ChatProvider');
  }
  return context;
};
