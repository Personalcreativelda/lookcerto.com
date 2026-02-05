
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  /**
   * Gera o mockup usando o modelo Gemini 2.5 Flash Image.
   */
  async generateMockup(
    personBase64: string,
    productBase64: string,
    category: string,
    additionalPrompt: string = ""
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `ATUE COMO UM FOTÓGRAFO PROFISSIONAL DE MODA E ESPECIALISTA EM IA.
    
    TAREFA: VIRTUAL TRY-ON (PROVADOR VIRTUAL).
    
    INSTRUÇÕES:
    1. Pegue a pessoa na IMAGEM 1 e vista nela a roupa da IMAGEM 2.
    2. Mantenha o rosto, corpo e fundo originais da IMAGEM 1.
    3. Ajuste a roupa (${category}) perfeitamente às curvas e pose da pessoa.
    4. Combine a iluminação e sombras para realismo extremo.
    5. Se a nova roupa mostrar mais pele, gere pele realista compatível.
    
    PROIBIDO: Colagens, trocar o rosto ou alterar o cenário de fundo.
    ${additionalPrompt}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: "IMAGEM 1 (PESSOA):" },
            {
              inlineData: {
                data: personBase64.split(',')[1],
                mimeType: 'image/jpeg',
              },
            },
            { text: "IMAGEM 2 (PRODUTO):" },
            {
              inlineData: {
                data: productBase64.split(',')[1],
                mimeType: 'image/jpeg',
              },
            },
            { text: prompt },
          ],
        },
      });

      const candidate = response.candidates?.[0];
      if (!candidate) throw new Error("Sem resposta da IA.");

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }

      throw new Error(response.text || "Falha na geração da imagem.");
    } catch (error: any) {
      console.error("Erro no Gemini:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
