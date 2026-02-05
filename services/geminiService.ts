
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  /**
   * Gera o mockup com foco em realismo físico e integração anatômica perfeita.
   */
  async generateMockup(
    personBase64: string,
    productBase64: string,
    category: string,
    additionalPrompt: string = ""
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Prompt avançado para evitar o efeito "adesivo" e bugs de sobreposição
    const prompt = `VOCÊ É UM MOTOR DE RENDERIZAÇÃO DE MODA DE ÚLTIMA GERAÇÃO.
    
    TAREFA: Transferir a roupa da IMAGEM 2 para a pessoa na IMAGEM 1.
    
    PROTOCOLOS DE REALISMO OBRIGATÓRIOS:
    1. VOLUMETRIA 3D: Não apenas sobreponha. Envolva o tecido ao redor do volume das pernas e tronco. O caimento deve respeitar a perspectiva da pose (3D wrapping).
    2. OCLUSÃO DE MEMBROS: Identifique mãos, dedos, braços ou objetos (celular) que estejam à frente do corpo. Estes elementos DEVEM ficar VISÍVEIS e POR CIMA da nova roupa. Jamais cubra os dedos ou mãos da pessoa com o tecido.
    3. EXTRAÇÃO PURA: Na IMAGEM 2, ignore a modelo. Extraia apenas o design, estampa e textura da roupa e aplique-os na anatomia da pessoa da IMAGEM 1.
    4. SOMBRAS E LUZ: Projete sombras de contato (ambient occlusion) onde a roupa toca a pele e entre as pernas. Sincronize a direção da luz da peça com a luz do ambiente da Imagem 1.
    5. CASAMENTO DE TEXTURA: Se a Imagem 1 tiver ruído digital ou for levemente desfocada, aplique o mesmo efeito na peça de roupa para que a fusão pareça uma fotografia real e não um recorte.
    6. CALÇADOS/PÉS: Mantenha os pés da pessoa visíveis ou aplique o calçado da Imagem 2 respeitando a angulação exata do chão na Imagem 1.
    
    CATEGORIA ALVO: ${category === 'Auto-Detectar' ? 'Identificação Automática' : category}.
    ESTILO: Foto comercial realista, bordas suaves, integração total de tecidos.
    ${additionalPrompt}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: "IMAGEM 1 (USUÁRIO REAL):" },
            {
              inlineData: {
                data: personBase64.split(',')[1],
                mimeType: 'image/jpeg',
              },
            },
            { text: "IMAGEM 2 (PRODUTO/LOOK):" },
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
      if (!candidate) throw new Error("A IA falhou em processar a imagem.");

      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          return `data:image/jpeg;base64,${part.inlineData.data}`;
        }
      }

      throw new Error("Resposta sem dados de imagem: " + response.text);
    } catch (error: any) {
      console.error("Erro no processamento Gemini:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
