"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ChatInterface from "@/components/chat/ChatInterface";
import { useChatContext } from "@/context/ChatContext";
import { chatsApi } from "@/lib/api/chats";
import { ChatDetail } from "@/lib/types/chat";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ChatPage({ params }: Props) {
  const { id: chatId } = use(params);
  const router = useRouter();
  const { chats, setChats, mobileOpen, setMobileOpen } = useChatContext();

  const [activeChat, setActiveChat] = useState<ChatDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the active chat whenever the ID changes
  useEffect(() => {
    if (!chatId) return;
    setActiveChat(null);
    setLoading(true);
    chatsApi
      .get(chatId)
      .then((detail) => {
        if (!detail) {
          router.replace("/chat");
          return;
        }
        setActiveChat(detail);
      })
      .catch(() => router.replace("/chat"))
      .finally(() => setLoading(false));
  }, [chatId, router]);

  const handleTitleChange = (title: string) => {
    if (!activeChat) return;
    setActiveChat((prev) => (prev ? { ...prev, title } : prev));
    setChats(chats.map((c) => (c.id === activeChat.id ? { ...c, title } : c)));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!activeChat) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Chat not found.
      </div>
    );
  }

  return (
    <ChatInterface
      key={activeChat.id}
      chat={activeChat}
      onTitleChange={handleTitleChange}
      mobileMenuOpen={mobileOpen}
      onMobileMenuOpen={() => setMobileOpen(true)}
    />
  );
}
