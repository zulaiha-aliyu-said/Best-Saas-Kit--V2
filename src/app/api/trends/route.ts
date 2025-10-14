import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function GET() {
  // Simple mocked trends for now; later pull from trends_cache
  const data = {
    twitter: ['#AIRevolution','#TechTrends','#Innovation','#ContentCreation','#RemoteWork','#Productivity'],
    linkedin: ['#Leadership','#CareerDevelopment','#Networking','#ThoughtLeadership','#DigitalMarketing'],
  };
  return NextResponse.json(data);
}