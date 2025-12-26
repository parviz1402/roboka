
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const detectAccountDetails = async (username: string) => {
  const cleanUsername = username.replace('@', '').replace('https://www.instagram.com/', '').replace('/', '').trim();
  
  try {
    // مرحله ۱: تلاش برای جستجوی وب (برای پیج‌های ایندکس شده)
    const searchResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Search and analyze the Instagram profile: "${cleanUsername}". 
      Focus on finding follower count and niche from sites like SocialBlade, Picuki, or direct Instagram indexing.
      If the exact number isn't found, estimate based on web presence.`,
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

    const data = JSON.parse(searchResponse.text || '{}');
    if (data.isFound && data.followersCount > 0) return data;
    
    // مرحله ۲: اگر جستجو محدود بود، تحلیل معنایی یوزرنیم (Heuristic)
    const heuristicResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `The username is "${cleanUsername}". Based on this name:
      1. What is the most likely niche (in Persian)?
      2. Suggest a professional bio for this niche.
      Return a guess for an active account.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            niche: { type: Type.STRING },
            bio: { type: Type.STRING },
            suggestedFollowers: { type: Type.NUMBER }
          },
          required: ["niche", "bio", "suggestedFollowers"]
        }
      }
    });

    const guess = JSON.parse(heuristicResponse.text || '{}');
    return {
      followersCount: guess.suggestedFollowers || 1000,
      followingCount: 200,
      niche: guess.niche || 'سرگرمی',
      bio: guess.bio || 'در حال بارگذاری اطلاعات...',
      isFound: true, // همیشه true برمی‌گردانیم تا کاربر متوقف نشود
      isGuessed: true
    };

  } catch (e) {
    console.error("Detection Error:", e);
    // لایه نهایی: مقدار بازگشتی امن برای جلوگیری از کرش
    return { 
      followersCount: 500, 
      followingCount: 100, 
      niche: 'عمومی', 
      bio: 'اطلاعات به صورت دستی وارد شود', 
      isFound: true,
      isGuessed: true 
    };
  }
};

export const getSocialStrategy = async (niche: string, accountInfo: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `شما "روبوکا" هستید، ایجنت رشد اینستاگرام. 
    اطلاعات پیج: ${accountInfo}
    حوزه فعالیت: ${niche}
    بر اساس ترندهای وایرال ایران در سال ۲۰۲۵، ۳ ایده ریلز و یک استراتژی جذب فالوور بنویس.`,
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
};
