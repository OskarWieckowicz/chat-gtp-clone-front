"use client";

import * as React from "react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { listConversations } from "@/lib/api";
import type { Conversation } from "@/types/chat";
import { usePathname } from "next/navigation";
import {
  createConversationAction,
  deleteConversationAction,
  renameConversationAction,
} from "@/app/(chat)/conversations/actions";

export function ConversationList({ selectedId }: { selectedId?: number }) {
  const [items, setItems] = React.useState<Conversation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [renamingId, setRenamingId] = React.useState<number | null>(null);
  const [title, setTitle] = React.useState("");
  const pathname = usePathname();

  const activeId = React.useMemo(() => {
    if (selectedId != null) return selectedId;
    const match = pathname?.match(/\/conversations\/(\d+)/);
    const id = match ? Number(match[1]) : undefined;
    return Number.isFinite(id as number) ? (id as number) : undefined;
  }, [pathname, selectedId]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await listConversations();
      setItems(
        data.sort((a, b) =>
          (b.updatedAt || "").localeCompare(a.updatedAt || "")
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load, pathname]);

  const onCreate = async () => {
    const fd = new FormData();
    await createConversationAction(fd);
  };

  const onDelete = async (id: number) => {
    const fd = new FormData();
    fd.set("id", String(id));
    await deleteConversationAction(fd);
    await load();
  };

  const startRename = (c: Conversation) => {
    setRenamingId(c.id);
    setTitle(c.title || "");
  };

  const commitRename = async () => {
    if (renamingId == null) return;
    const fd = new FormData();
    fd.set("id", String(renamingId));
    fd.set("title", title || "Untitled");
    await renameConversationAction(fd);
    setRenamingId(null);
    setTitle("");
    await load();
  };

  return (
    <aside className="w-72 shrink-0 border-r border-default-100 h-[100dvh] flex flex-col">
      <div className="p-3 flex gap-2">
        <Button color="primary" fullWidth onPress={onCreate}>
          New chat
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {loading ? (
          <div className="text-xs text-default-500 p-2">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-xs text-default-500 p-2">No conversations</div>
        ) : (
          items.map((c) => (
            <div
              key={c.id}
              className={`group rounded-md border px-2 py-2 ${activeId === c.id ? "border-primary/40 bg-primary/5" : "border-default-200 bg-content2"}`}
              data-selected={activeId === c.id || undefined}
            >
              {renamingId === c.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    size="sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" color="primary" onPress={commitRename}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => setRenamingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <a
                    className="flex-1 text-left text-sm cursor-pointer"
                    href={`/conversations/${c.id}`}
                  >
                    {c.title || `Conversation ${c.id}`}
                  </a>
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => startRename(c)}
                  >
                    Rename
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => onDelete(c.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
