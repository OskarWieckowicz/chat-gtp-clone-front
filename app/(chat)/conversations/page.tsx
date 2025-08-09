import { redirect } from "next/navigation";
import { createConversation, listConversations } from "@/lib/api";

export default async function ConversationsIndexPage() {
  // SSR: open last updated conversation if exists; otherwise create one
  const items = await listConversations();
  if (items && items.length > 0) {
    const sorted = [...items].sort((a, b) =>
      (b.updatedAt || "").localeCompare(a.updatedAt || "")
    );
    redirect(`/conversations/${sorted[0].id}`);
  } else {
    const conv = await createConversation();
    redirect(`/conversations/${conv.id}`);
  }
}
