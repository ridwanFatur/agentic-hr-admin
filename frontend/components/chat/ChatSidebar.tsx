"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { chatsApi } from "@/lib/api/chats";
import { Chat } from "@/lib/types/chat";
import Dialog from "@/components/ui/Dialog";

interface ChatSidebarProps {
  activeChatId?: string;
  onChatCreated?: (chat: Chat) => void;
  chats: Chat[];
  onChatsChange: (chats: Chat[]) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function ChatSidebar({
  activeChatId,
  onChatCreated,
  chats,
  onChatsChange,
  mobileOpen,
  onMobileClose,
}: ChatSidebarProps) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleNewChat = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const chat = await chatsApi.create({ title: "New Chat" });
      onChatsChange([chat, ...chats]);
      onChatCreated?.(chat);
      router.push(`/chat/${chat.id}`);
      onMobileClose();
    } catch (err) {
      console.error("Failed to create chat:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleRenameStart = (chat: Chat, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRenamingId(chat.id);
    setRenameValue(chat.title);
  };

  const handleRenameSubmit = async (chatId: string) => {
    const title = renameValue.trim();
    if (!title) {
      setRenamingId(null);
      return;
    }
    try {
      const updated = await chatsApi.rename(chatId, { title });
      onChatsChange(chats.map((c) => (c.id === chatId ? updated : c)));
    } catch (err) {
      console.error("Failed to rename chat:", err);
    } finally {
      setRenamingId(null);
    }
  };

  const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingChatId(chatId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingChatId) return;
    setDeleteLoading(true);
    try {
      await chatsApi.delete(deletingChatId);
      const remaining = chats.filter((c) => c.id !== deletingChatId);
      onChatsChange(remaining);
      if (activeChatId === deletingChatId) {
        router.push(remaining.length > 0 ? `/chat/${remaining[0].id}` : "/chat");
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    } finally {
      setDeleteLoading(false);
      setDeletingChatId(null);
    }
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-gray-700">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold text-gray-200 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          HR Manager
        </Link>
        <button
          onClick={handleNewChat}
          disabled={creating}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-gray-700 text-gray-300 transition-colors hover:bg-gray-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          title="New chat"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Chat list */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {chats.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-gray-500">
            No conversations yet.
            <br />
            Start a new chat above.
          </div>
        ) : (
          <ul className="space-y-0.5">
            {chats.map((chat) => {
              const isActive = chat.id === activeChatId;
              return (
                <li key={chat.id}>
                  {renamingId === chat.id ? (
                    <div className="flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-2">
                      <input
                        ref={renameInputRef}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleRenameSubmit(chat.id);
                          if (e.key === "Escape") setRenamingId(null);
                        }}
                        onBlur={() => handleRenameSubmit(chat.id)}
                        className="flex-1 bg-transparent text-sm text-white outline-none"
                        maxLength={80}
                      />
                    </div>
                  ) : (
                    <Link
                      href={`/chat/${chat.id}`}
                      onClick={onMobileClose}
                      className={cn(
                        "group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-gray-700 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                      )}
                    >
                      <span className="truncate flex-1">{chat.title}</span>
                      {/* Action buttons — visible on hover or when active */}
                      <div className={cn(
                        "flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100",
                        isActive && "opacity-100"
                      )}>
                        <button
                          onClick={(e) => handleRenameStart(chat, e)}
                          className="cursor-pointer rounded p-1 text-gray-400 hover:bg-gray-600 hover:text-white"
                          title="Rename"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(chat.id, e)}
                          className="cursor-pointer rounded p-1 text-gray-400 hover:bg-red-600 hover:text-white"
                          title="Delete"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent />
      </aside>

      <Dialog
        open={deletingChatId !== null}
        onClose={() => setDeletingChatId(null)}
        title="Delete chat"
        description="This chat and all its messages will be permanently deleted. This cannot be undone."
        actions={
          <>
            <button
              onClick={() => setDeletingChatId(null)}
              disabled={deleteLoading}
              className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </button>
          </>
        }
      />
    </>
  );
}
