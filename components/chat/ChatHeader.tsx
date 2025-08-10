"use client";

import * as React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { usePathname } from "next/navigation";
import { getConversation } from "@/lib/api";
import { updateConversationSettingsAction } from "@/app/(chat)/conversations/actions";
import { createPortal } from "react-dom";

export function ChatHeader() {
  const pathname = usePathname();
  const match = pathname?.match(/\/conversations\/(\d+)/);
  const conversationId = match ? Number(match[1]) : undefined;

  const [isOpen, setIsOpen] = React.useState(false);
  const [temperature, setTemperature] = React.useState("0.7");
  const [systemPrompt, setSystemPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const open = React.useCallback(async () => {
    if (!conversationId) {
      setIsOpen(true);
      return;
    }
    setLoading(true);
    try {
      const conv = await getConversation(conversationId);
      let parsed: any = {};
      try {
        parsed = conv.settings ? JSON.parse(conv.settings) : {};
      } catch (_) {
        parsed = {};
      }
      setTemperature(String(parsed.temperature ?? "0.7"));
      setSystemPrompt(parsed.systemPrompt ?? "");
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const save = React.useCallback(async () => {
    if (!conversationId) {
      setIsOpen(false);
      return;
    }
    const tempNum = Number(temperature);
    const clampedTemp = Number.isFinite(tempNum)
      ? Math.max(0, Math.min(2, tempNum))
      : 0.7;
    const payload = {
      temperature: clampedTemp,
      systemPrompt,
    };
    const fd = new FormData();
    fd.set("id", String(conversationId));
    fd.set("settings", JSON.stringify(payload));
    await updateConversationSettingsAction(fd);
    setIsOpen(false);
  }, [conversationId, temperature, systemPrompt]);

  return (
    <header className="sticky top-0 z-10 border-b border-default-100 bg-background/60 backdrop-blur px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Chat</h1>
          <p className="text-xs text-default-500">Powered by your local LLM</p>
        </div>
        <Button
          size="sm"
          variant="flat"
          onPress={open}
          isDisabled={!conversationId}
        >
          Settings
        </Button>
      </div>
      {mounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[1000] flex items-start sm:items-center justify-center p-3 sm:p-4"
            style={{
              paddingTop: `max(env(safe-area-inset-top, 0px), 12px)`,
              paddingBottom: `max(env(safe-area-inset-bottom, 0px), 12px)`,
            }}
          >
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsOpen(false)}
            />
            <div className="relative w-full max-w-lg rounded-large border border-default-100 bg-background p-4 shadow-xl max-h-[90dvh] overflow-y-auto">
              <div className="mb-3">
                <h2 className="text-base font-semibold">
                  Conversation settings
                </h2>
              </div>
              <div className="space-y-3">
                <Input
                  label="Temperature"
                  value={temperature}
                  onValueChange={setTemperature}
                  placeholder="0.0 - 2.0"
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  isDisabled={loading}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-default-600">
                    System prompt
                  </label>
                  <textarea
                    className="min-h-24 max-h-60 rounded-medium border border-default-200 bg-content2 p-2 outline-none focus:border-primary/50"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant..."
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="light" onPress={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button color="primary" onPress={save} isDisabled={loading}>
                  Save
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
}
