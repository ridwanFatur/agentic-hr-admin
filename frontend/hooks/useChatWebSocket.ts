"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/lib/auth/session";
import { ChatMessage, WsMessage } from "@/lib/types/chat";

interface UseChatWebSocketOptions {
  chatId: string | null;
  onTitleChange?: (title: string) => void;
}

interface UseChatWebSocketReturn {
  messages: ChatMessage[];
  streamingContent: string;
  isConnected: boolean;
  isStreaming: boolean;
  sendMessage: (text: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Converts an http(s) base URL to ws(s).
 */
function toWsUrl(base: string): string {
  return base.replace(/^https/, "wss").replace(/^http/, "ws");
}

export function useChatWebSocket({
  chatId,
  onTitleChange,
}: UseChatWebSocketOptions): UseChatWebSocketReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const streamingRef = useRef("");

  // ------------------------------------------------------------------ //
  //  Connect / disconnect when chatId changes                            //
  // ------------------------------------------------------------------ //
  useEffect(() => {
    if (!chatId) return;

    const token = getAccessToken();
    if (!token) return;

    const wsBase = toWsUrl(API_URL);
    const url = `${wsBase}/api/v1/chats/${chatId}/ws?token=${encodeURIComponent(token)}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event: MessageEvent) => {
      let msg: WsMessage;
      try {
        msg = JSON.parse(event.data as string) as WsMessage;
      } catch {
        return;
      }

      if (msg.type === "chunk") {
        streamingRef.current += msg.content;
        setStreamingContent(streamingRef.current);
        setIsStreaming(true);
      } else if (msg.type === "done") {
        const finalContent = msg.content || streamingRef.current;

        // Flush streaming bubble → real message
        if (finalContent) {
          const newMsg: ChatMessage = {
            id: msg.message_id ?? crypto.randomUUID(),
            chat_id: chatId,
            role: "assistant",
            content: finalContent,
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, newMsg]);
        }

        // Auto-rename notification
        if (msg.chat_title) {
          onTitleChange?.(msg.chat_title);
        }

        streamingRef.current = "";
        setStreamingContent("");
        setIsStreaming(false);
      } else if (msg.type === "error") {
        console.error("WS error from server:", msg.detail);
        streamingRef.current = "";
        setStreamingContent("");
        setIsStreaming(false);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsStreaming(false);
    };

    ws.onerror = () => {
      setIsConnected(false);
      setIsStreaming(false);
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setIsConnected(false);
      setIsStreaming(false);
      streamingRef.current = "";
      setStreamingContent("");
    };
  }, [chatId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------------------------------------ //
  //  Send                                                                //
  // ------------------------------------------------------------------ //
  const sendMessage = useCallback(
    (text: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      if (isStreaming) return;

      // Optimistically add user message to UI
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        chat_id: chatId ?? "",
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Show typing indicator immediately — before the first chunk arrives
      streamingRef.current = "";
      setStreamingContent("");
      setIsStreaming(true);

      wsRef.current.send(JSON.stringify({ message: text }));
    },
    [chatId, isStreaming]
  );

  return {
    messages,
    streamingContent,
    isConnected,
    isStreaming,
    sendMessage,
    setMessages,
  };
}
