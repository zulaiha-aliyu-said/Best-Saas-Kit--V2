import { NextRequest, NextResponse } from "next/server";
import { getAyrshareClient } from "@/lib/ayrshare";

export const runtime = 'nodejs';

// Test Ayrshare API connection
export async function GET(req: NextRequest) {
  try {
    console.log('Testing Ayrshare API connection...');
    console.log('API Key exists:', !!process.env.AYRSHARE_API_KEY);
    console.log('API Key preview:', process.env.AYRSHARE_API_KEY ? `${process.env.AYRSHARE_API_KEY.substring(0, 10)}...` : 'No API key');
    
    const ayrshareClient = getAyrshareClient();
    const accounts = await ayrshareClient.getConnectedAccounts();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Ayrshare API connection successful',
      accountsCount: accounts.length,
      accounts: accounts
    });
  } catch (error: any) {
    console.error('Ayrshare API test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: 'Check your AYRSHARE_API_KEY in .env.local file'
    }, { status: 500 });
  }
}







