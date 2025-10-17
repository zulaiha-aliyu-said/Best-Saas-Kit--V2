"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    console.log('🧪 Testing API...');
    
    try {
      const response = await fetch('/api/trends/test');
      const data = await response.json();
      console.log('🧪 Test Result:', data);
      setResult(data);
    } catch (error) {
      console.error('🧪 Test Error:', error);
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testTrendsAPI = async () => {
    setLoading(true);
    console.log('🧪 Testing Trends API...');
    
    try {
      const response = await fetch('/api/trends?platform=all&category=all');
      const data = await response.json();
      console.log('🧪 Trends Result:', data);
      setResult({
        ...data,
        topicsCount: data.topics?.length,
        sources: data.topics?.map((t: any) => t.source).filter(Boolean),
      });
    } catch (error) {
      console.error('🧪 Trends Error:', error);
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testDebugAPI = async () => {
    setLoading(true);
    console.log('🔍 Testing Debug API (Check Terminal!)...');
    
    try {
      const response = await fetch('/api/trends/debug');
      const data = await response.json();
      console.log('🔍 Debug Result:', data);
      setResult(data);
    } catch (error) {
      console.error('🔍 Debug Error:', error);
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>API Diagnostics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button onClick={testAPI} disabled={loading}>
              Test API Status
            </Button>
            <Button onClick={testTrendsAPI} disabled={loading}>
              Test Trends API
            </Button>
            <Button onClick={testDebugAPI} disabled={loading} variant="secondary">
              🔍 Debug Fetch (Check Terminal!)
            </Button>
          </div>

          {result && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Result:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h3 className="font-bold mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Open browser console (F12)</li>
              <li>Click "Test API Status" to check environment</li>
              <li>Click "Test Trends API" to fetch trends</li>
              <li>Check console for detailed logs</li>
              <li>Check terminal for server logs</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
