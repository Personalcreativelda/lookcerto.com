
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  /**
   * Motor de Renderização LookCerto v4.6
   * Especializado em Síntese de Vestuário (Virtual Try-On)
   */
  async generateMockup(
    personBase64: string,
    productBase64: string,
    category: string,
    additionalPrompt: string = ""
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prompt de Engenharia Reversa de Imagem para Síntese
    const prompt = `INSTRUCTION: Virtual Try-On Synthesis.
    - INPUT 1: Target Person (Model).
    - INPUT 2: Garment/Clothing (${category}).
    
    TASK:
    1. Extract the clothing from Input 2.
    2. Place and wrap it perfectly onto the person's body in Input 1.
    3. Respect human anatomy, limb positions, and perspective.
    4. Match lighting, shadows, and skin-tone reflections from Input 1 onto the new garment.
    5. KEEP the person's head, face, hands, and background 100% IDENTICAL to Input 1.
    6. Ensure fabric folds and textures look realistic.
    
    OUTPUT: A single integrated high-resolution photo. NO TEXT. NO SPLIT SCREEN.
    ${additionalPrompt}`;

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

      if (!response.candidates?.[0]?.content?.parts) {
        throw new Error("Resposta incompleta da IA. Tente fotos com melhor contraste.");
      }

      // Procura rigorosa por dados binários de imagem
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }

      if (response.candidates[0].finishReason === 'SAFETY') {
        throw new Error("A imagem foi bloqueada pelos filtros de segurança. Evite roupas íntimas ou poses sugestivas.");
      }

      throw new Error("Falha ao sintetizar imagem. O modelo retornou apenas texto.");
    } catch (error: any) {
      console.error("Gemini Synthesis Engine Failure:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
