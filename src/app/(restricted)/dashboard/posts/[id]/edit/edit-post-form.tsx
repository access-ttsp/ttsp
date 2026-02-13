"use client";

import Link from "next/link";
import useSWR from "swr";
import { updatePost } from "@/actions/posts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean | number;
  created_at: number;
  updated_at: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function EditPostForm({ id }: { id: string }) {
  const { data: post, isLoading } = useSWR<Post>(`/api/posts/${id}`, fetcher, {
    refreshInterval: 30_000,
  });

  if (isLoading) {
    return <div className="text-muted-foreground text-sm">Loading...</div>;
  }

  if (!post) {
    return <div className="text-muted-foreground text-sm">Post not found.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/dashboard/posts/${id}`}>&larr; Back</Link>
        </Button>
        <h1 className="font-semibold text-2xl">Edit Post</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updatePost} className="flex flex-col gap-4">
            <input name="id" type="hidden" value={post.id} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                defaultValue={post.title}
                id="title"
                name="title"
                placeholder="Post title"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                defaultValue={post.content}
                id="content"
                name="content"
                placeholder="Write your post..."
                rows={6}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                defaultChecked={Boolean(post.published)}
                id="published"
                name="published"
              />
              <Label htmlFor="published">Published</Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Save</Button>
              <Button asChild variant="ghost">
                <Link href={`/dashboard/posts/${id}`}>Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
