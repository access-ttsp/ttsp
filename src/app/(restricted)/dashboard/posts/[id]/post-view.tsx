"use client";

import Link from "next/link";
import useSWR from "swr";
import { deletePost } from "@/actions/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean | number;
  created_at: number;
  updated_at: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function PostView({ id }: { id: string }) {
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
          <Link href="/dashboard/posts">&larr; Back</Link>
        </Button>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{post.title}</CardTitle>
            <Badge variant={post.published ? "default" : "secondary"}>
              {post.published ? "Published" : "Draft"}
            </Badge>
          </div>
          <div className="text-muted-foreground text-sm">
            Created: {new Date(post.created_at).toLocaleString()} | Updated:{" "}
            {new Date(post.updated_at).toLocaleString()}
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6 whitespace-pre-wrap">{post.content}</p>

          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href={`/dashboard/posts/${post.id}/edit`}>Edit</Link>
            </Button>
            <form action={deletePost.bind(null, post.id)}>
              <Button size="sm" type="submit" variant="destructive">
                Delete
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
