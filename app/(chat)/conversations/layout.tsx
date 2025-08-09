import * as React from "react";
import { ConversationList } from "@/components/chat/ConversationList";
import Link from "next/link";

export default function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server component; sidebar uses plain <a> with href that works SSR.
  return (
    <div className="flex h-[100dvh]">
      {/* ConversationList remains a client component, but links use href for navigation */}
      <ConversationList selectedId={undefined} />
      <div className="flex-1 max-w-3xl mx-auto flex flex-col">{children}</div>
    </div>
  );
}
