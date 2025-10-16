import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    let extractedText = '';

    // Handle different file types
    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      // Plain text files
      extractedText = await file.text();
    } else if (fileName.endsWith('.html')) {
      // HTML files - strip HTML tags
      const htmlContent = await file.text();
      extractedText = htmlContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } else if (fileName.endsWith('.pdf')) {
      return NextResponse.json(
        { 
          error: 'PDF files are not supported yet. Please convert to TXT or copy the text manually.',
          text: ''
        },
        { status: 400 }
      );
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return NextResponse.json(
        { 
          error: 'Word documents are not supported yet. Please convert to TXT or copy the text manually.',
          text: ''
        },
        { status: 400 }
      );
    } else {
      // Try to read as text anyway
      try {
        extractedText = await file.text();
      } catch {
        return NextResponse.json(
          { error: 'Unsupported file type. Please upload TXT, MD, or HTML files.' },
          { status: 400 }
        );
      }
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!extractedText) {
      return NextResponse.json(
        { error: 'No text could be extracted from the file' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      fileName: file.name,
      fileSize: file.size,
      characterCount: extractedText.length,
    });

  } catch (error: any) {
    console.error('File extraction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract text from file' },
      { status: 500 }
    );
  }
}
