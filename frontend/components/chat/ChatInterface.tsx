"use client";

import { useEffect, useRef, useState } from "react";
import ChatMessageBubble, { StreamingBubble } from "./ChatMessageBubble";
import ChatInput from "./ChatInput";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { ChatDetail, ChatMessage } from "@/lib/types/chat";

interface ChatInterfaceProps {
  chat: ChatDetail;
  onTitleChange?: (title: string) => void;
  mobileMenuOpen?: boolean;
  onMobileMenuOpen?: () => void;
}

export default function ChatInterface({
  chat,
  onTitleChange,
  mobileMenuOpen,
  onMobileMenuOpen,
}: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    streamingContent,
    isConnected,
    isStreaming,
    sendMessage,
    setMessages,
  } = useChatWebSocket({
    chatId: chat.id,
    onTitleChange,
  });

  // Seed messages from REST response on initial load / chat switch
  useEffect(() => {
    setMessages(chat.messages as ChatMessage[]);
  }, [chat.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on new messages / streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const isEmpty = messages.length === 0 && !streamingContent;

  return (
    <div className="flex h-full flex-col bg-gray-50">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          className="cursor-pointer rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          aria-label="Open sidebar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex flex-1 items-center gap-2 min-w-0">
          <svg className="h-5 w-5 shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h1 className="truncate text-sm font-semibold text-gray-900">{chat.title}</h1>
        </div>

        {/* Connection status */}
        <div className="flex shrink-0 items-center gap-1.5 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-gray-300"}`}
          />
          <span className={isConnected ? "text-emerald-600" : "text-gray-400"}>
            {isConnected ? "Connected" : "Connecting…"}
          </span>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-5">
          {isEmpty ? (
            /* Welcome / empty state */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                </svg>
              </div>
              <h2 className="mb-1 text-lg font-semibold text-gray-800">HR Assistant</h2>
              <p className="max-w-sm text-sm text-gray-500">
                Ask me anything about your companies, employees, attendance, leave, payroll, or
                performance data.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  "How many employees do I have in total?",
                  "Show me attendance records for this month",
                  "Which employees are on leave right now?",
                  "Summarize the latest payroll data",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}
              {isStreaming && <StreamingBubble content={streamingContent} />}
            </>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={!isConnected || isStreaming}
        placeholder={
          !isConnected
            ? "Connecting to assistant…"
            : isStreaming
            ? "Waiting for response…"
            : "Message HR Assistant…"
        }
      />
    </div>
  );
}
