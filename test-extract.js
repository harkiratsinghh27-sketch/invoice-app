const fs = require('fs');

async function testExtract() {
  try {
    const fileBase64 = fs.readFileSync('demo-invoice.pdf', 'base64');
    
    const response = await fetch('http://localhost:3000/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file: `data:application/pdf;base64,${fileBase64}`,
        fileName: 'demo-invoice.pdf',
        fileType: 'application/pdf'
      })
    });
    
    const data = await response.json();
    console.log("Extraction Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Test error:", err);
  }
}

testExtract();
