import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // In a real app, get user from auth session
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          name: 'Demo User'
        }
      });
    }

    // Fetch all user invoices to provide as context
    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
      include: { lineItems: true }
    });

    // Simplify invoice data for prompt context to save tokens
    const invoiceData = invoices.map(inv => ({
      id: inv.id,
      number: inv.invoiceNumber,
      vendor: inv.vendorName,
      date: inv.invoiceDate,
      due: inv.dueDate,
      total: inv.total,
      status: inv.status,
      items: inv.lineItems.map(li => li.description)
    }));

    const prompt = `
      You are an AI Invoice Assistant for a professional invoice management app.
      Answer the user's question accurately using ONLY the provided invoice data.
      
      CRITICAL FORMATTING INSTRUCTIONS:
      - Always format your responses beautifully using Markdown.
      - Use clean, standard Markdown tables for listing multiple invoices or data points.
      - Keep table columns concise so they fit well on the screen. 
      - Do NOT include massive lists of items inside a single table cell; summarize them instead (e.g., "3 items").
      - Use bold text for emphasis and bullet points for lists.
      - Do not hallucinate data. If you don't know the answer based on the data, say so.

      User's Invoice Data:
      ${JSON.stringify(invoiceData, null, 2)}

      User's Message:
      ${message}
    `;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    const reply = response.text || 'I am sorry, I could not generate a response.';

    return NextResponse.json({ reply });
    
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error.message }, 
      { status: 500 }
    );
  }
}
