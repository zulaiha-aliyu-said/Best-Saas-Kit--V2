'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function GenerateCodesPage() {
  const [tier, setTier] = useState<number>(3);
  const [quantity, setQuantity] = useState<number>(10);
  const [prefix, setPrefix] = useState<string>('');
  const [maxRedemptions, setMaxRedemptions] = useState<number>(1);
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [generatedCodes, setGeneratedCodes] = useState<any[]>([]);
  const [batchId, setBatchId] = useState<string>('');

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const response = await fetch('/api/admin/ltd/codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          quantity,
          prefix: prefix || undefined,
          maxRedemptions,
          expiresAt: expiresAt || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate codes');
      }

      setGeneratedCodes(data.codes);
      setBatchId(data.batchId);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await fetch('/api/admin/ltd/codes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          quantity,
          prefix: prefix || undefined,
          maxRedemptions,
          expiresAt: expiresAt || undefined,
          notes: notes || undefined,
          exportCsv: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate codes');
      }

      // Download CSV
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ltd-codes-tier${tier}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setGeneratedCodes(data.codes);
      setBatchId(data.batchId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Generate LTD Codes</h1>
        <p className="text-muted-foreground mt-2">
          Create new lifetime deal redemption codes
        </p>
      </div>

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Successfully generated {generatedCodes.length} codes! Batch ID: {batchId}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Code Configuration</CardTitle>
          <CardDescription>
            Configure the codes you want to generate. Maximum 1000 codes per batch.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Tier Selection */}
          <div className="space-y-2">
            <Label htmlFor="tier">Tier</Label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((t) => (
                <button
                  key={t}
                  onClick={() => setTier(t)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    tier === t
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-bold text-lg">Tier {t}</div>
                  <div className="text-sm text-muted-foreground">
                    {t === 1 && '$59'}
                    {t === 2 && '$139'}
                    {t === 3 && '$249'}
                    {t === 4 && '$449'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              max={1000}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              placeholder="10"
            />
            <p className="text-sm text-muted-foreground">
              Number of codes to generate (1-1000)
            </p>
          </div>

          {/* Code Prefix */}
          <div className="space-y-2">
            <Label htmlFor="prefix">Code Prefix (Optional)</Label>
            <Input
              id="prefix"
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              placeholder={`LTD-T${tier}-`}
            />
            <p className="text-sm text-muted-foreground">
              Custom prefix for generated codes. Default: LTD-T{tier}-
            </p>
          </div>

          {/* Max Redemptions */}
          <div className="space-y-2">
            <Label htmlFor="maxRedemptions">Max Uses per Code</Label>
            <Input
              id="maxRedemptions"
              type="number"
              min={1}
              max={100}
              value={maxRedemptions}
              onChange={(e) => setMaxRedemptions(parseInt(e.target.value) || 1)}
              placeholder="1"
            />
            <p className="text-sm text-muted-foreground">
              How many times each code can be redeemed (usually 1 for single-use)
            </p>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
            <Input
              id="expiresAt"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Leave empty for codes that never expire
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Lifetime Deal Batch #3, Black Friday Sale 2025"
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              Internal notes for this batch of codes
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={loading}
              size="lg"
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Codes'
              )}
            </Button>
            <Button
              onClick={handleDownloadCSV}
              disabled={loading}
              variant="outline"
              size="lg"
            >
              <Download className="mr-2 h-4 w-4" />
              Generate & Download CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Codes Preview */}
      {generatedCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Codes Preview</CardTitle>
            <CardDescription>
              {generatedCodes.length} codes generated (Showing first 20)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {generatedCodes.slice(0, 20).map((code) => (
                <div
                  key={code.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                >
                  <code className="font-mono text-sm font-bold">{code.code}</code>
                  <span className="text-sm text-muted-foreground">
                    Tier {code.tier} • {code.max_redemptions} use(s)
                  </span>
                </div>
              ))}
              {generatedCodes.length > 20 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  ... and {generatedCodes.length - 20} more codes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}





