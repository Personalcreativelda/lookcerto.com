
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  /**
   * Motor de Renderização LookCerto v4.7 
   * Tecnologia: Neural Cloth Draping & Texture Synthesis
   */
  async generateMockup(
    personBase64: string,
    productBase64: string,
    category: string,
    additionalPrompt: string = ""
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prompt otimizado para fusão total de pixels (Image-to-Image Seamless Swap)
    const prompt = `FASHION AI TASK: HIGH-FIDELITY VIRTUAL TRY-ON.
    - IMAGE 1 (SOURCE): The human model and background.
    - IMAGE 2 (TARGET): The exact outfit/clothing to be worn.
    
    STRICT INSTRUCTIONS:
    1. SEAMLESS REPLACEMENT: Completely replace the person's current clothes in Image 1 with the FULL OUTFIT shown in Image 2.
    2. NEURAL DRAPING: The new clothes must wrap realistically around the body's anatomy, respecting pose, muscle contours, and fabric folds.
    3. PIXEL INTEGRITY: Maintain 100% of the person's face, skin tone, hair, hands, and the original background from Image 1.
    4. PHOTOREALISM: Match the lighting, shadows, and environment reflections from Image 1 onto the new fabric from Image 2.
    5. CATEGORY CONTEXT: This is a ${category} item. Ensure perfect fit and professional retouching finish.
    
    OUTPUT: Return ONLY the final synthesized image. No text, no frames, no side-by-side.`;

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
        throw new Error("O motor de IA não conseguiu processar a síntese. Tente fotos com iluminação direta.");
      }

      // Extração robusta do binário gerado
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }

      if (response.candidates[0].finishReason === 'SAFETY') {
        throw new Error("A imagem foi filtrada por segurança. Certifique-se de que as fotos são apropriadas.");
      }

      throw new Error("Erro na síntese: A IA não retornou a imagem processada.");
    } catch (error: any) {
      console.error("Critical Engine Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
