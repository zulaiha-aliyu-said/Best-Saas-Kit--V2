'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mail, 
  Send, 
  Users, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Info
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function CampaignsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    targetTiers: [] as number[],
    includeStackers: undefined as boolean | undefined,
    minCredits: undefined as number | undefined,
    maxCredits: undefined as number | undefined,
  });

  const handleTierToggle = (tier: number) => {
    setFormData(prev => ({
      ...prev,
      targetTiers: prev.targetTiers.includes(tier)
        ? prev.targetTiers.filter(t => t !== tier)
        : [...prev.targetTiers, tier]
    }));
  };

  const handleSend = async () => {
    if (!formData.subject || !formData.message) {
      setResult({ error: 'Subject and message are required' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/ltd/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          ...data
        });
        // Reset form
        setFormData({
          subject: '',
          message: '',
          targetTiers: [],
          includeStackers: undefined,
          minCredits: undefined,
          maxCredits: undefined,
        });
      } else {
        setResult({ error: data.error || 'Failed to send campaign' });
      }
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">📧 Email Campaigns</h1>
        <p className="text-muted-foreground mt-2">
          Send targeted email campaigns to your LTD users
        </p>
      </div>

      {/* Result Alert */}
      {result && (
        <Alert variant={result.success ? 'default' : 'destructive'}>
          {result.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {result.success ? (
              <div>
                <p className="font-medium">Campaign sent successfully!</p>
                <p className="text-sm mt-1">
                  Targeted: {result.targeted} users | 
                  Sent: {result.sent} | 
                  Failed: {result.failed}
                </p>
                {result.errors && (
                  <details className="mt-2 text-xs">
                    <summary className="cursor-pointer">View errors</summary>
                    <ul className="mt-2 space-y-1">
                      {result.errors.map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ) : (
              result.error
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email Composer */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Compose Email
            </CardTitle>
            <CardDescription>
              Create your email campaign message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                placeholder="Your amazing subject line..."
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Hi {{name}},

We have exciting news to share with you...

Available placeholders:
- {{name}} - User's name
- {{email}} - User's email
- {{tier}} - User's LTD tier
- {{credits}} - User's current credits"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={12}
                className="font-mono text-sm"
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Available placeholders:</strong><br />
                • {'{{'} name {'}}'}  - User's name<br />
                • {'{{'} email {'}}'}  - User's email<br />
                • {'{{'} tier {'}}'}  - LTD tier number<br />
                • {'{{'} credits {'}}'}  - Current credits
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Targeting Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Target Audience
              </CardTitle>
              <CardDescription>
                Select who should receive this campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Target by Tier */}
              <div className="space-y-3">
                <Label>LTD Tiers</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((tier) => (
                    <div
                      key={tier}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.targetTiers.includes(tier)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground/50'
                      }`}
                      onClick={() => handleTierToggle(tier)}
                    >
                      <Checkbox
                        checked={formData.targetTiers.includes(tier)}
                        onCheckedChange={() => handleTierToggle(tier)}
                      />
                      <Label className="cursor-pointer flex-1">
                        Tier {tier}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.targetTiers.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No tiers selected = All tiers
                  </p>
                )}
              </div>

              {/* Stackers Filter */}
              <div className="space-y-3">
                <Label>Code Stacking</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.includeStackers === true ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, includeStackers: true })}
                  >
                    Only Stackers
                  </Button>
                  <Button
                    type="button"
                    variant={formData.includeStackers === false ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, includeStackers: false })}
                  >
                    Only Single Code
                  </Button>
                  <Button
                    type="button"
                    variant={formData.includeStackers === undefined ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({ ...formData, includeStackers: undefined })}
                  >
                    All
                  </Button>
                </div>
              </div>

              {/* Credit Range */}
              <div className="space-y-3">
                <Label>Credit Range</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      type="number"
                      placeholder="Min credits"
                      value={formData.minCredits || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        minCredits: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Max credits"
                      value={formData.maxCredits || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        maxCredits: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Send Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleSend}
                disabled={loading || !formData.subject || !formData.message}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending Campaign...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Send Campaign
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                This will send emails to all matching users immediately
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}





