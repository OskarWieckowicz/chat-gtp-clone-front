"use client";

import * as React from "react";
import type { ChatMessage } from "@/types/chat";
import { useChatStream } from "@/hooks/useChatStream";

type ChatContextValue = {
  messages: ChatMessage[];
  isStreaming: boolean;
  send: (text: string) => Promise<void> | void;
  stop: () => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

const ChatContext = React.createContext<ChatContextValue | null>(null);

export function useChatContext() {
  const ctx = React.useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}

export function ChatProvider({
  conversationId,
  initialMessages,
  children,
}: {
  conversationId: number;
  initialMessages: ChatMessage[];
  children: React.ReactNode;
}) {
  const { messages, setMessages, isStreaming, send, stop } =
    useChatStream(conversationId);

  React.useEffect(() => {
    // Seed initial messages only once (or when switching conversation)
    setMessages(initialMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const value: ChatContextValue = React.useMemo(
    () => ({ messages, isStreaming, send, stop, setMessages }),
    [messages, isStreaming, send, stop, setMessages]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
