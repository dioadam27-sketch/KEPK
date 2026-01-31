import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSelfAssessmentSuggestions = async (
  title: string, 
  description: string
): Promise<{ id: number; suggestion: string }[]> => {
  try {
    const prompt = `
      Saya adalah peneliti yang sedang mengajukan kaji etik (Ethical Clearance).
      Judul Penelitian: "${title}"
      Deskripsi Singkat: "${description}"

      Bantu saya mengisi "Self-Assessment 7 Standar Etik" berdasarkan judul dan deskripsi di atas.
      Berikan saran jawaban singkat dan profesional (Bahasa Indonesia) untuk setiap standar berikut:
      1. Nilai Sosial
      2. Nilai Ilmiah
      3. Pemerataan Beban & Manfaat
      4. Potensi Risiko & Manfaat
      5. Bujukan & Eksploitasi
      6. Kerahasiaan & Privasi
      7. Informed Consent
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER, description: "Nomor standar (1-7)" },
              suggestion: { type: Type.STRING, description: "Saran jawaban untuk form self assessment" }
            },
            required: ["id", "suggestion"],
            propertyOrdering: ["id", "suggestion"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Gagal mendapatkan saran dari AI.");
  }
};
