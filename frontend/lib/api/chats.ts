import api from "./axios";
import {
  Chat,
  ChatCreate,
  ChatDetail,
  ChatListResponse,
  ChatUpdate,
} from "@/lib/types/chat";

export const chatsApi = {
  /**
   * List all chats for the current user (newest first).
   */
  list: async (): Promise<ChatListResponse> => {
    const { data } = await api.get<ChatListResponse>("/api/v1/chats");
    return data;
  },

  /**
   * Get a single chat with its full message history.
   */
  get: async (chatId: string): Promise<ChatDetail> => {
    const { data } = await api.get<ChatDetail>(`/api/v1/chats/${chatId}`);
    return data;
  },

  /**
   * Create a new chat session.
   */
  create: async (payload: ChatCreate = {}): Promise<Chat> => {
    const { data } = await api.post<Chat>("/api/v1/chats", {
      title: payload.title ?? "New Chat",
    });
    return data;
  },

  /**
   * Rename an existing chat.
   */
  rename: async (chatId: string, payload: ChatUpdate): Promise<Chat> => {
    const { data } = await api.patch<Chat>(`/api/v1/chats/${chatId}`, payload);
    return data;
  },

  /**
   * Soft-delete a chat.
   */
  delete: async (chatId: string): Promise<void> => {
    await api.delete(`/api/v1/chats/${chatId}`);
  },
};
