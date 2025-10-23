"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Download, MessageSquare, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreditsDisplay } from "@/components/credits/credits-display";
import { UpgradePrompt } from "@/components/upgrade/UpgradePrompt";

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  className?: string;
  title?: string;
  placeholder?: string;
}

export function ChatInterface({ 
  className, 
  title = "AI Chat Assistant",
  placeholder = "Ask me anything..."
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [tierInfo, setTierInfo] = useState<{ currentTier: number; requiredTier: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle tier restriction with upgrade prompt
        if (response.status === 403 && errorData.code === 'TIER_RESTRICTED') {
          setTierInfo({ currentTier: errorData.currentTier, requiredTier: errorData.requiredTier });
          setShowUpgrade(true);
          setIsLoading(false);
          // Remove the user message since we're showing upgrade prompt
          setMessages(prev => prev.slice(0, -1));
          return;
        }

        // Also check for tier restriction in error message (fallback)
        if (response.status === 403 || errorData.error?.includes('Tier 3+ Required')) {
          setTierInfo({ 
            currentTier: errorData.currentTier || 1, 
            requiredTier: errorData.requiredTier || 3 
          });
          setShowUpgrade(true);
          setIsLoading(false);
          // Remove the user message since we're showing upgrade prompt
          setMessages(prev => prev.slice(0, -1));
          return;
        }

        // Handle credit-specific errors
        if (errorData.code === 'INSUFFICIENT_CREDITS') {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: '⚠️ You don\'t have enough credits to send this message. You need at least 1 credit per message.',
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, errorMessage]);
          return;
        }

        // For any other error, show in chat instead of throwing
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ ${errorData.error || 'Failed to get response'}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      // Update credits if returned
      if (typeof data.credits === 'number') {
        setCredits(data.credits);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message.content,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted, don't show error
        return;
      }
      
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  const exportChat = () => {
    const chatData = {
      title,
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("flex flex-col h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {title}
        </CardTitle>
        <div className="flex items-center gap-2">
          <CreditsDisplay showRefresh />
          {messages.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={exportChat}
                className="h-8"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="h-8"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Upgrade Prompt or Messages Area */}
        {showUpgrade && tierInfo ? (
          <div className="flex-1 overflow-y-auto p-6">
            <UpgradePrompt
              featureName="AI Chat Assistant"
              currentTier={tierInfo.currentTier}
              requiredTier={tierInfo.requiredTier}
              variant="inline"
              benefits={[
                "200 AI chat messages per month (Tier 3)",
                "Unlimited messages (Tier 4)",
                "Context-aware conversations",
                "Content brainstorming & research",
                "750 credits/month (Tier 3)",
                "Premium AI models access"
              ]}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full p-8">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-muted-foreground">
                    Ask me anything and I'll help you with information, analysis, or creative tasks.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <ChatMessage
                    message={{
                      id: 'loading',
                      role: 'assistant',
                      content: '',
                      timestamp: new Date(),
                    }}
                    isLoading={true}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        {!showUpgrade && (
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onStop={handleStop}
            placeholder={placeholder}
          />
        )}
      </CardContent>
    </Card>
  );
}
