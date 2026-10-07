const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50, size: 'A4' });
doc.pipe(fs.createWriteStream('real-invoice.pdf'));

// Colors
const primaryColor = '#2D3748';
const secondaryColor = '#718096';
const accentColor = '#3182CE';

// Header
doc.fillColor(primaryColor)
   .fontSize(28)
   .font('Helvetica-Bold')
   .text('INVOICE', 50, 50, { align: 'right' });

// Company Logo/Name
doc.fillColor(accentColor)
   .fontSize(24)
   .font('Helvetica-Bold')
   .text('NEXUS TECH', 50, 50);

doc.fillColor(secondaryColor)
   .fontSize(10)
   .font('Helvetica')
   .text('Software & Cloud Solutions', 50, 80);

// Divider
doc.moveTo(50, 110).lineTo(545, 110).lineWidth(1).strokeColor('#E2E8F0').stroke();

// Company Info
doc.fillColor(secondaryColor)
   .fontSize(10)
   .text('Nexus Technologies LLC', 50, 130)
   .text('880 Innovation Parkway, Suite 400')
   .text('San Francisco, CA 94107')
   .text('United States')
   .text('Phone: +1 (555) 019-8472')
   .text('Email: billing@nexustech.io')
   .text('VAT ID: US847291048');

// Invoice Meta
const invoiceMetaTop = 130;
doc.fillColor(primaryColor).font('Helvetica-Bold');
doc.text('Invoice Number:', 350, invoiceMetaTop);
doc.font('Helvetica').fillColor(secondaryColor).text('NXT-2023-0892', 450, invoiceMetaTop);

doc.fillColor(primaryColor).font('Helvetica-Bold');
doc.text('Date of Issue:', 350, invoiceMetaTop + 15);
doc.font('Helvetica').fillColor(secondaryColor).text('October 24, 2023', 450, invoiceMetaTop + 15);

doc.fillColor(primaryColor).font('Helvetica-Bold');
doc.text('Due Date:', 350, invoiceMetaTop + 30);
doc.font('Helvetica').fillColor(secondaryColor).text('November 23, 2023', 450, invoiceMetaTop + 30);

doc.fillColor(primaryColor).font('Helvetica-Bold');
doc.text('PO Number:', 350, invoiceMetaTop + 45);
doc.font('Helvetica').fillColor(secondaryColor).text('PO-778-VX', 450, invoiceMetaTop + 45);

// Bill To
const billToTop = 230;
doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12).text('BILL TO:', 50, billToTop);
doc.fillColor(secondaryColor).font('Helvetica').fontSize(10)
   .text('Global Logistics Partners Inc.', 50, billToTop + 20)
   .text('Attn: Accounts Payable')
   .text('1200 Commerce Way')
   .text('London, E1 6AN')
   .text('United Kingdom');

// Table Header
const tableTop = 330;
doc.rect(50, tableTop, 495, 25).fill('#EDF2F7');
doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10);
doc.text('ITEM DESCRIPTION', 60, tableTop + 8);
doc.text('QTY', 300, tableTop + 8, { width: 40, align: 'right' });
doc.text('UNIT PRICE', 350, tableTop + 8, { width: 70, align: 'right' });
doc.text('TAX', 430, tableTop + 8, { width: 40, align: 'right' });
doc.text('AMOUNT', 480, tableTop + 8, { width: 55, align: 'right' });

// Table Items
let y = tableTop + 35;
doc.font('Helvetica').fillColor(primaryColor);

const items = [
  { desc: 'Enterprise Cloud Hosting (Annual)', qty: 1, price: 12500.00, tax: 0 },
  { desc: 'Custom API Integration Development', qty: 45, price: 185.00, tax: 20 },
  { desc: 'Database Migration Services', qty: 1, price: 3400.00, tax: 20 },
  { desc: 'Premium 24/7 SLA Support (Oct-Dec)', qty: 3, price: 1500.00, tax: 0 }
];

let subtotal = 0;
let totalTax = 0;

items.forEach(item => {
  const amount = item.qty * item.price;
  const taxAmount = (amount * item.tax) / 100;
  subtotal += amount;
  totalTax += taxAmount;

  doc.text(item.desc, 60, y, { width: 230 });
  doc.text(item.qty.toString(), 300, y, { width: 40, align: 'right' });
  doc.text(`$${item.price.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 350, y, { width: 70, align: 'right' });
  doc.text(`${item.tax}%`, 430, y, { width: 40, align: 'right' });
  doc.text(`$${amount.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 480, y, { width: 55, align: 'right' });
  
  y += 25;
  doc.moveTo(50, y - 10).lineTo(545, y - 10).lineWidth(0.5).strokeColor('#E2E8F0').stroke();
});

// Totals
const totalsTop = y + 20;

doc.font('Helvetica').text('Subtotal:', 350, totalsTop, { width: 100, align: 'right' });
doc.text(`$${subtotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 450, totalsTop, { width: 85, align: 'right' });

doc.text('Tax / VAT:', 350, totalsTop + 15, { width: 100, align: 'right' });
doc.text(`$${totalTax.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 450, totalsTop + 15, { width: 85, align: 'right' });

doc.text('Discount (5%):', 350, totalsTop + 30, { width: 100, align: 'right' });
const discount = subtotal * 0.05;
doc.text(`-$${discount.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 450, totalsTop + 30, { width: 85, align: 'right' });

const grandTotal = subtotal + totalTax - discount;

doc.rect(340, totalsTop + 50, 205, 30).fill('#EDF2F7');
doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12);
doc.text('Total (USD):', 350, totalsTop + 60, { width: 100, align: 'right' });
doc.fillColor(accentColor).text(`$${grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}`, 450, totalsTop + 60, { width: 85, align: 'right' });

// Footer / Notes
doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10).text('Payment Information', 50, totalsTop);
doc.fillColor(secondaryColor).font('Helvetica').fontSize(9)
   .text('Bank Name: Silicon Valley Bank', 50, totalsTop + 15)
   .text('Account Name: Nexus Technologies LLC')
   .text('Account No: 899201940291')
   .text('Routing No: 122000496')
   .text('SWIFT: SVBAUS6S');

doc.text('Please include the Invoice Number (NXT-2023-0892) in your payment reference.', 50, totalsTop + 85);
doc.text('Late payments are subject to a 1.5% monthly fee.', 50, totalsTop + 100);

// Thank you
doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12).text('Thank you for your business!', 50, 700, { align: 'center', width: 495 });

doc.end();
console.log('Real invoice generated.');
