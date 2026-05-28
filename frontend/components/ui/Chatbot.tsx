"use client";

import { useRouter } from "next/navigation";

/**
 * Floating chatbot FAB — clicking it opens the full AI chat page (/chat).
 * The chatbot logic has moved to /chat/* pages with real AI + WebSocket streaming.
 */
export default function Chatbot() {
  const router = useRouter();

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <button
        onClick={() => router.push("/chat")}
        className="group flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-blue-600 p-3.5 text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:scale-105 active:scale-95"
        aria-label="Open HR Assistant chat"
        title="Open HR Assistant"
      >
        <svg
          className="h-5 w-5 transition-transform group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-14 right-0 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        HR Assistant
        <div className="absolute -bottom-1 right-4 h-2 w-2 rotate-45 bg-gray-900" />
      </div>
    </div>
  );
}
