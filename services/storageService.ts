
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Serviço para gerir o upload de imagens. 
 * Agora resiliente: se não houver config, funciona em modo Base64 sem erros.
 */
export class StorageService {
  private client: S3Client | null = null;

  private getClient() {
    try {
      if (this.client) return this.client;

      const endpoint = process.env.MINIO_ENDPOINT;
      if (!endpoint || endpoint === "" || endpoint === "undefined" || endpoint.includes("seu-servidor")) {
        return null; // Modo silencioso: sem storage configurado
      }

      const formattedEndpoint = endpoint.startsWith('http') ? endpoint : `https://${endpoint}`;
      
      this.client = new S3Client({
        endpoint: formattedEndpoint,
        region: process.env.MINIO_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY || "",
          secretAccessKey: process.env.MINIO_SECRET_KEY || "",
        },
        forcePathStyle: true,
      });
      return this.client;
    } catch (e) {
      return null;
    }
  }

  /**
   * Tenta enviar para o S3/MinIO, caso contrário retorna a string base64 original.
   */
  async uploadBase64Image(base64Data: string, fileName: string): Promise<string> {
    const client = this.getClient();
    if (!client) return base64Data;

    const bucket = process.env.MINIO_BUCKET || "lookcerto";

    try {
      const parts = base64Data.split(';base64,');
      if (parts.length < 2) return base64Data;
      
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
      return `${cleanBaseUrl.replace(/\/$/, "")}/${bucket}/mockups/${fileName}.jpg`;
    } catch (error) {
      console.warn("Storage Offline: Usando fallback Base64");
      return base64Data;
    }
  }
}

export const storageService = new StorageService();
