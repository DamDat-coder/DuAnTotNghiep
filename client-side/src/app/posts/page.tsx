import NewsContent from "@/components/News/NewsContent";
import dynamic from "next/dynamic";
import { Suspense } from "react";

export default function PostsPage() {
  return (
    <Suspense fallback={null}>
      <NewsContent />;
    </Suspense>
  );
}
