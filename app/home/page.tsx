'use client';

import TabBar from '@/components/tab-bar';

export default function HomePage() {
  return (
    <div className="app-container bg-bg pb-20">
      <header className="px-6 pt-14 pb-6">
        <h1 className="font-heading font-bold text-2xl text-text">multiply.</h1>
      </header>
      <main className="px-6">
        <div className="skeleton w-full h-32 mb-4" />
        <div className="skeleton w-3/4 h-4 mb-3" />
        <div className="skeleton w-1/2 h-4 mb-6" />
        <div className="skeleton w-full h-24 mb-4" />
        <div className="skeleton w-2/3 h-4 mb-3" />
        <div className="skeleton w-full h-4 mb-3" />
      </main>
      <TabBar />
    </div>
  );
}
