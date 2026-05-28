"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useChatContext } from "@/context/ChatContext";
import { chatsApi } from "@/lib/api/chats";

export default function ChatIndexPage() {
  const router = useRouter();
  const { chats } = useChatContext();
  const [creating, setCreating] = useState(false);

  // Redirect to most recent chat once chats are available
  useEffect(() => {
    if (chats.length > 0) {
      router.replace(`/chat/${chats[0].id}`);
    }
  }, [chats, router]);

  const handleNewChat = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const chat = await chatsApi.create({ title: "New Chat" });
      router.push(`/chat/${chat.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="text-center px-4">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">HR Assistant</h1>
        <p className="mb-8 max-w-md text-gray-500">
          Ask questions about your companies, employees, and HR data. Powered by AI with
          real-time database access.
        </p>
        <button
          onClick={handleNewChat}
          disabled={creating}
          className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {creating ? "Creating…" : "Start New Chat"}
        </button>
        {creating && (
          <div className="mt-4 flex justify-center">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
