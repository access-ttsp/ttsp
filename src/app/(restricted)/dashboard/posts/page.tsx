import { PostsList } from "./posts-list";

export default function PostsPage() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <PostsList />
    </div>
  );
}
