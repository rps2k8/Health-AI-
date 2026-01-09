
import { GoogleGenAI, Type } from "@google/genai";
import { UserLifestyleData, RiskLevel } from "../types.ts";

export const getAIInsights = async (
  userData: UserLifestyleData, 
  bmi: number, 
  riskLevel: RiskLevel
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  
  const prompt = `
    Analyze this lifestyle data for a ${userData.age} year old.
    BMI: ${bmi}.
    Smoking: ${userData.isSmoking ? 'Yes' : 'No'}.
    Drinking: ${userData.isDrinking ? 'Yes' : 'No'}.
    Activity: ${userData.activityLevel}.
    Stress: ${userData.stressLevel}/10.
    Calculated Risk Level: ${riskLevel}.

    Provide exactly 3 short, actionable lifestyle suggestions.
    Strict Rules:
    - Use friendly, non-medical tone.
    - DO NOT use disease names, medical terminology, or treatment advice.
    - Focus on preventive awareness.
    - Each suggestion should be under 15 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [
      "Consider integrating small periods of movement into your daily routine.",
      "Mindful breathing techniques could help balance daily stress spikes.",
      "Maintaining consistent hydration supports overall metabolic energy."
    ];
  }
};
