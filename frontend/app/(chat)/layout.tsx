"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth/session";
import { chatsApi } from "@/lib/api/chats";
import { Chat } from "@/lib/types/chat";
import { ChatContext } from "@/context/ChatContext";
import ChatSidebar from "@/components/chat/ChatSidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ChatGroupLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Derive the active chat ID from the URL without causing a re-render
  const activeChatId = pathname.startsWith("/chat/") ? pathname.split("/")[2] : undefined;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    setReady(true);
    chatsApi.list().then(({ items }) => setChats(items)).catch(console.error);
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ChatContext.Provider value={{ chats, setChats, mobileOpen, setMobileOpen }}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <ChatSidebar
          activeChatId={activeChatId}
          chats={chats}
          onChatsChange={setChats}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div className="flex flex-1 flex-col overflow-hidden lg:pl-64">
          {children}
        </div>
      </div>
    </ChatContext.Provider>
  );
}
