"use client";

import Link from "next/link";
import useSWR from "swr";
import { deletePost } from "@/actions/posts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Post {
  id: number;
  title: string;
  content: string;
  published: boolean | number;
  created_at: number;
  updated_at: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function PostsList() {
  const { data: posts, isLoading } = useSWR<Post[]>("/api/posts", fetcher, {
    refreshInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="text-muted-foreground text-sm">Loading posts...</div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Posts</h1>
        <Button asChild size="sm">
          <Link href="/dashboard/posts/new">New Post</Link>
        </Button>
      </div>

      {!posts || posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">No posts yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Link
                    className="hover:underline"
                    href={`/dashboard/posts/${post.id}`}
                  >
                    {post.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={post.published ? "default" : "secondary"}>
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(post.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/dashboard/posts/${post.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <form action={deletePost.bind(null, post.id)}>
                      <Button size="sm" type="submit" variant="ghost">
                        Delete
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
