"use client";

import * as React from "react";
import { Button } from "@heroui/button";

export function ChatComposer({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: (e?: React.FormEvent) => void;
  onStop: () => void;
  isStreaming: boolean;
}) {
  return (
    <form
      onSubmit={onSend}
      className="sticky bottom-0 border-t border-default-100 bg-background/60 backdrop-blur px-3 py-3 flex items-end gap-2"
    >
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your message"
        rows={2}
        className="flex-1 rounded-medium border border-default-200 bg-content1 p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none min-h-[48px] max-h-40"
      />
      <div className="flex gap-2">
        <Button
          type="submit"
          color="primary"
          isDisabled={!value.trim() || isStreaming}
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
