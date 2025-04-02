'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserButton } from '@clerk/nextjs'; // 👈 SignOutButton → UserButton に変更

export default function Dashboard() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth(); // 👈 isLoaded を追加

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/signin');
    }
  }, [isLoaded, isSignedIn, router]);

  // 認証情報の読み込みが完了してない間は表示しない
  if (!isLoaded) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex justify-end">
        <UserButton afterSignOutUrl="/signin" />
      </div>
    </div>
  );
}
