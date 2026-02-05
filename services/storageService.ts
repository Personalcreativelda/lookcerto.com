import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Serviço para gerir o upload de imagens para o MinIO.
 */
export class StorageService {
  private client: S3Client | null = null;

  private getClient() {
    if (!this.client) {
      const endpoint = process.env.MINIO_ENDPOINT;
      
      // Validação crítica para evitar o erro "Invalid URL"
      if (!endpoint || endpoint === "" || endpoint === "undefined") {
        console.error("ERRO CRÍTICO: MINIO_ENDPOINT não está definido no ambiente!");
        return null;
      }

      const formattedEndpoint = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
      
      try {
        // Testa se a URL é válida antes de passar para o SDK
        new URL(formattedEndpoint);
        
        this.client = new S3Client({
          endpoint: formattedEndpoint,
          region: process.env.MINIO_REGION || "us-east-1",
          credentials: {
            accessKeyId: process.env.MINIO_ACCESS_KEY || "",
            secretAccessKey: process.env.MINIO_SECRET_KEY || "",
          },
          forcePathStyle: true,
        });
      } catch (e) {
        console.error("ERRO: URL do MinIO inválida:", formattedEndpoint);
        return null;
      }
    }
    return this.client;
  }

  /**
   * Converte base64 para Blob e envia para o bucket.
   */
  async uploadBase64Image(base64Data: string, fileName: string): Promise<string> {
    const client = this.getClient();
    if (!client) {
      console.warn("Storage não configurado. Retornando base64.");
      return base64Data;
    }

    const bucket = process.env.MINIO_BUCKET || "typebot";

    try {
      // Conversão manual de base64 para Blob (mais segura para imagens grandes)
      const parts = base64Data.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);

      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }

      const blob = new Blob([uInt8Array], { type: contentType });

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: `mockups/${fileName}.jpg`,
        Body: blob,
        ContentType: "image/jpeg",
      });

      await client.send(command);
      
      const publicBaseUrl = process.env.MINIO_PUBLIC_URL || process.env.MINIO_ENDPOINT;
      const cleanBaseUrl = publicBaseUrl?.startsWith('http') ? publicBaseUrl : `https://${publicBaseUrl}`;
      const finalUrl = `${cleanBaseUrl.replace(/\/$/, "")}/${bucket}/mockups/${fileName}.jpg`;
      
      console.log("Upload MinIO Sucesso:", finalUrl);
      return finalUrl;
    } catch (error: any) {
      console.error("Erro no upload para MinIO:", error.message || error);
      return base64Data;
    }
  }
}

export const storageService = new StorageService();