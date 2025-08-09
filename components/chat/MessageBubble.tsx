"use client";

import * as React from "react";
import type { ChatMessage } from "@/types/chat";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm border whitespace-pre-wrap ${
          isUser
            ? "bg-primary/10 border-primary/30"
            : "bg-content2 border-default-200"
        }`}
      >
        {message.content || <span className="opacity-60">…</span>}
      </div>
    </div>
  );
}
