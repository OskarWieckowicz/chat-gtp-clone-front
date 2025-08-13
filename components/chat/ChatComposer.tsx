"use client";

import * as React from "react";
import { Button } from "@heroui/button";

export function ChatComposer({
  value,
  onChange,
  onSend,
  onSendWithImages,
  onStop,
  isStreaming,
  selectedImages,
  onPickFiles,
  onRemoveImage,
  errorText,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: (e?: React.FormEvent) => void;
  onSendWithImages: (files: File[]) => void;
  onStop: () => void;
  isStreaming: boolean;
  selectedImages: { url: string; name: string }[];
  onPickFiles: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  errorText?: string;
}) {
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  return (
    <form
      onSubmit={onSend}
      className="sticky bottom-0 border-t border-default-100 bg-background/60 backdrop-blur px-3 py-3 flex items-end gap-2"
    >
      <div className="flex-1 flex flex-col gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your message"
          rows={2}
          className="w-full rounded-medium border border-default-200 bg-content1 p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none min-h-[48px] max-h-40"
        />
        {selectedImages.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedImages.map((img, i) => (
              <div
                key={`${img.url}-${i}`}
                className="relative w-16 h-16 border rounded overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  className="absolute -top-1 -right-1 bg-content3 text-foreground text-[10px] px-1 py-0.5 rounded"
                  onClick={() => onRemoveImage(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {errorText && (
          <div className="text-xs text-danger-500">{errorText}</div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.currentTarget.files || []);
            if (files.length > 0) onPickFiles(files);
            e.currentTarget.value = "";
          }}
        />
        <Button
          type="button"
          variant="flat"
          onPress={() => fileRef.current?.click()}
          isDisabled={isStreaming}
        >
          Images
        </Button>
        <Button
          type="submit"
          color="primary"
          isDisabled={
            (value.trim().length === 0 && selectedImages.length === 0) ||
            isStreaming
          }
        >
          Send
        </Button>
        {isStreaming && (
          <Button type="button" variant="bordered" onPress={onStop}>
            Stop
          </Button>
        )}
      </div>
    </form>
  );
}
