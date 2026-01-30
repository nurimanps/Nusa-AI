
import { GoogleGenAI, GenerateContentResponse, Modality, Blob } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initializing GoogleGenAI with the API key from environment variables.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  /**
   * General Text Chat
   */
  async generateText(prompt: string, history: { role: string; parts: { text: string }[] }[] = []): Promise<string> {
    try {
      const chat = this.ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: "You are NusaAI, a helpful, intelligent, and friendly assistant. You excel at answering questions clearly in Indonesian or English depending on user input.",
        },
      });

      // Simple implementation: send the current prompt
      // In a real app we'd feed history to chats.create, but for this demo we'll use history-aware chat sessions
      const response = await chat.sendMessage({ message: prompt });
      return response.text || "Maaf, saya tidak bisa memproses permintaan itu.";
    } catch (error) {
      console.error("Gemini Text Error:", error);
      return "Terjadi kesalahan saat menghubungi otak saya.";
    }
  }

  /**
   * Image Generation
   */
  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data found in response");
    } catch (error) {
      console.error("Gemini Image Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();

// Live API Helpers
// Implement manually as per guidelines
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Added missing createBlob export
export function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    // The supported audio MIME type is 'audio/pcm'.
    mimeType: 'audio/pcm;rate=16000',
  };
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
