'use client';

import { Filter, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import styles from './invoices.module.css';

export default function FilterDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const currentStatus = searchParams.get('status') || 'ALL';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === 'ALL') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    router.push(`/invoices?${params.toString()}`);
    setIsOpen(false);
  };

  const statuses = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'PENDING_REVIEW', label: 'Pending Review' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
  ];

  return (
    <div className={styles.filterContainer} ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className={`${styles.filterButton} ${currentStatus !== 'ALL' ? styles.filterActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Filter size={18} />
        <span>Filter {currentStatus !== 'ALL' && `(${currentStatus})`}</span>
      </button>

      {isOpen && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '100%', 
            right: 0, 
            marginTop: '8px', 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: 'var(--radius-md)', 
            boxShadow: 'var(--shadow-md)',
            zIndex: 50,
            minWidth: '180px',
            overflow: 'hidden'
          }}
        >
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => handleSelect(status.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 16px',
                background: currentStatus === status.value ? 'var(--bg-tertiary)' : 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '14px'
              }}
            >
              {status.label}
              {currentStatus === status.value && <Check size={16} className="text-success" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
