import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from '../types';

/**
 * aiService.ts - The Detection Engine powered by Gemini
 */

const getAI = () => {
  const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please set it in the environment or use the key selector.");
  }
  return new GoogleGenAI({ apiKey });
};

const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * AI-based Profile Forensic Analysis
 */
export const analyzeProfile = async (username: string): Promise<AuditResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Perform a forensic analysis on the social media profile: ${username}. 
    Determine a trust score (0-100) where 100 is highly authentic and 0 is definitely a bot/scam.
    Provide specific evidence for your score.
    Return the result in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          isAI: { type: Type.BOOLEAN }
        },
        required: ["score", "evidence", "isAI"]
      }
    }
  });

  const result = JSON.parse(response.text);

  return {
    id: generateId('audit'),
    type: 'profile',
    input: username,
    score: result.score,
    evidence: result.evidence,
    details: { isAI: result.isAI },
    timestamp: new Date().toISOString()
  };
};

/**
 * AI-based Content Forensic (AI Image/Text Detection)
 */
export const analyzeContent = async (input: string): Promise<AuditResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following content for synthetic or fraudulent patterns: "${input}".
    Determine a trust score (0-100) and provide evidence.
    Return the result in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          isAI: { type: Type.BOOLEAN }
        },
        required: ["score", "evidence", "isAI"]
      }
    }
  });

  const result = JSON.parse(response.text);

  return {
    id: generateId('content'),
    type: 'content',
    input: input,
    score: result.score,
    evidence: result.evidence,
    details: { isAI: result.isAI },
    timestamp: new Date().toISOString()
  };
};

/**
 * AI-based Profile Duel (Compare 2 Users)
 */
export const analyzeDuel = async (user1: string, user2: string): Promise<AuditResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Compare these two profiles forensicly: "${user1}" and "${user2}".
    Identify which one is more likely to be the original and which one is the imposter.
    Determine if they are both fake.
    Return a trust score representing the confidence in this assessment (0-100).
    Return the result in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          evidence: { type: Type.ARRAY, items: { type: Type.STRING } },
          original: { type: Type.STRING },
          imposter: { type: Type.STRING },
          isDuplicate: { type: Type.BOOLEAN },
          bothFake: { type: Type.BOOLEAN }
        },
        required: ["score", "evidence", "original", "imposter", "isDuplicate", "bothFake"]
      }
    }
  });

  const result = JSON.parse(response.text);

  return {
    id: generateId('duel'),
    type: 'duel',
    input: `${user1} vs ${user2}`,
    score: result.score,
    evidence: result.evidence,
    details: { 
      original: result.original, 
      imposter: result.imposter, 
      isDuplicate: result.isDuplicate, 
      bothFake: result.bothFake 
    },
    timestamp: new Date().toISOString()
  };
};

/**
 * Helper to generate background images (using Gemini Flash Image)
 */
export const generateBackgroundImage = async (prompt: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high-quality, atmospheric, dark forensic aesthetic background: ${prompt}` }],
      },
      config: {
        imageConfig: { aspectRatio: "16:9", imageSize: "1K" }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (e) {
    console.error("Gemini Image Generation failed, using fallback", e);
    return 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop';
  }
};

