import Link from 'next/link';
import { Filter, Eye, Download, Trash2 } from 'lucide-react';
import styles from './invoices.module.css';
import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';
import InvoiceActions from './InvoiceActions';
import SearchInput from './SearchInput';
import FilterDropdown from './FilterDropdown';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { q, status } = await searchParams;
  const query = typeof q === 'string' ? q : undefined;
  const statusFilter = typeof status === 'string' && status !== 'ALL' ? status : undefined;

  // Fetch real invoices from DB, with optional search and status filter
  const dbInvoices = await prisma.invoice.findMany({
    where: {
      ...(query && {
        OR: [
          { vendorName: { contains: query } },
          { invoiceNumber: { contains: query } }
        ]
      }),
      ...(statusFilter && { status: statusFilter })
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Invoices</h1>
          <p className={styles.subtitle}>Manage and track your extracted invoices</p>
        </div>
        <Link href="/upload" className="button-primary">
          Upload New
        </Link>
      </header>

      <div className="card">
        <div className={styles.toolbar}>
          <SearchInput />
          <FilterDropdown />
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Vendor</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dbInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    No invoices found. <Link href="/upload" style={{color: 'var(--accent-primary)', textDecoration: 'underline'}}>Upload one</Link> to get started.
                  </td>
                </tr>
              ) : (
                dbInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className={styles.cellInvoiceNo}>
                      <Link href={`/invoices/${invoice.id}`}>{invoice.invoiceNumber || 'Unknown'}</Link>
                    </td>
                    <td className={styles.cellVendor}>{invoice.vendorName || 'Unknown'}</td>
                    <td>{invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'MMM dd, yyyy') : '-'}</td>
                    <td className={styles.cellTotal}>
                      {invoice.currency === 'USD' ? '$' : invoice.currency === 'INR' ? '₹' : ''}
                      {invoice.total?.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '-'}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles['status' + invoice.status]}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <InvoiceActions invoiceId={invoice.id} fileUrl={invoice.fileUrl} />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
