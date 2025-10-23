# 🔐 LTD Feature Gating - Practical Examples

## Real-World Implementation Examples

### 1. Protecting API Endpoints

#### Example: Viral Hook Generator API
```typescript
// src/app/api/viral-hooks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireFeature, requireCredits } from '@/lib/feature-gate';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = parseInt(session.user.id);
    const body = await request.json();
    
    // Step 1: Check if user has access to viral hooks (Tier 2+)
    try {
      await requireFeature(userId, 'viral_hooks.enabled');
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Viral hook generator requires Tier 2 or higher',
          upgradeRequired: 2,
          upgradeUrl: '/dashboard/ltd-pricing'
        },
        { status: 403 }
      );
    }
    
    // Step 2: Check and deduct credits (2 credits for viral hook)
    let remaining;
    try {
      remaining = await requireCredits(userId, 'viral_hook', 2);
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Insufficient credits. Need 2 credits for viral hook generation.',
          upgradeUrl: '/dashboard/ltd-pricing'
        },
        { status: 402 }
      );
    }
    
    // Step 3: Generate viral hook
    const hook = await generateViralHook(body.topic);
    
    return NextResponse.json({
      success: true,
      hook,
      credits_remaining: remaining,
      credits_used: 2,
    });
  } catch (error) {
    console.error('Error generating viral hook:', error);
    return NextResponse.json(
      { error: 'Failed to generate viral hook' },
      { status: 500 }
    );
  }
}
```

---

### 2. Client Component with Feature Check

#### Example: AI Chat Interface
```typescript
// src/components/features/AIChatButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLTDFeatures } from '@/hooks/useLTDFeatures';
import { MessageSquare, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export function AIChatButton() {
  const { features, plan, loading, hasFeature } = useLTDFeatures();
  const [showChat, setShowChat] = useState(false);

  if (loading) {
    return <Button disabled>Loading...</Button>;
  }

  const canUseChat = hasFeature('ai_chat.enabled');
  const messagesLimit = features?.ai_chat?.messages_per_month;

  if (!canUseChat) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full">
          <Lock className="w-4 h-4 mr-2" />
          AI Chat (Tier 3+)
        </Button>
        <Alert>
          <AlertDescription className="text-sm">
            AI Chat requires{' '}
            <Link href="/dashboard/ltd-pricing" className="font-semibold underline">
              Tier 3 or higher
            </Link>
            . Upgrade to unlock unlimited conversations!
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={() => setShowChat(true)} className="w-full">
        <MessageSquare className="w-4 h-4 mr-2" />
        Open AI Chat
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        {messagesLimit === 'unlimited' 
          ? 'Unlimited messages' 
          : `${messagesLimit} messages/month`}
      </p>
    </div>
  );
}
```

---

### 3. Conditional UI Based on Tier

#### Example: Scheduling Feature
```typescript
// src/components/features/SchedulingCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLTDFeatures } from '@/hooks/useLTDFeatures';
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function SchedulingCard() {
  const { features, plan, hasFeature } = useLTDFeatures();
  
  const canSchedule = hasFeature('scheduling.enabled');
  const schedulingData = features?.scheduling;

  if (!canSchedule) {
    // Show upgrade prompt for Tier 1 users
    return (
      <Card className="border-dashed opacity-60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Content Scheduling
            </CardTitle>
            <Badge variant="secondary">Tier 2+</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Schedule posts across multiple platforms with our smart scheduling system.
          </p>
          <Button variant="outline" className="w-full" asChild>
            <a href="/dashboard/ltd-pricing">
              Upgrade to Tier 2 <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show full feature for Tier 2+ users
  const postsPerMonth = schedulingData?.posts_per_month;
  const hasBulk = schedulingData?.bulk;
  const hasAutoPosting = schedulingData?.auto_posting;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Content Scheduling
          </CardTitle>
          <Badge variant="default">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Posts/Month</p>
            <p className="text-2xl font-bold">
              {postsPerMonth === 'unlimited' ? '∞' : postsPerMonth}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Features</p>
            <div className="space-y-1 mt-1">
              {hasBulk && <Badge variant="secondary">Bulk</Badge>}
              {hasAutoPosting && <Badge variant="secondary">Auto-Post</Badge>}
            </div>
          </div>
        </div>
        
        <Button className="w-full">
          Schedule New Post
        </Button>
      </CardContent>
    </Card>
  );
}
```

---

### 4. Middleware for Protected Routes

#### Example: Admin Features Route Protection
```typescript
// src/middleware.ts or in route handler
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getUserPlan } from '@/lib/feature-gate';

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Protect team collaboration routes (Tier 4 only)
  if (path.startsWith('/dashboard/team')) {
    const token = await getToken({ req: request });
    
    if (!token?.sub) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    const userId = parseInt(token.sub);
    const plan = await getUserPlan(userId);
    
    if (!plan || plan.ltd_tier !== 4) {
      return NextResponse.redirect(new URL('/dashboard/ltd-pricing', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/team/:path*'],
};
```

---

### 5. Dynamic Feature Limits

