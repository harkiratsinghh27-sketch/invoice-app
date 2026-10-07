const fs = require('fs');
const PDFDocument = require('pdfkit');

function generateInvoice(data, filename) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filename);
    doc.pipe(stream);

    // Header
    doc
      .fillColor('#333333')
      .fontSize(28)
      .text('INVOICE', 50, 50, { align: 'right' })
      .fontSize(10)
      .text(`Invoice Number: ${data.invoiceNumber}`, { align: 'right' })
      .text(`Date: ${data.date}`, { align: 'right' })
      .text(`Due Date: ${data.dueDate}`, { align: 'right' })
      .moveDown();

    // From / To
    doc
      .fontSize(16)
      .text(data.vendor.name, 50, 50)
      .fontSize(10)
      .text(data.vendor.address)
      .text(data.vendor.city)
      .text(data.vendor.email)
      .moveDown(2);

    doc
      .fontSize(12)
      .text('Bill To:', 50, 150)
      .fontSize(10)
      .text('Demo User')
      .text('123 Main Street')
      .text('San Francisco, CA 94105')
      .moveDown(2);

    // Table Header
    const tableTop = 250;
    doc
      .fontSize(10)
      .text('Description', 50, tableTop)
      .text('Qty', 350, tableTop)
      .text('Unit Price', 400, tableTop)
      .text('Total', 480, tableTop);

    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Line Items
    let y = tableTop + 25;
    data.items.forEach(item => {
      doc
        .text(item.description, 50, y)
        .text(item.qty.toString(), 350, y)
        .text(`$${item.price.toFixed(2)}`, 400, y)
        .text(`$${(item.qty * item.price).toFixed(2)}`, 480, y);
      y += 20;
    });

    doc
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();

    // Totals
    const subtotal = data.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const tax = subtotal * data.taxRate;
    const total = subtotal + tax;

    doc
      .text('Subtotal:', 400, y + 15)
      .text(`$${subtotal.toFixed(2)}`, 480, y + 15)
      .text(`Tax (${(data.taxRate * 100).toFixed(0)}%):`, 400, y + 35)
      .text(`$${tax.toFixed(2)}`, 480, y + 35)
      .fontSize(14)
      .text('Total Due:', 380, y + 65)
      .text(`$${total.toFixed(2)}`, 480, y + 65);

    // Footer
    doc
      .fontSize(10)
      .fillColor('#666666')
      .text('Thank you for your business!', 50, 700, { align: 'center', width: 500 });

    doc.end();
    stream.on('finish', resolve);
  });
}

async function run() {
  await generateInvoice({
    vendor: { name: 'TechNova Solutions', address: '456 Tech Park', city: 'San Jose, CA 95110', email: 'billing@technova.com' },
    invoiceNumber: 'INV-TN-2023-01',
    date: '2023-11-01',
    dueDate: '2023-11-15',
    taxRate: 0.08,
    items: [
      { description: 'Cloud Architecture Consulting (Hours)', qty: 15, price: 150.00 },
      { description: 'AWS Infrastructure Setup', qty: 1, price: 2500.00 },
      { description: 'Monthly Retainer - November', qty: 1, price: 1000.00 }
    ]
  }, 'technova-invoice.pdf');

  await generateInvoice({
    vendor: { name: 'Global Logistics Inc.', address: '789 Shipping Lane', city: 'New York, NY 10001', email: 'accounts@globallogistics.com' },
    invoiceNumber: 'GLI-4492',
    date: '2023-11-05',
    dueDate: '2023-12-05',
    taxRate: 0.05,
    items: [
      { description: 'Freight Shipping (Container A)', qty: 1, price: 4500.00 },
      { description: 'Freight Shipping (Container B)', qty: 1, price: 4200.00 },
      { description: 'Customs Clearance Fee', qty: 2, price: 150.00 },
      { description: 'Insurance Premium', qty: 1, price: 350.00 }
    ]
  }, 'global-logistics-invoice.pdf');

  await generateInvoice({
    vendor: { name: 'Design Studio Co.', address: '12 Creative Blvd', city: 'Austin, TX 78701', email: 'hello@designstudioco.com' },
    invoiceNumber: 'DSC-2023-88',
    date: '2023-11-10',
    dueDate: '2023-11-24',
    taxRate: 0.0825,
    items: [
      { description: 'Website Redesign', qty: 1, price: 5000.00 },
      { description: 'Logo Branding Package', qty: 1, price: 1500.00 },
      { description: 'Social Media Assets (Bundle)', qty: 3, price: 250.00 }
    ]
  }, 'design-studio-invoice.pdf');

  console.log('Invoices generated!');
}

run();
