"use client";

import * as React from "react";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { useChatContext } from "@/components/chat/ChatContext";

export function ChatComposerClient({
  conversationId,
}: {
  conversationId: number;
}) {
  const { isStreaming, send, stop } = useChatContext();
  const [input, setInput] = React.useState("");

  const onSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    send(trimmed);
    setInput("");
  };

  return (
    <ChatComposer
      value={input}
      onChange={setInput}
      onSend={onSend}
      onStop={stop}
      isStreaming={isStreaming}
    />
  );
}
