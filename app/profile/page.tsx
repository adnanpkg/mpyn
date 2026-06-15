'use client';

import TabBar from '@/components/tab-bar';

export default function ProfilePage() {
  return (
    <div className="app-container bg-bg pb-20">
      <header className="px-6 pt-14 pb-6">
        <h1 className="font-heading font-bold text-2xl text-text">Profile</h1>
      </header>
      <main className="px-6 flex flex-col items-center">
        <div className="skeleton w-20 h-20 rounded-full mb-4" />
        <div className="skeleton w-32 h-4 mb-2" />
        <div className="skeleton w-24 h-3 mb-6" />
      </main>
      <TabBar />
    </div>
  );
}
