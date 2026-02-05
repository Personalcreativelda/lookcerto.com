
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Serviço para gerir o upload de imagens para S3 ou MinIO.
 * As credenciais são lidas das variáveis de ambiente.
 */
export class StorageService {
  private client: S3Client | null = null;

  private getClient() {
    if (!this.client) {
      // Nota: Em produção, o ideal é usar pre-signed URLs via backend para segurança.
      // Esta implementação assume que as chaves estão disponíveis no ambiente para o MVP.
      this.client = new S3Client({
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY || "",
          secretAccessKey: process.env.S3_SECRET_KEY || "",
        },
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
      });
    }
    return this.client;
  }

  /**
   * Converte base64 para buffer/blob e envia para o bucket.
   * @returns URL pública da imagem
   */
  async uploadBase64Image(base64Data: string, fileName: string): Promise<string> {
    const client = this.getClient();
    const bucket = process.env.S3_BUCKET_NAME;

    // Remover prefixo data:image/...;base64,
    const base64Content = base64Data.split(",")[1];
    const buffer = Uint8Array.from(atob(base64Content), (c) => c.charCodeAt(0));

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: `mockups/${fileName}.jpg`,
      Body: buffer,
      ContentType: "image/jpeg",
      // ACL: 'public-read' // Depende da configuração do seu bucket MinIO
    });

    try {
      await client.send(command);
      
      // Constrói a URL de retorno baseada no endpoint e bucket
      const baseUrl = process.env.S3_ENDPOINT?.replace(/\/$/, "");
      return `${baseUrl}/${bucket}/mockups/${fileName}.jpg`;
    } catch (error) {
      console.error("Erro no upload para S3/MinIO:", error);
      // Fallback para a própria string base64 se o upload falhar, para não travar o app
      return base64Data;
    }
  }
}

export const storageService = new StorageService();
