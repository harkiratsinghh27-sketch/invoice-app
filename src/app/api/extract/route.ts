import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import { promises as fs } from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Initialize the Google Gen AI SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read the file into a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Prepare prompt
    const prompt = `
      You are an expert invoice extraction AI. 
      Extract the following information from the provided invoice and return it as a structured JSON object.
      Do not include markdown blocks, just return raw JSON.
      
      Required schema:
      {
        "vendorName": string | null,
        "vendorAddress": string | null,
        "invoiceNumber": string | null,
        "invoiceDate": "YYYY-MM-DD" | null,
        "dueDate": "YYYY-MM-DD" | null,
        "currency": string | null,
        "subtotal": number | null,
        "tax": number | null,
        "discount": number | null,
        "total": number | null,
        "lineItems": [
          {
            "description": string,
            "quantity": number | null,
            "unitPrice": number | null,
            "tax": number | null,
            "total": number | null
          }
        ]
      }
      
      If a field cannot be confidently extracted, use null.
    `;

    // We convert the file to base64 to send to Gemini API
    const base64File = buffer.toString('base64');
    
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64File,
                mimeType: file.type
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("AI returned no text");
    }

    const extractedData = JSON.parse(text);

    // Note: In a real app we'd first ensure a User exists and handle auth
    // For local MVP, we'll create a dummy user if none exists
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          name: 'Demo User'
        }
      });
    }

    // Save file locally for preview
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const extension = file.name.split('.').pop() || 'pdf';
    // Use a unique ID for the filename
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    await fs.writeFile(filePath, buffer);
    const fileUrl = `/uploads/${uniqueFilename}`;

    // Save to Database
    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        fileUrl: fileUrl,
        vendorName: extractedData.vendorName,
        vendorAddress: extractedData.vendorAddress,
        invoiceNumber: extractedData.invoiceNumber,
        invoiceDate: extractedData.invoiceDate ? new Date(extractedData.invoiceDate) : null,
        dueDate: extractedData.dueDate ? new Date(extractedData.dueDate) : null,
        currency: extractedData.currency,
        subtotal: extractedData.subtotal,
        tax: extractedData.tax,
        discount: extractedData.discount,
        total: extractedData.total,
        status: 'REVIEWED', // It needs human review now
        processingStatus: 'COMPLETED',
        originalFileName: file.name,
        lineItems: {
          create: extractedData.lineItems?.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            tax: item.tax,
            total: item.total
          })) || []
        }
      }
    });

    return NextResponse.json({ success: true, invoice });
    
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: 'Failed to extract invoice data', details: error.message }, 
      { status: 500 }
    );
  }
}
