'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto py-20 text-center">
      <h1 className="text-6xl font-black text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
      <Button size="lg" asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}

