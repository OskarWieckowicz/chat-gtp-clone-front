"use client";

import * as React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { usePathname } from "next/navigation";
import {
  getConversation,
  uploadDocument,
  listConversationDocuments,
} from "@/lib/api";
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
  const [webAccessEnabled, setWebAccessEnabled] = React.useState(false);
  const [searchTopK, setSearchTopK] = React.useState("3");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [docs, setDocs] = React.useState<
    Array<{ documentId: number; filename: string }>
  >([]);
  const [docsOpen, setDocsOpen] = React.useState(false);
  const docsPopoverRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  // Close docs popover on outside click / Escape
  React.useEffect(() => {
    if (!docsOpen) return;
    function onClick(e: MouseEvent) {
      if (
        docsPopoverRef.current &&
        !docsPopoverRef.current.contains(e.target as Node)
      ) {
        setDocsOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDocsOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [docsOpen]);

  // Fetch documents on mount and when conversation changes
  React.useEffect(() => {
    let aborted = false;
    (async () => {
      if (!conversationId) return;
      try {
        const items = await listConversationDocuments(conversationId);
        if (!aborted) setDocs(items);
      } catch (_) {
        // ignore
      }
    })();
    return () => {
      aborted = true;
    };
  }, [conversationId]);

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
      setWebAccessEnabled(Boolean(parsed.webAccessEnabled ?? false));
      setSearchTopK(String(parsed.searchTopK ?? "3"));
      // load docs list
      const items = await listConversationDocuments(conversationId);
      setDocs(items);
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
    const topKNum = Number(searchTopK);
    const clampedTopK = Number.isFinite(topKNum)
      ? Math.max(1, Math.min(5, Math.trunc(topKNum)))
      : 3;
    const payload = {
      temperature: clampedTemp,
      systemPrompt,
      webAccessEnabled,
      searchTopK: clampedTopK,
    };
    const fd = new FormData();
    fd.set("id", String(conversationId));
    fd.set("settings", JSON.stringify(payload));
    await updateConversationSettingsAction(fd);
    setIsOpen(false);
  }, [conversationId, temperature, systemPrompt, webAccessEnabled, searchTopK]);

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
        {conversationId ? (
          <div className="relative inline-block">
            <Button
              size="sm"
              variant="light"
              onPress={() => setDocsOpen((v) => !v)}
            >
              PDFs: {docs.length}
            </Button>
            {docsOpen && (
              <div
                ref={docsPopoverRef}
                className="absolute right-0 top-full mt-2 z-[1001] w-80 max-h-60 overflow-auto rounded-medium border border-default-100 bg-background p-2 shadow-xl"
              >
                <div className="text-sm font-medium mb-2">Attached PDFs</div>
                {docs.length === 0 ? (
                  <div className="text-xs text-default-500">No PDFs</div>
                ) : (
                  <ul className="space-y-1">
                    {docs.map((d) => (
                      <li
                        key={d.documentId}
                        className="text-sm truncate"
                        title={d.filename}
                      >
                        {d.filename}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ) : null}
        <div className="hidden sm:block">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={async (e) => {
              const inputEl = e.currentTarget;
              const f = inputEl.files?.[0];
              if (!f || !conversationId) return;
              try {
                await uploadDocument(conversationId, f);
                // refresh docs after upload
                const items = await listConversationDocuments(conversationId);
                setDocs(items);
              } finally {
                // Use the element reference captured before the await
                inputEl.value = "";
              }
            }}
          />
          <Button
            size="sm"
            variant="flat"
            onPress={() => fileInputRef.current?.click()}
            isDisabled={!conversationId}
          >
            Attach PDF
          </Button>
        </div>
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
                {docs.length > 0 && (
                  <div className="rounded-medium border border-default-100 p-2">
                    <div className="text-sm font-medium mb-1">
                      Attached PDFs
                    </div>
                    <ul className="text-sm list-disc pl-5">
                      {docs.map((d) => (
                        <li key={d.documentId}>{d.filename}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Web browsing</span>
                    <span className="text-xs text-default-500">
                      Allow the assistant to search and fetch web pages
                    </span>
                  </div>
                  <Switch
                    isSelected={webAccessEnabled}
                    onValueChange={setWebAccessEnabled}
                    isDisabled={loading}
                  >
                    Enabled
                  </Switch>
                </div>
                <Input
                  label="Search results (topK)"
                  value={searchTopK}
                  onValueChange={setSearchTopK}
                  placeholder="1 - 5"
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                  isDisabled={loading || !webAccessEnabled}
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
