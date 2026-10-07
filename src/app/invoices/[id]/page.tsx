'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import styles from './invoice-detail.module.css';
import { Suspense } from 'react';

function InvoiceDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${id}`);
        if (!response.ok) throw new Error('Failed to fetch invoice');
        
        const data = await response.json();
        
        // Format dates for input type="date"
        if (data.invoiceDate) {
          data.invoiceDate = new Date(data.invoiceDate).toISOString().split('T')[0];
        }
        if (data.dueDate) {
          data.dueDate = new Date(data.dueDate).toISOString().split('T')[0];
        }
        
        setInvoice(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [id]);

  const handleInputChange = (field: string, value: any) => {
    setInvoice({ ...invoice, [field]: value });
  };

  const handleSave = async (status: string = invoice.status) => {
    setSaving(true);
    const toastId = toast.loading(status === 'APPROVED' ? 'Approving invoice...' : 'Saving invoice...');
    try {
      const updatedData = { ...invoice, status };
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      
      if (!response.ok) throw new Error('Failed to save invoice');
      
      setInvoice(updatedData);
      toast.success(status === 'APPROVED' ? 'Invoice approved successfully!' : 'Invoice saved successfully!', { id: toastId });
      
      if (status === 'APPROVED') {
        router.push('/invoices');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save invoice', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loadingState}>Loading invoice details...</div>;
  }

  if (!invoice) {
    return <div className={styles.errorState}>Invoice not found</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/invoices" className={styles.backButton}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className={styles.title}>Invoice {invoice.invoiceNumber || 'Unknown'}</h1>
            <div className={styles.metaInfo}>
              <span className={`${styles.badge} ${styles['status' + invoice.status]}`}>{invoice.status}</span>
              <span className={styles.vendor}>{invoice.vendorName}</span>
            </div>
          </div>
        </div>
        
        <div className={styles.headerActions}>
          <button 
            className="button-secondary"
            onClick={() => handleSave()}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          
          <button 
            className="button-primary"
            onClick={() => handleSave('APPROVED')}
            disabled={saving}
          >
            <CheckCircle size={18} />
            <span>Approve Invoice</span>
          </button>
        </div>
      </header>

      <div className={styles.splitView}>
        {/* Left Side - Document Preview */}
        <div className={styles.documentPanel}>
          {invoice.fileUrl ? (
            invoice.fileUrl.toLowerCase().endsWith('.pdf') ? (
              <iframe 
                src={invoice.fileUrl} 
                className={styles.documentViewer}
                title="Invoice Document"
              />
            ) : (
              <div className={styles.imageViewerContainer}>
                <img 
                  src={invoice.fileUrl} 
                  alt="Invoice Document" 
                  className={styles.imageViewer} 
                />
              </div>
            )
          ) : (
            <div className={styles.documentPlaceholder}>
              <p>Document Preview</p>
              <p className={styles.mockFile}>Original file not available</p>
            </div>
          )}
        </div>

        {/* Right Side - Editable Data */}
        <div className={styles.dataPanel}>
          <div className={styles.section}>
            <h3>Vendor Details</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Vendor Name</label>
                <input 
                  type="text" 
                  value={invoice.vendorName || ''} 
                  onChange={(e) => handleInputChange('vendorName', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Invoice Number</label>
                <input 
                  type="text" 
                  value={invoice.invoiceNumber || ''} 
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </div>
          
          <div className={styles.section}>
            <h3>Dates & Terms</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Invoice Date</label>
                <input 
                  type="date" 
                  value={invoice.invoiceDate || ''} 
                  onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Due Date</label>
                <input 
                  type="date" 
                  value={invoice.dueDate || ''} 
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, padding: 0, border: 'none' }}>Line Items</h3>
              <button 
                onClick={() => {
                  const newItems = [...(invoice.lineItems || []), { description: '', quantity: 1, unitPrice: 0, total: 0 }];
                  handleInputChange('lineItems', newItems);
                }}
                style={{
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent-primary)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Add Item
              </button>
            </div>
            <div className={styles.lineItemsContainer}>
              <table className={styles.lineItemsTable}>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ width: '80px' }}>Qty</th>
                    <th style={{ width: '100px' }}>Price</th>
                    <th style={{ width: '100px' }}>Total</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems?.map((item: any, index: number) => (
                    <tr key={index}>
                      <td><input type="text" value={item.description} className={styles.input} onChange={(e) => {
                        const newItems = [...invoice.lineItems];
                        newItems[index].description = e.target.value;
                        handleInputChange('lineItems', newItems);
                      }}/></td>
                      <td><input type="number" value={item.quantity} className={styles.input} style={{ padding: '8px 4px' }} onChange={(e) => {
                        const newItems = [...invoice.lineItems];
                        newItems[index].quantity = Number(e.target.value);
                        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
                        handleInputChange('lineItems', newItems);
                      }}/></td>
                      <td><input type="number" value={item.unitPrice} className={styles.input} style={{ padding: '8px 4px' }} onChange={(e) => {
                        const newItems = [...invoice.lineItems];
                        newItems[index].unitPrice = Number(e.target.value);
                        newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
                        handleInputChange('lineItems', newItems);
                      }}/></td>
                      <td><div className={styles.lineTotal}>{item.total.toLocaleString('en-US', {minimumFractionDigits: 2})}</div></td>
                      <td>
                        <button 
                          onClick={() => {
                            const newItems = invoice.lineItems.filter((_: any, i: number) => i !== index);
                            handleInputChange('lineItems', newItems);
                          }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--error-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Remove item"
                        >
                          <XCircle size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!invoice.lineItems || invoice.lineItems.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>No line items extracted.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.section}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, padding: 0, border: 'none' }}>Financial Summary</h3>
              <button 
                onClick={() => {
                  const calculatedSubtotal = (invoice.lineItems || []).reduce((acc: number, item: any) => acc + (item.total || 0), 0);
                  const calculatedTax = invoice.tax || 0;
                  const calculatedTotal = calculatedSubtotal + calculatedTax;
                  handleInputChange('subtotal', calculatedSubtotal);
                  setTimeout(() => handleInputChange('total', calculatedTotal), 0);
                  toast.success('Totals recalculated from line items');
                }}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-strong)',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Recalculate Totals
              </button>
            </div>
            <div className={styles.financialSummary}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <input 
                  type="number" 
                  value={invoice.subtotal || 0} 
                  onChange={(e) => handleInputChange('subtotal', Number(e.target.value))}
                  className={styles.inputSmall}
                />
              </div>
              <div className={styles.summaryRow}>
                <span>Tax</span>
                <input 
                  type="number" 
                  value={invoice.tax || 0} 
                  onChange={(e) => handleInputChange('tax', Number(e.target.value))}
                  className={styles.inputSmall}
                />
              </div>
              <div className={styles.summaryRowTotal}>
                <span>Total ({invoice.currency || 'USD'})</span>
                <input 
                  type="number" 
                  value={invoice.total || 0} 
                  onChange={(e) => handleInputChange('total', Number(e.target.value))}
                  className={styles.inputTotal}
                />
              </div>
            </div>
            
            {invoice.subtotal + invoice.tax !== invoice.total && (
              <div className={styles.mathWarning}>
                <AlertCircle size={16} />
                <span>Calculated total differs from invoice total.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceDetail() {
  return (
    <Suspense fallback={<div className={styles.loadingState}>Loading invoice details...</div>}>
      <InvoiceDetailContent />
    </Suspense>
  );
}
