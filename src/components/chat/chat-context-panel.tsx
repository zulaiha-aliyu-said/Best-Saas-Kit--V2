'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  Repeat2, 
  TrendingUp, 
  Users,
  Copy,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ChatContext {
  recent_hooks?: Array<{
    hook: string;
    category: string;
    created_at: Date;
  }>;
  recent_repurposed?: Array<{
    platform: string;
    created_at: Date;
  }>;
  writing_style?: {
    tone: string;
    enabled: boolean;
  };
  competitor_count?: number;
}

interface ChatContextPanelProps {
  onInsertContext?: (context: string) => void;
  className?: string;
}

export function ChatContextPanel({ onInsertContext, className }: ChatContextPanelProps) {
  const [context, setContext] = useState<ChatContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContext();
  }, []);

  const fetchContext = async () => {
    try {
      // Context is fetched server-side in the API route
      // This component just displays static info for now
      // In a real implementation, you might fetch user stats here
      setLoading(false);
    } catch (error) {
      console.error('Error fetching context:', error);
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const insertIntoChat = (text: string) => {
    if (onInsertContext) {
      onInsertContext(text);
    }
  };

  if (loading) {
    return (
      <div className={className}>
        <Card>
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-xs">
              Common tasks and prompts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() =>
                insertIntoChat('Give me 10 content ideas about [your topic]')
              }
            >
              <Sparkles className="h-3 w-3 mr-2" />
              Generate Content Ideas
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() =>
                insertIntoChat('Analyze this trend and suggest content angles')
              }
            >
              <TrendingUp className="h-3 w-3 mr-2" />
              Analyze Trends
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() =>
                insertIntoChat('Create a 7-day content calendar for [platform]')
              }
            >
              <Repeat2 className="h-3 w-3 mr-2" />
              Content Calendar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() =>
                insertIntoChat('Help me improve this draft: [paste your content]')
              }
            >
              <Sparkles className="h-3 w-3 mr-2" />
              Improve Draft
            </Button>
          </CardContent>
        </Card>

        {/* Context Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              Your Activity
            </CardTitle>
            <CardDescription className="text-xs">
              AI knows your recent work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Viral Hooks</span>
              </div>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                <Link href="/dashboard/hooks">
                  View All <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Repeat2 className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Repurposed Content</span>
              </div>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                <Link href="/dashboard/repurpose">
                  Create <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Trending Topics</span>
              </div>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                <Link href="/dashboard/trends">
                  Explore <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Competitors</span>
              </div>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                <Link href="/dashboard/competitors">
                  Analyze <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>AI remembers your writing style and recent work</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Ask specific questions for better answers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>Reference your past content for consistency</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


