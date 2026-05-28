"use client";

import { cn } from "@/lib/utils/cn";
import { ChatMessage } from "@/lib/types/chat";

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

/**
 * Renders a single chat message bubble (user or assistant).
 * Assistant messages render newlines and basic markdown-ish formatting.
 */
export default function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-700 text-gray-200"
        )}
      >
        {isUser ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
          </svg>
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "rounded-tr-sm bg-blue-600 text-white"
            : "rounded-tl-sm bg-white text-gray-800 shadow-sm ring-1 ring-gray-200"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}

/**
 * Streaming bubble — shows partial assistant content with a blinking cursor.
 */
interface StreamingBubbleProps {
  content: string;
}

export function StreamingBubble({ content }: StreamingBubbleProps) {
  return (
    <div className="flex items-start gap-3">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 text-gray-200">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
        </svg>
      </div>

      <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed shadow-sm ring-1 ring-gray-200">
        {content ? (
          <span className="whitespace-pre-wrap text-gray-800">
            {content}
            <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-gray-400 align-text-bottom" />
          </span>
        ) : (
          /* Typing dots when streaming starts */
          <div className="flex gap-1 py-0.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
          </div>
        )}
      </div>
    </div>
  );
}