#### Example: Template Selection
```typescript
// src/components/features/TemplateSelector.tsx
'use client';

import { useLTDFeatures } from '@/hooks/useLTDFeatures';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

export function TemplateSelector({ templates }: { templates: Template[] }) {
  const { features, plan } = useLTDFeatures();
  
  const repurposingData = features?.content_repurposing;
  const templateLimit = repurposingData?.templates;
  const customTemplates = repurposingData?.custom_templates;
  
  const availableTemplates = templateLimit === 'unlimited' 
    ? templates 
    : templates.slice(0, templateLimit);
  
  const lockedTemplates = templateLimit === 'unlimited' 
    ? [] 
    : templates.slice(templateLimit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Templates</h3>
        <Badge>
          {templateLimit === 'unlimited' 
            ? 'Unlimited' 
            : `${availableTemplates.length}/${templates.length}`}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Available templates */}
        {availableTemplates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
        
        {/* Locked templates */}
        {lockedTemplates.map((template) => (
          <TemplateCard 
            key={template.id} 
            template={template} 
            locked 
            requiredTier={getRequiredTier(templates.indexOf(template) + 1)}
          />
        ))}
      </div>
      
      {/* Custom templates info */}
      {customTemplates !== undefined && (
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm font-medium mb-1">Custom Templates</p>
          <p className="text-sm text-muted-foreground">
            {customTemplates === 'unlimited' 
              ? 'Create unlimited custom templates' 
              : `Create up to ${customTemplates} custom templates`}
          </p>
        </div>
      )}
    </div>
  );
}

function getRequiredTier(templateNumber: number): number {
  if (templateNumber <= 15) return 1;
  if (templateNumber <= 40) return 2;
  return 3;
}
```

---

### 6. Credit Usage with Feedback

#### Example: Content Generation with Credit Check
```typescript
// src/components/features/ContentGenerator.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLTDCredits } from '@/hooks/useLTDFeatures';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

export function ContentGenerator() {
  const { credits, deductCredits } = useLTDCredits();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!credits || credits.credits < 1) {
      setError('Insufficient credits. You need at least 1 credit to generate content.');
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      // Deduct credits first
      await deductCredits('content_repurposing', 1, {
        platform: 'twitter',
        timestamp: new Date().toISOString(),
      });

      // Generate content
      const response = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* your data */ }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      // Handle success
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      // Note: Credits already deducted, you may want to refund
    } finally {
      setGenerating(false);
    }
  };

  const canAfford = credits && credits.credits >= 1;
  const lowCredits = credits && credits.percentage_used >= 80;

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {lowCredits && (
        <Alert>
          <AlertDescription>
            You're running low on credits ({credits?.credits} remaining). 
            Consider{' '}
            <a href="/dashboard/ltd-pricing" className="underline font-semibold">
              stacking codes
            </a>{' '}
            for more credits!
          </AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleGenerate}
        disabled={!canAfford || generating}
        className="w-full"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            Generate Content (1 credit)
          </>
        )}
      </Button>

      {credits && (
        <p className="text-xs text-center text-muted-foreground">
          {credits.credits} credits remaining
        </p>
      )}
    </div>
  );
}
```

---

### 7. Feature Comparison in Settings

#### Example: Settings Page with Tier Comparison
```typescript
// src/app/dashboard/settings/features/page.tsx
import { auth } from '@/lib/auth';
import { getUserPlan, getUserFeatures } from '@/lib/feature-gate';
import { getLTDTierConfig } from '@/lib/ltd-tiers';
import { redirect } from 'next/navigation';

export default async function FeaturesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/auth/signin');

  const userId = parseInt(session.user.id);
  const plan = await getUserPlan(userId);
  const features = await getUserFeatures(userId);

  if (!plan) {
    return <div>Plan not found</div>;
  }

  const currentTierConfig = plan.ltd_tier 
    ? getLTDTierConfig(plan.ltd_tier) 
    : null;

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Your Features</h1>
        <p className="text-muted-foreground">
          {plan.plan_type === 'ltd' 
            ? `LTD Tier ${plan.ltd_tier} • ${currentTierConfig?.name}` 
            : plan.subscription_status}
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeatureCard
          title="Content Repurposing"
          enabled={true}
          details={features?.content_repurposing}
        />
        <FeatureCard
          title="Viral Hook Generator"
          enabled={features?.viral_hooks?.enabled}
          details={features?.viral_hooks}
          requiredTier={2}
        />
        <FeatureCard
          title="AI Chat Assistant"
          enabled={features?.ai_chat?.enabled}
          details={features?.ai_chat}
          requiredTier={3}
        />
        <FeatureCard
          title="Team Collaboration"
          enabled={features?.team_collaboration?.enabled}
          details={features?.team_collaboration}
          requiredTier={4}
        />
      </div>
    </div>
  );
}
```

---

## Key Patterns

### ✅ Always Check Access Server-Side
Never trust client-side checks for security. Always verify on the server.

### ✅ Provide Clear Upgrade Paths
When a feature is locked, show the user exactly what tier they need.

### ✅ Deduct Credits Atomically
Use transactions and the provided `deductCredits` function to avoid race conditions.

### ✅ Handle Insufficient Credits Gracefully
Show clear messages and offer upgrade options when credits run out.

### ✅ Use the Hooks
The `useLTDFeatures` and `useLTDCredits` hooks make client-side checks easy.

---

**See `LTD_IMPLEMENTATION_COMPLETE.md` for more details!**

