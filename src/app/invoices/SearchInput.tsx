'use client';

import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import styles from './invoices.module.css';

export default function SearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (query) {
          params.set('q', query);
        } else {
          params.delete('q');
        }
        router.push(`/invoices?${params.toString()}`);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  return (
    <div className={styles.searchBox}>
      <Search size={18} className={styles.searchIcon} />
      <input 
        type="text" 
        placeholder="Search vendor or invoice number..." 
        className={styles.searchInput}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
