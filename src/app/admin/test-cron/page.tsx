'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, Mail, Calendar } from 'lucide-react';

export default function TestCronPage() {
  const [loading, setLoading] = useState('');
  const [results, setResults] = useState<Record<string, any>>({});

  const runCron = async (endpoint: string, name: string) => {
    setLoading(endpoint);
    setResults((prev) => ({ ...prev, [endpoint]: null }));

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      setResults((prev) => ({ ...prev, [endpoint]: { success: response.ok, data } }));
    } catch (error: any) {
      setResults((prev) => ({ ...prev, [endpoint]: { success: false, error: error.message } }));
    } finally {
      setLoading('');
    }
  };

  const cronJobs = [
    {
      endpoint: '/api/cron/credit-refresh',
      name: 'Credit Refresh',
      description: 'Refresh monthly credits for users whose reset date has passed',
      icon: RefreshCw,
      schedule: 'Daily at 12:00 AM',
    },
    {
      endpoint: '/api/cron/check-low-credits',
      name: 'Low Credit Warnings',
      description: 'Send emails to users with less than 20% credits remaining',
      icon: Mail,
      schedule: 'Daily at 12:00 PM',
    },
    {
      endpoint: '/api/cron/expire-codes',
      name: 'Expire Old Codes',
      description: 'Disable LTD codes that have passed their expiration date',
      icon: Calendar,
      schedule: 'Daily at 1:00 AM',
    },
  ];

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test Cron Jobs</h1>
          <p className="text-muted-foreground mt-2">
            Manually trigger automated tasks to test functionality
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> In production, these cron jobs run automatically on schedule.
            Use this page for testing only.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4">
          {cronJobs.map((job) => {
            const Icon = job.icon;
            const result = results[job.endpoint];
            
            return (
              <Card key={job.endpoint}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-0.5" />
                      <div>
                        <CardTitle>{job.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {job.description}
                        </CardDescription>
                        <Badge variant="outline" className="mt-2">
                          {job.schedule}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => runCron(job.endpoint, job.name)}
                      disabled={loading !== ''}
                      size="sm"
                    >
                      {loading === job.endpoint ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Icon className="mr-2 h-4 w-4" />
                          Run Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {result && (
                  <CardContent>
                    <Alert variant={result.success ? 'default' : 'destructive'}>
                      {result.success ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {result.success ? (
                          <div className="space-y-2">
                            <div>
                              <strong>✅ Success!</strong>
                            </div>
                            {result.data?.message && (
                              <div className="text-sm">{result.data.message}</div>
                            )}
                            {result.data?.refreshed !== undefined && (
                              <div className="text-sm">
                                <strong>Processed:</strong> {result.data.refreshed} users
                              </div>
                            )}
                            {result.data?.sent !== undefined && (
                              <div className="text-sm">
                                <strong>Emails sent:</strong> {result.data.sent}
                              </div>
                            )}
                            {result.data?.expired !== undefined && (
                              <div className="text-sm">
                                <strong>Codes expired:</strong> {result.data.expired}
                              </div>
                            )}
                            {result.data?.users && (
                              <details className="mt-2">
                                <summary className="text-sm cursor-pointer font-medium">
                                  View details ({result.data.users.length} users)
                                </summary>
                                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                                  {JSON.stringify(result.data.users, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        ) : (
                          <div>
                            <strong>❌ Error:</strong> {result.error || result.data?.error || 'Failed'}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Production Setup</CardTitle>
            <CardDescription>
              How to enable automatic cron jobs in production
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>Vercel:</strong> Cron jobs are configured in <code className="bg-muted px-1">vercel.json</code>.
              They'll run automatically once deployed.
            </div>
            <div>
              <strong>Other platforms:</strong> Use GitHub Actions, AWS Lambda, or external cron services
              to call these endpoints daily.
            </div>
            <div className="p-3 bg-muted rounded">
              <div className="font-medium mb-2">Cron Schedules:</div>
              <ul className="space-y-1 text-xs">
                <li>• Credit Refresh: Daily at 12:00 AM (0 0 * * *)</li>
                <li>• Low Credit Warnings: Daily at 12:00 PM (0 12 * * *)</li>
                <li>• Expire Codes: Daily at 1:00 AM (0 1 * * *)</li>
              </ul>
            </div>
            <div>
              <strong>Security:</strong> Set <code className="bg-muted px-1">CRON_SECRET</code> in
              environment variables and pass it as Authorization header for production.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

