'use client';

import { Eye, Download, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './invoices.module.css';
import { useState } from 'react';
import { toast } from 'sonner';

export default function InvoiceActions({ invoiceId, fileUrl }: { invoiceId: string, fileUrl: string | null }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      toast.error('Original file is not available for this invoice.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    
    setIsDeleting(true);
    const toastId = toast.loading('Deleting invoice...');
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Invoice deleted successfully', { id: toastId });
        router.refresh();
      } else {
        toast.error('Failed to delete invoice', { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting invoice', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <td className={styles.cellActions}>
      <Link href={`/invoices/${invoiceId}`} className={styles.actionButton} title="View Details">
        <Eye size={16} />
      </Link>
      <button 
        className={styles.actionButton} 
        title="Download Original" 
        onClick={handleDownload}
        disabled={isDeleting}
      >
        <Download size={16} />
      </button>
      <button 
        className={styles.actionButton} 
        title="Delete" 
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 size={16} />
      </button>
    </td>
  );
}
