"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createConversation,
  deleteConversation,
  renameConversation,
  updateConversation,
} from "@/lib/api";

export async function createConversationAction(formData: FormData) {
  const title = (formData.get("title") as string) || undefined;
  const conv = await createConversation(title);
  revalidatePath("/conversations");
  redirect(`/conversations/${conv.id}`);
}

export async function renameConversationAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const title = String(formData.get("title") || "Untitled");
  if (!id) return;
  await renameConversation(id, title);
  revalidatePath("/conversations");
}

export async function deleteConversationAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;
  await deleteConversation(id);
  revalidatePath("/conversations");
}

export async function updateConversationSettingsAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const settings = String(formData.get("settings") || "{}");
  if (!id) return;
  await updateConversation(id, { settings });
  // Revalidate the conversations layout so sidebar title/order and page header can refresh
  revalidatePath("/conversations");
}
