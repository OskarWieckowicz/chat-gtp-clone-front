"use client";

import * as React from "react";

export function ChatHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-default-100 bg-background/60 backdrop-blur px-4 py-3">
      <h1 className="text-lg font-semibold">Chat</h1>
      <p className="text-xs text-default-500">Powered by your local LLM</p>
    </header>
  );
}
