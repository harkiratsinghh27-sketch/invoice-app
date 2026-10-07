import styles from './page.module.css';
import { FileText, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { redirect } from 'next/navigation';
import SpendChart from '@/components/SpendChart';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  return (
    <div style={{ padding: '40px', color: 'black' }}>
      <h1>DASHBOARD WORKS!</h1>
      <p>If you see this, Prisma was crashing the site.</p>
    </div>
  );
}
