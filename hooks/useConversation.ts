"use client";

import * as React from "react";
import { createConversation } from "@/lib/api";
import type { Conversation } from "@/types/chat";

export function useConversation() {
  const [current, setCurrent] = React.useState<Conversation | null>(null);
  const [loading, setLoading] = React.useState(false);
  const ensure = React.useCallback(async () => {
    if (current) return current;
    setLoading(true);
    try {
      const c = await createConversation();
      setCurrent(c);
      return c;
    } finally {
      setLoading(false);
    }
  }, [current]);

  return { current, setCurrent, ensure, loading };
}
