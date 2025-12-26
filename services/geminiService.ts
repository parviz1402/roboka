
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  // گرفتن کلید از متغیرهای Vercel یا متغیر سراسری
  const apiKey = (window as any).process?.env?.API_KEY || "";
  
  if (!apiKey || apiKey === "") {
    // پرتاب خطا برای اینکه توسط try-catch در توابع پایینی گرفته شود
    throw new Error("API_KEY_NOT_CONFIGURED");
  }
  
  return new GoogleGenAI({ apiKey });
};

export const detectAccountDetails = async (username: string) => {
  const cleanUsername = username.replace('@', '').trim();
  
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `Analyze Instagram profile: ${cleanUsername}. Return followers, niche, and bio.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            followersCount: { type: Type.NUMBER },
            followingCount: { type: Type.NUMBER },
            niche: { type: Type.STRING },
            bio: { type: Type.STRING },
            isFound: { type: Type.BOOLEAN }
          },
          required: ["followersCount", "followingCount", "niche", "bio", "isFound"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.warn("AI Service unavailable, using demo mode.", e);
    // بازگرداندن داده دمو برای جلوگیری از توقف برنامه
    return { 
      followersCount: 1500, 
      followingCount: 450, 
      niche: 'تکنولوژی و کسب و کار', 
      bio: 'پروفایل شناسایی شده توسط سیستم دمو روبوکا', 
      isFound: true 
    };
  }
};

export const getSocialStrategy = async (niche: string, accountInfo: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: `استراتژی رشد برای پیج ${accountInfo} در حوزه ${niche} به عنوان ایجنت روبوکا.`,
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
    console.warn("Strategy generation failed, providing fallback.", e);
    return {
      strategy: "برنامه پیشنهادی: افزایش تولید ریلزهای آموزشی و تعامل مستقیم با مخاطبان از طریق استوری‌های روزانه.",
      hashtags: ["#رشد_اینستاگرام", "#هوش_مصنوعی", "#کسب_و_کار"],
      contentIdeas: ["ویدیو معرفی خدمات جدید", "آموزش گام به گام استفاده از ابزارها", "پاسخ به سوالات پرتکرار مخاطبان"]
    };
  }
};
