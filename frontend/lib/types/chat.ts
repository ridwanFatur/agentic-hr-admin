export interface ChatMessage {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatDetail extends Chat {
  messages: ChatMessage[];
}

export interface ChatListResponse {
  items: Chat[];
  total: number;
}

export interface ChatCreate {
  title?: string;
}

export interface ChatUpdate {
  title: string;
}

// WebSocket message types
export type WsChunk = { type: "chunk"; content: string };
export type WsDone = {
  type: "done";
  content: string;
  message_id: string | null;
  chat_title?: string;
};
export type WsError = { type: "error"; detail: string };
export type WsMessage = WsChunk | WsDone | WsError;
