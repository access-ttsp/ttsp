"use server";

import { redirect } from "next/navigation";
import { PostsService } from "@/elysia/modules/posts/service";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const published = formData.get("published") === "on";

  try {
    await PostsService.createPost({ title, content, published });
    redirect("/dashboard/posts");
  } catch (error) {
    console.error("Failed to create post:", error);
    throw error;
  }
}

export async function updatePost(formData: FormData) {
  const id = Number(formData.get("id"));
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const published = formData.get("published") === "on";

  try {
    await PostsService.updatePost(id, { title, content, published });
    redirect(`/dashboard/posts/${id}`);
  } catch (error) {
    console.error("Failed to update post:", error);
    throw error;
  }
}

export async function deletePost(id: number) {
  try {
    await PostsService.deletePost(id);
    redirect("/dashboard/posts");
  } catch (error) {
    console.error("Failed to delete post:", error);
    throw error;
  }
}
