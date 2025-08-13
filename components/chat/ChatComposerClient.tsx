"use client";

import * as React from "react";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { useChatContext } from "@/components/chat/ChatContext";

export function ChatComposerClient({
  conversationId,
}: {
  conversationId: number;
}) {
  const { isStreaming, send, sendWithImages, stop } = useChatContext();
  const [input, setInput] = React.useState("");
  const [previews, setPreviews] = React.useState<
    { url: string; name: string }[]
  >([]);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [files, setFiles] = React.useState<File[]>([]);

  const validateFiles = (files: File[]) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    for (const f of files) {
      if (!allowed.includes(f.type)) {
        setError("Only JPG, PNG, or WEBP images are allowed.");
        return false;
      }
      if (f.size > maxSize) {
        setError("Each image must be under 5MB.");
        return false;
      }
    }
    setError(undefined);
    return true;
  };

  const onSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed && previews.length === 0) return;
    if (files.length > 0) {
      sendWithImages(trimmed, files);
      // cleanup previews and files
      setPreviews((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.url));
        return [];
      });
      setFiles([]);
    } else {
      send(trimmed);
    }
    setInput("");
  };

  return (
    <ChatComposer
      value={input}
      onChange={setInput}
      onSend={onSend}
      onSendWithImages={(files) => {
        if (!validateFiles(files)) return;
        const trimmed = input.trim();
        sendWithImages(trimmed, files);
        setInput("");
        setPreviews([]);
        setFiles([]);
      }}
      onStop={stop}
      isStreaming={isStreaming}
      selectedImages={previews}
      onPickFiles={(files) => {
        if (!validateFiles(files)) return;
        const urls = files.map((f) => ({
          url: URL.createObjectURL(f),
          name: f.name,
        }));
        setPreviews((prev) => [...prev, ...urls]);
        setFiles((prev) => [...prev, ...files]);
      }}
      onRemoveImage={(index) => {
        setPreviews((prev) => {
          const copy = [...prev];
          // revoke URL to avoid leaks
          URL.revokeObjectURL(copy[index]?.url);
          copy.splice(index, 1);
          return copy;
        });
        setFiles((prev) => {
          const copy = [...prev];
          copy.splice(index, 1);
          return copy;
        });
      }}
      errorText={error}
    />
  );
}
