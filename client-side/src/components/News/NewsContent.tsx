'use client';

import NewsPage from '@/app/posts/page';
import { Suspense } from 'react';

export default function NewsContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewsPage />
    </Suspense>
  );
}
