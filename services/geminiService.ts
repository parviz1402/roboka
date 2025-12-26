
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const apiKey = (window as any).process?.env?.API_KEY || "";
  if (!apiKey) throw new Error("API_KEY_NOT_CONFIGURED");
  return new GoogleGenAI({ apiKey });
};

export const detectAccountDetails = async (username: string) => {
  const cleanUsername = username.replace('@', '').trim();
  
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `Search for the Instagram profile "@${cleanUsername}" and find its current follower count, its main content niche (e.g. food, tech, lifestyle), and a short bio summary. Be precise. If exact data isn't found, estimate based on public web mentions.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            followersCount: { type: Type.NUMBER, description: "Current follower count" },
            niche: { type: Type.STRING, description: "Main category of the page" },
            bio: { type: Type.STRING, description: "Short bio or description" },
            isFound: { type: Type.BOOLEAN }
          },
          required: ["followersCount", "niche", "bio", "isFound"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.warn("AI Search failed, using fallback.", e);
    return { followersCount: 0, niche: 'نامشخص', bio: '', isFound: false };
  }
};

export const getSocialStrategy = async (niche: string, accountInfo: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `Design a high-growth strategy for an Instagram page in the "${niche}" niche. The account handle is "${accountInfo}". 
      Include: 1. A core growth strategy (text). 2. Three specific viral content ideas. 3. Five trending hashtags.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategy: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            contentIdeas: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["strategy", "hashtags", "contentIdeas"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return {
      strategy: "تمرکز بر ریلزهای کوتاه و تعامل با فالوورهای رقبا در ساعات اوج مصرف.",
      hashtags: ["#اکسپلوور", "#رشد_پیج", "#اینستاگرام"],
      contentIdeas: ["پشت صحنه کسب و کار", "آموزش سریع", "چالش هفته"]
    };
  }
};
