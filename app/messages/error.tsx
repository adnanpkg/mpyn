'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="app-container bg-bg min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <h2 className="font-heading font-bold text-xl text-text mb-3">
          messages error
        </h2>
        <p className="text-muted text-sm mb-4 font-mono">
          {error.message || 'Something went wrong'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-text text-bg rounded-full font-heading font-bold text-sm"
        >
          try again
        </button>
      </div>
    </div>
  );
}
