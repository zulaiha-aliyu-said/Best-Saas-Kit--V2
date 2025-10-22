"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Twitter, Linkedin, Instagram, Mail, Facebook } from "lucide-react";
import { Platform } from "@/lib/platform-optimizer";

interface PlatformPreviewProps {
  platform: Platform;
  content: string;
  displayContent?: string;
  hiddenContent?: string;
  isThread?: boolean;
  threadPosts?: string[];
  metrics?: {
    characterCount: number;
    wordCount: number;
    hashtagCount: number;
    emojiCount: number;
  };
  warnings?: string[];
}

const platformIcons = {
  x: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  email: Mail,
  facebook: Facebook,
  tiktok: Instagram, // Using Instagram icon for TikTok
};

const platformColors = {
  x: "bg-black text-white",
  linkedin: "bg-[#0077B5] text-white",
  instagram: "bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 text-white",
  email: "bg-gray-600 text-white",
  facebook: "bg-[#1877F2] text-white",
  tiktok: "bg-black text-white",
};

const platformNames = {
  x: "Twitter/X",
  linkedin: "LinkedIn",
  instagram: "Instagram",
  email: "Email",
  facebook: "Facebook",
  tiktok: "TikTok",
};

export function PlatformPreview({
  platform,
  content,
  displayContent,
  hiddenContent,
  isThread,
  threadPosts,
  metrics,
  warnings,
}: PlatformPreviewProps) {
  const Icon = platformIcons[platform];
  const colorClass = platformColors[platform];
  const platformName = platformNames[platform];

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${colorClass} pb-3`}>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5" />
            <span>{platformName} Preview</span>
          </div>
          {isThread && (
            <Badge variant="secondary" className="text-xs">
              Thread ({threadPosts?.length || 0} posts)
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Preview Display */}
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          {/* Platform-specific preview */}
          {platform === 'x' && !isThread && (
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm">Your Name</span>
                    <span className="text-muted-foreground text-sm">@yourhandle</span>
                    <span className="text-muted-foreground text-sm">· now</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
                </div>
              </div>
            </div>
          )}

          {platform === 'x' && isThread && threadPosts && (
            <div className="space-y-3">
              {threadPosts.slice(0, 3).map((post, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">Your Name</span>
                      <span className="text-muted-foreground text-sm">@yourhandle</span>
                      <span className="text-muted-foreground text-sm">· now</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{post}</p>
                  </div>
                </div>
              ))}
              {threadPosts.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  ... and {threadPosts.length - 3} more tweets
                </p>
              )}
            </div>
          )}

          {platform === 'linkedin' && (
            <div className="space-y-2">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <p className="font-semibold text-sm">Your Name</p>
                    <p className="text-xs text-muted-foreground">Your Title | Company</p>
                    <p className="text-xs text-muted-foreground">Posted just now</p>
                  </div>
                  <div className="text-sm whitespace-pre-wrap break-words">
                    {displayContent || content.slice(0, 140)}
                    {hiddenContent && (
                      <>
                        <span className="text-muted-foreground">... </span>
                        <button className="text-primary font-medium">see more</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {platform === 'instagram' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600"></div>
                <span className="font-semibold text-sm">yourhandle</span>
              </div>
              <div className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-300 rounded flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Image/Carousel Required</span>
              </div>
              <div className="text-sm whitespace-pre-wrap break-words">
                <span className="font-semibold text-sm mr-2">yourhandle</span>
                {displayContent || content.slice(0, 125)}
                {hiddenContent && (
                  <button className="text-muted-foreground">...more</button>
                )}
              </div>
            </div>
          )}

          {platform === 'email' && (
            <div className="space-y-3">
              <div className="border rounded p-3 bg-background">
                <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                <p className="font-semibold text-sm">{content.split('\n')[0] || 'Your Subject Line'}</p>
              </div>
              <div className="border rounded p-3 bg-background">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <p className="text-sm">{displayContent || content.slice(0, 90)}...</p>
              </div>
            </div>
          )}
        </div>

        {/* Metrics */}
        {metrics && (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Characters</p>
              <p className="text-lg font-semibold">{metrics.characterCount}</p>
            </div>
            <div className="rounded bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Words</p>
              <p className="text-lg font-semibold">{metrics.wordCount}</p>
            </div>
            {metrics.hashtagCount > 0 && (
              <div className="rounded bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Hashtags</p>
                <p className="text-lg font-semibold">{metrics.hashtagCount}</p>
              </div>
            )}
            {metrics.emojiCount > 0 && (
              <div className="rounded bg-muted/50 p-2">
                <p className="text-xs text-muted-foreground">Emojis</p>
                <p className="text-lg font-semibold">{metrics.emojiCount}</p>
              </div>
            )}
          </div>
        )}

        {/* Warnings */}
        {warnings && warnings.length > 0 && (
          <div className="space-y-1">
            {warnings.map((warning, idx) => (
              <div key={idx} className="text-xs text-orange-600 dark:text-orange-400">
                {warning}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}






