"use client";

import { createContext, useContext } from "react";
import { Chat } from "@/lib/types/chat";

interface ChatContextValue {
  chats: Chat[];
  setChats: (chats: Chat[]) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const ChatContext = createContext<ChatContextValue>({
  chats: [],
  setChats: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export function useChatContext() {
  return useContext(ChatContext);
}
