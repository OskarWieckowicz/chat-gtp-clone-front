import { BACKEND_URL } from "@/lib/constants";
import type { Conversation, ChatMessage } from "@/types/chat";

export async function createConversation(
  title?: string
): Promise<Conversation> {
  const res = await fetch(`${BACKEND_URL}/api/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(title ? { title } : {}),
  });
  if (!res.ok) throw new Error(`Failed to create conversation: ${res.status}`);
  return res.json();
}

export async function listConversations(): Promise<Conversation[]> {
  const res = await fetch(`${BACKEND_URL}/api/conversations`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to list conversations: ${res.status}`);
  return res.json();
}

export async function listMessages(
  conversationId: number
): Promise<ChatMessage[]> {
  const res = await fetch(
    `${BACKEND_URL}/api/conversations/${conversationId}/messages`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`Failed to list messages: ${res.status}`);
  return res.json();
}

export async function deleteConversation(id: number): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/conversations/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Failed to delete conversation: ${res.status}`);
}

export async function renameConversation(
  id: number,
  title: string
): Promise<Conversation> {
  const res = await fetch(`${BACKEND_URL}/api/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error(`Failed to rename conversation: ${res.status}`);
  return res.json();
}

export async function uploadDocument(
  conversationId: number,
  file: File
): Promise<{ documentId: number; filename: string }> {
  const fd = new FormData();
  fd.set("file", file);
  const res = await fetch(
    `${BACKEND_URL}/api/conversations/${conversationId}/documents`,
    {
      method: "POST",
      body: fd,
    }
  );
  if (!res.ok) throw new Error(`Failed to upload: ${res.status}`);
  return res.json();
}

export async function getConversation(id: number): Promise<Conversation> {
  const res = await fetch(`${BACKEND_URL}/api/conversations/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to get conversation: ${res.status}`);
  return res.json();
}

export async function updateConversation(
  id: number,
  data: Partial<Pick<Conversation, "title" | "settings">>
): Promise<Conversation> {
  const res = await fetch(`${BACKEND_URL}/api/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update conversation: ${res.status}`);
  return res.json();
}
