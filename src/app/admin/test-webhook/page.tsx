'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export default function TestWebhookPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [emailId, setEmailId] = useState('');

  const testWebhook = async (eventType: string) => {
    if (!emailId) {
      setResult({ error: 'Please enter an email ID first' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/webhooks/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: eventType,
          data: {
            email_id: emailId,
            id: emailId,
          }
        })
      });

      const data = await response.json();

      setResult({
        success: true,
        eventType,
        response: data,
        message: `✅ Webhook event "${eventType}" sent successfully!`
      });
    } catch (error: any) {
      setResult({
        error: error.message,
        eventType
      });
    } finally {
      setLoading(false);
    }
  };

  const events = [
    { type: 'email.delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { type: 'email.opened', label: 'Opened', color: 'bg-blue-100 text-blue-800' },
    { type: 'email.clicked', label: 'Clicked', color: 'bg-purple-100 text-purple-800' },
    { type: 'email.bounced', label: 'Bounced', color: 'bg-red-100 text-red-800' },
    { type: 'email.complained', label: 'Spam Complaint', color: 'bg-orange-100 text-orange-800' },
  ];

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8" />
            Test Email Webhook Events
          </h1>
          <p className="text-muted-foreground mt-2">
            Manually trigger webhook events to test email tracking without needing ngrok
          </p>
        </div>

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to use:</strong>
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>Send a test email campaign from <a href="/admin/ltd/campaigns" className="underline">/admin/ltd/campaigns</a></li>
              <li>Check the terminal logs for the email ID (looks like: <code className="bg-muted px-1">re_abc123...</code>)</li>
              <li>Paste the email ID below</li>
              <li>Click the event buttons to simulate webhook events</li>
              <li>Check <a href="/admin/ltd/email-analytics" className="underline">/admin/ltd/email-analytics</a> to see the tracking update</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Email ID Input */}
        <Card>
          <CardHeader>
            <CardTitle>Enter Email ID</CardTitle>
            <CardDescription>
              The email ID from Resend (e.g., re_abc123xyz or shown in terminal after sending)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emailId">Resend Email ID</Label>
              <Input
                id="emailId"
                placeholder="re_abc123xyz or any test ID"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Check terminal logs after sending an email to find the ID
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Simulate Webhook Events</CardTitle>
            <CardDescription>
              Click buttons to trigger different email events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((event) => (
              <Button
                key={event.type}
                onClick={() => testWebhook(event.type)}
                disabled={loading || !emailId}
                variant="outline"
                className="w-full justify-start"
                size="lg"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className={`mr-3 px-2 py-1 rounded text-xs font-medium ${event.color}`}>
                    {event.label}
                  </span>
                )}
                Test "{event.type}"
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Alert variant={result.error ? 'destructive' : 'default'}>
            {result.error ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <AlertDescription>
              {result.error ? (
                <div>
                  <strong>Error:</strong> {result.error}
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <strong>{result.message}</strong>
                  </div>
                  <div className="text-sm">
                    Event: <Badge variant="outline">{result.eventType}</Badge>
                  </div>
                  <div className="text-sm">
                    Email ID: <code className="bg-muted px-1">{emailId}</code>
                  </div>
                  <div className="text-xs text-muted-foreground mt-3">
                    ✅ Check <a href="/admin/ltd/email-analytics" className="underline font-medium">Email Analytics</a> to see the update
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Test Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-3">
              <Badge variant="outline">1</Badge>
              <div>
                Send a test campaign from <a href="/admin/ltd/campaigns" className="underline font-medium">/admin/ltd/campaigns</a>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline">2</Badge>
              <div>
                Check your terminal for the email ID after sending:
                <pre className="bg-muted p-2 mt-1 text-xs rounded">
                  ✅ Email sent successfully: {'{'}id: 're_abc123xyz'{'}'}
                </pre>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline">3</Badge>
              <div>
                Paste the ID above (or use "test-123" for testing)
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline">4</Badge>
              <div>
                Click "Test email.opened" button
              </div>
            </div>
            <div className="flex gap-3">
              <Badge variant="outline">5</Badge>
              <div>
                Go to <a href="/admin/ltd/email-analytics" className="underline font-medium">/admin/ltd/email-analytics</a> and see the email marked as opened!
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Production Setup Info */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>For Production:</strong> Set up a real webhook in Resend to automatically track opens/clicks.
            <br />
            See <code className="bg-muted px-1">RESEND_WEBHOOK_SETUP.md</code> for instructions.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

