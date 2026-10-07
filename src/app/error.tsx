'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace', maxWidth: '800px', margin: '0 auto', color: 'black' }}>
      <h2 style={{ color: 'red' }}>Something went wrong!</h2>
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #ddd',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all'
      }}>
        <p><strong>Error Message:</strong> {error.message}</p>
        {error.digest && <p><strong>Digest:</strong> {error.digest}</p>}
        {error.stack && (
          <details style={{ marginTop: '20px' }}>
            <summary>View Stack Trace</summary>
            <pre style={{ marginTop: '10px', fontSize: '12px' }}>{error.stack}</pre>
          </details>
        )}
      </div>
      <button
        onClick={() => reset()}
        style={{ marginTop: '20px', padding: '10px 20px', background: 'blue', color: 'white', borderRadius: '5px' }}
      >
        Try again
      </button>
    </div>
  );
}
