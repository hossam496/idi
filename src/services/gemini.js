import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI client using the environment variable
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

// Reusable system instructions for the language learning assistant
const SYSTEM_INSTRUCTION = `
You are IDI, a highly supportive and professional AI tutor for the IDI language learning platform.
You must support Arabic, Italian, and English.
Your primary role is to help the user practice and learn Italian.
Analyze the user's message, continue the conversation in Italian, and provide an Arabic translation for your response.
Additionally, you should dynamically extract a useful vocabulary item or a grammar rule if relevant to the context of the conversation.

You MUST respond in JSON format conforming strictly to this structure:
{
  "text": "The primary response in Italian, continuing the language learning conversation.",
  "translation": "The Arabic translation of your response text.",
  "extractedVocab": {
    "italianWord": "An interesting or key Italian word from your response (optional, null if not applicable).",
    "arabicTranslation": "Arabic translation of that word.",
    "pronunciation": "Phonetic Italian pronunciation of that word in Arabic characters (e.g. 'بيا-تشي-ري').",
    "example": "An example sentence in Italian using the word.",
    "partOfSpeech": "Part of speech (e.g. Sostantivo, Verbo, Aggettivo, Pronome, Avverbio)"
  },
  "extractedGrammar": {
    "title": "A title of the grammar rule highlighted in the conversation (optional, null if not applicable).",
    "italianExplanation": "Explanation of the rule in Italian.",
    "arabicExplanation": "Explanation of the rule in Arabic.",
    "examples": [
      {
        "it": "Example sentence in Italian.",
        "ar": "Arabic translation of the example sentence."
      }
    ],
    "difficulty": "Difficulty level: Principiante, Intermedio, or Avanzato"
  }
}
`;

// Schema definition matching the requested JSON output structure
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    text: { type: "STRING" },
    translation: { type: "STRING" },
    extractedVocab: {
      type: "OBJECT",
      properties: {
        italianWord: { type: "STRING" },
        arabicTranslation: { type: "STRING" },
        pronunciation: { type: "STRING" },
        example: { type: "STRING" },
        partOfSpeech: { type: "STRING" }
      },
      required: ["italianWord", "arabicTranslation", "pronunciation", "example", "partOfSpeech"]
    },
    extractedGrammar: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        italianExplanation: { type: "STRING" },
        arabicExplanation: { type: "STRING" },
        examples: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              it: { type: "STRING" },
              ar: { type: "STRING" }
            },
            required: ["it", "ar"]
          }
        },
        difficulty: { type: "STRING" }
      },
      required: ["title", "italianExplanation", "arabicExplanation", "examples", "difficulty"]
    }
  },
  required: ["text", "translation"]
};

/**
 * Handles and maps Gemini API/Network errors to clean, user-friendly messages.
 * @param {Error} error The caught error object
 * @returns {Error} A mapped error with a readable message
 */
function handleGeminiError(error) {
  const message = error.message || String(error);
  const status = error.status;
  const lowercaseMsg = message.toLowerCase();

  // 1. Timeout Errors
  if (message === "Timeout" || lowercaseMsg.includes("timeout") || lowercaseMsg.includes("aborted")) {
    return new Error("La richiesta ha impiegato troppo tempo. Controlla la tua connessione e riprova. / The request timed out. Please check your connection and try again.");
  }

  // 2. Invalid API Key Errors
  if (
    lowercaseMsg.includes("api key") || 
    lowercaseMsg.includes("invalid") || 
    lowercaseMsg.includes("key not valid") || 
    lowercaseMsg.includes("api_key_invalid") ||
    status === 400 || 
    status === 403
  ) {
    return new Error("Chiave API di Gemini non valida. Verifica la configurazione nel file .env. / Invalid Gemini API Key. Please verify your .env configuration.");
  }

  // 3. Quota Exceeded / Rate Limit Errors
  if (lowercaseMsg.includes("quota") || lowercaseMsg.includes("limit") || lowercaseMsg.includes("exhausted") || status === 429) {
    return new Error("Limite di richieste superato o quota esaurita. Attendi un momento prima di riprovare. / API Rate limit exceeded or quota exhausted. Please wait a moment and try again.");
  }

  // 4. Network/Connection Errors
  if (lowercaseMsg.includes("fetch") || lowercaseMsg.includes("network") || lowercaseMsg.includes("failed to fetch") || lowercaseMsg.includes("offline")) {
    return new Error("Errore di rete. Assicurati di essere connesso a Internet. / Network error. Please ensure you are connected to the Internet.");
  }

  // Generic Error Fallback
  return new Error(`Errore di comunicazione con Gemini: ${error.message || "Errore sconosciuto"} / Gemini communication error: ${error.message || "Unknown error"}`);
}

/**
 * Sends a message along with conversation history to the Gemini API.
 * Supports loading states (via promise duration), timeout handling, and automatic retry once.
 * 
 * @param {string} message The current user message
 * @param {Array} history The previous message history
 * @returns {Promise<string>} The generated text response (JSON string)
 */
export async function sendMessage(message, history = []) {
  // Format the history list to conform with the Gemini API expectations (roles: user, model)
  const formattedContents = [
    ...history.map(item => {
      // If it's already in the expected API format
      if (item.role && item.parts) {
        return item;
      }
      // Map custom ChatContext message format
      return {
        role: item.sender === "ai" ? "model" : "user",
        parts: [{ text: item.text }]
      };
    }),
    {
      role: "user",
      parts: [{ text: message }]
    }
  ];

  let attempts = 0;
  const maxAttempts = 2; // Retry once if it fails

  while (attempts < maxAttempts) {
    attempts++;
    
    // Create an AbortController for custom timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20-second timeout limit

    try {
      // Call Google GenAI SDK
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: RESPONSE_SCHEMA,
        },
        // Pass the abort signal for request cancellation on timeout
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      if (!response || !response.text) {
        throw new Error("Nessuna risposta ricevuta da Gemini. / Empty response received from Gemini.");
      }

      return response.text;

    } catch (error) {
      clearTimeout(timeoutId);

      // If we have attempts remaining, wait 1 second and retry
      if (attempts < maxAttempts) {
        console.warn(`Gemini call failed (attempt ${attempts}/${maxAttempts}). Retrying in 1s...`, error);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      // No attempts left, map and throw readable, localized error
      throw handleGeminiError(error);
    }
  }
}
