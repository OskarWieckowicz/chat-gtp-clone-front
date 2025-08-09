export type Role = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: Role;
  content: string;
};

export type Conversation = {
  id: number;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
  settings?: string;
};
