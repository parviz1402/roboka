
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Generates a smart reply for an Instagram comment using Gemini AI.
 * Follows @google/genai guidelines for initialization and model selection.
 */
export const generateSmartReply = async (commentText: string, keyword: string, niche: string) => {
  try {
    // Initializing Gemini with the provided API key as per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for basic text tasks (summarization, Q&A, management).
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an AI Social Media Manager for a "${niche}" page. 
      A user commented: "${commentText}". 
      The trigger keyword was: "${keyword}".
      Generate:
      1. A short, friendly public reply to the comment (Persian).
      2. A personalized DM (Direct Message) to send them (Persian), including a call to action.
      Avoid sounding like a bot. Use emojis.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            publicReply: { 
              type: Type.STRING,
              description: "A friendly public response in Persian."
            },
            directMessage: { 
              type: Type.STRING, 
              description: "A personalized direct message in Persian."
            }
          },
          required: ["publicReply", "directMessage"]
        }
      }
    });

    // Accessing the .text property directly as per documentation.
    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Gemini API Error:", e);
    // Graceful fallback for the user experience.
    return {
      publicReply: "سلام! براتون ارسال شد. چک کنید. 🙏",
      directMessage: "سلام دوست عزیز! طبق قولی که داده بودیم، این هم لینکی که میخواستید. سوالی بود در خدمتم."
    };
  }
};
