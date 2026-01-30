
export enum ViewMode {
  CHAT = 'chat',
  IMAGE = 'image',
  LIVE = 'live'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}
