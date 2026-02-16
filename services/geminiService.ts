
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType, Subject } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateSampleQuestions(
  subject: string,
  className: string,
  type: QuestionType,
  count: number = 3
): Promise<Question[]> {
  const prompt = `Generate ${count} professional exam questions for ${className} ${subject}. 
  The question type must be exactly "${type}".
  Include marks for each question.
  Return the result as a JSON array of objects fitting the Question interface.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              text: { type: Type.STRING },
              marks: { type: Type.NUMBER },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              passage: { type: Type.STRING }
            },
            required: ["type", "text", "marks"]
          }
        }
      }
    });

    const data = JSON.parse(response.text);
    return data.map((q: any) => ({
      ...q,
      id: Math.random().toString(36).substr(2, 9),
      type: type // Ensure correct type
    }));
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
}
