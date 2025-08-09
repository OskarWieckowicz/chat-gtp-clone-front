"use client";

import * as React from "react";
import { BACKEND_URL } from "@/lib/constants";
import type { ChatMessage } from "@/types/chat";

export function useChatStream(conversationId?: number) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const send = React.useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
      };
      setMessages((prev) => [...prev, userMsg]);

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      try {
        const path = conversationId
          ? `${BACKEND_URL}/api/chat/${conversationId}/messages`
          : `${BACKEND_URL}/api/chat`;
        const res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Request failed: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // Detect SSE frames ("data: ...\n\n") and plain text chunks
          if (buffer.includes("data:")) {
            const events = buffer.split("\n\n");
            // keep the last (possibly incomplete) frame in buffer
            buffer = events.pop() || "";
            for (const evt of events) {
              const lines = evt.split("\n");
              for (const line of lines) {
                if (line.startsWith("data:")) {
                  const raw = line.slice(5); // keep leading spaces as tokens may start with space
                  const sentinel = raw.trim();
                  if (!sentinel || sentinel === "[DONE]") continue;
                  const payload = raw;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: m.content + payload }
                        : m
                    )
                  );
                }
              }
            }
          } else {
            const text = buffer;
            buffer = "";
            if (!text) continue;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + text } : m
              )
            );
          }
        }
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: (m.content || "") + "\n[Error receiving response]",
                  }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, conversationId]
  );

  const stop = React.useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, setMessages, isStreaming, send, stop };
}
