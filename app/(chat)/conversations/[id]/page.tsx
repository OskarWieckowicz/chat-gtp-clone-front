import * as React from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatComposerClient } from "@/components/chat/ChatComposerClient";
import { MessagesClient } from "@/components/chat/MessagesClient";
import { ChatProvider } from "@/components/chat/ChatContext";
import { listMessages } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id || Number.isNaN(id)) return notFound();
  const messages = await listMessages(id);
  return (
    <>
      <ChatHeader />
      <ChatProvider conversationId={id} initialMessages={messages}>
        <main className="flex-1 overflow-auto px-3 py-4">
          <MessagesClient initialMessages={messages} />
        </main>
        <ChatComposerClient conversationId={id} />
      </ChatProvider>
    </>
  );
}
