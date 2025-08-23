'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <img 
          src="https://public-images-b573dd662d7c89a635d85c00405f50b1.s3.us-east-1.amazonaws.com/logos/IMG_6066.PNG"
          alt="Aurora Logo"
          className="w-16 h-16 object-contain mx-auto mb-4 rounded-2xl bg-white p-2 shadow-lg"
        />
        <p className="text-gray-600">Redirecionando para login...</p>
      </div>
    </div>
  );
}