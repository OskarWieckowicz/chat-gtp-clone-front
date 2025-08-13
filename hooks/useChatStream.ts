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
      // Ensure a clean block start to help markdown render correctly mid-stream
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

          // Detect SSE frames ("data: ...\n\n"). Join multi-line data fields per SSE spec.
          if (buffer.includes("data:")) {
            const events = buffer.split("\n\n");
            // keep the last (possibly incomplete) frame in buffer
            buffer = events.pop() || "";
            for (const evt of events) {
              const dataLines = evt
                .split("\n")
                .filter((l) => l.startsWith("data:"))
                .map((l) => l.slice(5)); // preserve leading spaces in tokens

              // Combine data lines with newline as per SSE spec
              // Normalize consecutive newlines to avoid collapsed paragraphs until final render
              const combined = dataLines.join("\n");
              const trimmed = combined.trim();
              if (trimmed === "[DONE]") continue;

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + combined }
                    : m
                )
              );
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

  const sendWithImages = React.useCallback(
    async (text: string, images: File[]) => {
      const trimmed = text.trim();
      if ((!trimmed && images.length === 0) || isStreaming) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed || "[image]",
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
        if (!conversationId) throw new Error("Missing conversationId");
        const fd = new FormData();
        fd.set("message", trimmed);
        for (const file of images) fd.append("images", file);

        const res = await fetch(
          `${BACKEND_URL}/api/chat/${conversationId}/messages/multimodal`,
          {
            method: "POST",
            headers: { Accept: "text/event-stream" },
            body: fd,
            signal: controller.signal,
          }
        );
        if (!res.ok || !res.body)
          throw new Error(`Request failed: ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          if (buffer.includes("data:")) {
            const events = buffer.split("\n\n");
            buffer = events.pop() || "";
            for (const evt of events) {
              const dataLines = evt
                .split("\n")
                .filter((l) => l.startsWith("data:"))
                .map((l) => l.slice(5));
              const combined = dataLines.join("\n");
              const trimmedCombined = combined.trim();
              if (trimmedCombined === "[DONE]") continue;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + combined }
                    : m
                )
              );
            }
          } else {
            const textChunk = buffer;
            buffer = "";
            if (!textChunk) continue;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + textChunk }
                  : m
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

  return { messages, setMessages, isStreaming, send, sendWithImages, stop };
}
