
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  /**
   * Motor de Renderização LookCerto v4.5
   * Modelo: gemini-2.5-flash-image
   */
  async generateMockup(
    personBase64: string,
    productBase64: string,
    category: string,
    additionalPrompt: string = ""
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Task: Virtual Try-On. 
    Wrap the clothing item from Input 2 onto the person in Input 1. 
    Maintain person's pose and background. Natural lighting. 
    Category: ${category}. ${additionalPrompt}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: personBase64.split(',')[1], mimeType: 'image/jpeg' } },
            { inlineData: { data: productBase64.split(',')[1], mimeType: 'image/jpeg' } },
            { text: prompt },
          ],
        },
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("O motor de IA não gerou uma resposta válida. Verifique as fotos.");
      }

      const candidate = response.candidates[0];

      // Busca segura pela parte de imagem sem disparar getters de texto
      const imagePart = candidate.content?.parts?.find(p => p.inlineData);
      
      if (imagePart?.inlineData?.data) {
        return `data:image/jpeg;base64,${imagePart.inlineData.data}`;
      }

      // Tratamento de segurança
      if (candidate.finishReason === 'SAFETY') {
        throw new Error("A imagem foi filtrada por questões de segurança. Use fotos mais conservadoras.");
      }

      throw new Error("O modelo não retornou uma imagem integrada. Tente novamente.");
    } catch (error: any) {
      console.error("Gemini Critical Error:", error);
      if (error.message?.includes("fetch")) {
        throw new Error("Erro de conexão com o servidor de IA. Verifique sua internet.");
      }
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
