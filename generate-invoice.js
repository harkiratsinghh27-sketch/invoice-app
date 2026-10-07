const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });

doc.pipe(fs.createWriteStream('demo-invoice.pdf'));

// Header
doc.fontSize(20).text('INVOICE', { align: 'right' });
doc.moveDown();

// Company Info
doc.fontSize(10).text('Acme Corporation', { align: 'left' });
doc.text('123 Innovation Drive');
doc.text('Tech City, TC 90210');
doc.text('billing@acmecorp.com');

doc.moveDown();

// Invoice Details
const invoiceTop = 150;
doc.text('Invoice Number: INV-2023-9001', 50, invoiceTop);
doc.text('Invoice Date: Oct 15, 2023', 50, invoiceTop + 15);
doc.text('Due Date: Nov 15, 2023', 50, invoiceTop + 30);
doc.text('Currency: USD', 50, invoiceTop + 45);

// Bill To
doc.text('Bill To:', 300, invoiceTop);
doc.text('Global Services Ltd.', 300, invoiceTop + 15);
doc.text('456 Enterprise Way', 300, invoiceTop + 30);
doc.text('Business District, BD 10001', 300, invoiceTop + 45);

doc.moveDown(4);

// Table Header
const tableTop = 250;
doc.font('Helvetica-Bold');
doc.text('Description', 50, tableTop);
doc.text('Qty', 300, tableTop);
doc.text('Unit Price', 350, tableTop);
doc.text('Total', 450, tableTop);
doc.moveTo(50, tableTop + 15).lineTo(500, tableTop + 15).stroke();
doc.font('Helvetica');

// Table Rows
let y = tableTop + 25;
const items = [
  { desc: 'Cloud Infrastructure Setup', qty: 1, price: 1500.00 },
  { desc: 'Monthly Maintenance (Oct)', qty: 1, price: 500.00 },
  { desc: 'API Integration Consulting (hrs)', qty: 5, price: 150.00 }
];

let subtotal = 0;

items.forEach(item => {
  const total = item.qty * item.price;
  subtotal += total;
  
  doc.text(item.desc, 50, y);
  doc.text(item.qty.toString(), 300, y);
  doc.text(`$${item.price.toFixed(2)}`, 350, y);
  doc.text(`$${total.toFixed(2)}`, 450, y);
  y += 20;
});

doc.moveTo(50, y).lineTo(500, y).stroke();
y += 15;

// Totals
const tax = subtotal * 0.10;
const finalTotal = subtotal + tax;

doc.font('Helvetica-Bold');
doc.text('Subtotal:', 350, y);
doc.text(`$${subtotal.toFixed(2)}`, 450, y);
y += 15;
doc.text('Tax (10%):', 350, y);
doc.text(`$${tax.toFixed(2)}`, 450, y);
y += 15;
doc.fontSize(12).text('Total:', 350, y);
doc.text(`$${finalTotal.toFixed(2)}`, 450, y);

doc.end();

console.log("demo-invoice.pdf generated successfully.");
