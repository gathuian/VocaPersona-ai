import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const geminiModel = "gemini-3-flash-preview";

export async function generateAvatarDescription(imagePrompt: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Based on this description, provide a detailed JSON for a 3D avatar configuration (skin tone, hair style, eye color, clothing): ${imagePrompt}`,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text || "{}");
}

export async function getSmartGesture(text: string) {
  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: `Analyze this text and suggest a primary gesture (nod, shake, wave, point, neutral) and an emotion (happy, serious, surprised, thinking): "${text}"`,
    config: {
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(response.text || "{}");
}
