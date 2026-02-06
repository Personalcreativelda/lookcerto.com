
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  /**
   * Motor de Renderização LookCerto v4.5
   * Modelo: gemini-2.5-flash-image (Especializado em Edição e Geração de Imagem)
   */
  async generateMockup(
    personBase64: string,
    productBase64: string,
    category: string,
    additionalPrompt: string = ""
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prompt conciso focado em Edição de Imagem (Image-to-Image)
    const prompt = `Task: Virtual Try-On / Image Synthesis.
    Input 1: Target Person.
    Input 2: Clothing Item (${category}).
    
    Instructions:
    1. Perfect Physical Integration: Seamlessly wrap the clothing from Input 2 onto the person in Input 1.
    2. Body Mapping: Follow the person's exact anatomy, posture, and limb positioning. 
    3. Lighting & Shadows: Match the environment lighting from Input 1 perfectly on the new garment. Add realistic contact shadows.
    4. Preservation: Keep the person's identity, face, hands, and background 100% original.
    5. Quality: Output as a single, high-resolution integrated image. No text, no split screens.
    
    ${additionalPrompt}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', // Modelo correto para SAÍDA de imagem
        contents: {
          parts: [
            {
              inlineData: {
                data: personBase64.split(',')[1],
                mimeType: 'image/jpeg',
              },
            },
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
      if (!candidate) throw new Error("A API não retornou candidatos válidos.");

      // O gemini-2.5-flash-image retorna a imagem no array de parts
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }

      // Se cair aqui, o modelo pode ter retornado apenas texto (recusa ou erro)
      if (candidate.finishReason === 'SAFETY') {
        throw new Error("A imagem foi bloqueada pelos filtros de segurança. Tente uma pose ou roupa diferente.");
      }

      throw new Error(response.text || "Falha ao extrair imagem da resposta.");
    } catch (error: any) {
      console.error("Gemini Engine Error:", error);
      if (error.message?.includes("429")) {
        throw new Error("Limite de requisições excedido. Aguarde um momento.");
      }
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
