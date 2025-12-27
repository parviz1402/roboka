
import { GoogleGenAI, Type } from "@google/genai";

/**
 * تولید پاسخ هوشمند با درک محتوای پست و لحن برند
 */
export const generateCampaignReply = async (
  commentText: string, 
  keyword: string, 
  postCaption: string, 
  tone: 'friendly' | 'professional' | 'funny'
) => {
  try {
    // Create a new instance right before the call to ensure the latest API key is used
    const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Post Content/Caption: "${postCaption}"
      User Comment: "${commentText}"
      Keyword Triggered: "${keyword}"
      Tone of voice: "${tone}"`,
      config: {
        // Use systemInstruction for persona and core logic requirements
        systemInstruction: `You are a professional social media manager assistant.
        Task:
        1. Create a public reply to the user comment in Persian.
        2. Create a private direct message (DM) to the user in Persian.
        
        Requirements:
        - The reply must be contextually relevant to the post content and the specific user comment.
        - If tone is 'funny', use humor and informal Persian (Tehrani dialect).
        - If tone is 'professional', use polite and formal Persian.
        - If tone is 'friendly', be warm and use standard informal Persian.
        - Always include a clear call to action in the DM.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            publicReply: { 
              type: Type.STRING,
              description: 'The public comment reply in Persian.'
            },
            directMessage: { 
              type: Type.STRING,
              description: 'The private DM content in Persian.'
            }
          },
          required: ["publicReply", "directMessage"]
        }
      }
    });

    // Access .text property directly (it's a getter, not a function)
    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Gemini Error:", e);
    return {
      publicReply: "سلام عزیزم! خوشحالم که نظرت رو گفتی. برات دایرکت فرستادم، چک کن. ❤️",
      directMessage: "سلام! این هم اطلاعاتی که برای این پست خواسته بودید. اگر سوالی بود در خدمتم."
    };
  }
};
