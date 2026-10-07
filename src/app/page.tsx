import styles from './page.module.css';
import { FileText, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import SpendChart from '@/components/SpendChart';

const prisma = new PrismaClient();

export default async function Dashboard() {
  const invoiceCount = await prisma.invoice.count();
  
  if (invoiceCount === 0) {
    redirect('/upload');
  }

  const totalInvoices = await prisma.invoice.count();
  const pendingReview = await prisma.invoice.count({ where: { status: 'REVIEWED' } });
  const approved = await prisma.invoice.count({ where: { status: 'APPROVED' } });
  
  const totalValueResult = await prisma.invoice.aggregate({
    _sum: { total: true },
    where: { status: 'APPROVED' }
  });
  
  const totalValue = totalValueResult._sum.total || 0;
  
  const recentInvoices = await prisma.invoice.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  // Calculate chart data (last 6 months spend)
  const approvedInvoices = await prisma.invoice.findMany({
    where: { status: 'APPROVED' },
    orderBy: { invoiceDate: 'asc' }
  });
  
  const monthlySpend: Record<string, number> = {};
  
  if (approvedInvoices.length > 0) {
    const oldestDate = new Date(approvedInvoices[0].invoiceDate!);
    const newestDate = new Date();
    
    // Generate all months from oldest to newest
    let current = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1);
    const end = new Date(newestDate.getFullYear(), newestDate.getMonth(), 1);
    
    while (current <= end) {
      const monthYear = current.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlySpend[monthYear] = 0;
      current.setMonth(current.getMonth() + 1);
    }
  } else {
    // Fallback to last 6 months if no invoices
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthYear = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      monthlySpend[monthYear] = 0;
    }
  }
  
  approvedInvoices.forEach(inv => {
    if (!inv.invoiceDate || !inv.total) return;
    const d = new Date(inv.invoiceDate);
    const monthYear = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    // Only add if it's within our pre-filled window (or we can just track everything)
    if (monthlySpend[monthYear] !== undefined) {
      monthlySpend[monthYear] += inv.total;
    } else {
      // If it's outside the last 6 months, we could ignore or add it
      monthlySpend[monthYear] = (monthlySpend[monthYear] || 0) + inv.total;
    }
  });
  
  // Sort the keys chronologically. Easiest way is to parse them back to dates.
  const chartData = Object.entries(monthlySpend)
    .map(([date, amount]) => {
      const [month, year] = date.split(' ');
      const parsedDate = new Date(`1 ${month} ${year}`);
      return { date, amount, parsedDate };
    })
    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
    .map(({ date, amount }) => ({ date, amount }));

  const stats = [
    { title: 'Total Invoices', value: totalInvoices.toString(), icon: FileText, change: 'All time', positive: true },
    { title: 'Pending Review', value: pendingReview.toString(), icon: Clock, change: 'Requires attention', positive: false },
    { title: 'Approved', value: approved.toString(), icon: CheckCircle2, change: 'Successfully processed', positive: true },
    { title: 'Total Approved Value', value: `$${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2})}`, icon: TrendingUp, change: 'Total spent', positive: true },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Overview of your invoice processing</p>
        </div>
        <Link href="/upload" className="button-primary">
          Upload Invoice
        </Link>
      </header>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card">
              <div className={styles.statContent}>
                <div className={styles.statHeader}>
                  <h3 className={styles.statTitle}>{stat.title}</h3>
                  <div className={styles.iconWrapper}>
                    <Icon size={18} className={styles.statIcon} />
                  </div>
                </div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={`${styles.statChange} ${stat.positive ? styles.positive : styles.negative}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="card" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Spend Overview</h2>
        <SpendChart data={chartData} />
      </div>

      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2>Recent Activity</h2>
          <Link href="/invoices" className="button-secondary">View All</Link>
        </div>
        <div className="card" style={{ padding: '0' }}>
          {recentInvoices.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No recent activity. Upload an invoice to get started.</p>
            </div>
          ) : (
            <div style={{ padding: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    <th style={{ padding: '12px 8px' }}>Invoice</th>
                    <th style={{ padding: '12px 8px' }}>Vendor</th>
                    <th style={{ padding: '12px 8px' }}>Amount</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((inv) => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <Link href={`/invoices/${inv.id}`} style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {inv.invoiceNumber || 'Unknown'}
                        </Link>
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{inv.vendorName || 'Unknown Vendor'}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                        {inv.currency === 'INR' ? '₹' : '$'}
                        {inv.total ? inv.total.toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00'}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 600, 
                          padding: '4px 8px', 
                          borderRadius: '12px',
                          backgroundColor: inv.status === 'APPROVED' ? 'var(--success-bg)' : '#EAF0F6',
                          color: inv.status === 'APPROVED' ? 'var(--success-main)' : '#2D659E'
                        }}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
