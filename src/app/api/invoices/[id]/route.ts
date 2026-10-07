import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { lineItems: true }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    
    // Extract line items if they exist
    const { lineItems, ...invoiceData } = data;

    // Update invoice metadata
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        vendorName: invoiceData.vendorName,
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate) : null,
        dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null,
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax,
        total: invoiceData.total,
        status: invoiceData.status,
      }
    });

    // Handle line items if they are provided
    if (lineItems && Array.isArray(lineItems)) {
      // For simplicity in MVP, we just update existing ones
      // In a robust app, we'd delete/create/update based on IDs
      for (const item of lineItems) {
        if (item.id) {
          await prisma.lineItem.update({
            where: { id: item.id },
            data: {
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true, invoice: updatedInvoice });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.invoice.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
