"use client";

import * as React from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { ChatMessage } from "@/types/chat";
import { useChatContext } from "@/components/chat/ChatContext";

export function MessagesClient({
  initialMessages,
}: {
  initialMessages: ChatMessage[];
}) {
  const { messages, setMessages } = useChatContext();
  const endRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);
  React.useEffect(() => {
    // In case of hydration from SSR, seed context if empty
    if (messages.length === 0 && initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages, messages.length, setMessages]);
  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
