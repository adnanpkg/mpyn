'use client';

import TabBar from '@/components/tab-bar';

export default function GigsPage() {
  return (
    <div className="app-container bg-bg pb-20">
      <header className="px-6 pt-14 pb-6">
        <h1 className="font-heading font-bold text-2xl text-text">Gigs</h1>
      </header>
      <main className="px-6">
        <div className="skeleton w-full h-20 mb-3 rounded-card" />
        <div className="skeleton w-full h-20 mb-3 rounded-card" />
        <div className="skeleton w-full h-20 mb-3 rounded-card" />
      </main>
      <TabBar />
    </div>
  );
}
