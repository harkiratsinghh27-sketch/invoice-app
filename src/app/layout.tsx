import type { Metadata } from "next";
import { Suspense } from "react";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";
import "./globals.css";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const metadata: Metadata = {
  title: "AI Invoice Manager",
  description: "Intelligent invoice management and extraction",
};

async function SidebarContainer() {
  const invoiceCount = await prisma.invoice.count();
  const hasInvoices = invoiceCount > 0;
  return <Sidebar hasInvoices={hasInvoices} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
            <Suspense fallback={<Sidebar hasInvoices={true} />}>
              <SidebarContainer />
            </Suspense>
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
