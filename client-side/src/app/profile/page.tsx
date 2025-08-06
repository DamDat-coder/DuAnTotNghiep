// app/profile/page.tsx
import ProfilePage from '@/components/Profile/ProfilePage';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic'; // tùy chọn thêm nếu muốn SSR mỗi lần

export default function Page() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <ProfilePage />
    </Suspense>
  );
}
