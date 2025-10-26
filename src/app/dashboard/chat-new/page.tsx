'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatHistory } from '@/components/chat/chat-history';
import { ChatContextPanel } from '@/components/chat/chat-context-panel';
import PromptLibraryPanel from '@/components/chat/prompt-library-panel';
import SavePromptModal from '@/components/chat/save-prompt-modal';
import { ChatMessage } from '@/components/chat/chat-message';
import { UpgradePrompt } from '@/components/upgrade/UpgradePrompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Loader2, 
  Bot,
  Sparkles,
  BookmarkPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date;
}

export default function ChatPageNew() {
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationTitle, setConversationTitle] = useState('New Conversation');
  const [showSavePromptModal, setShowSavePromptModal] = useState(false);
  const [promptRefreshKey, setPromptRefreshKey] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [tierInfo, setTierInfo] = useState<{ currentTier: number; requiredTier: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create new conversation
  const handleNewConversation = async () => {
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' }),
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const data = await response.json();
      setCurrentConversationId(data.conversation.id);
      setConversationTitle(data.conversation.title);
      setMessages([]);
      toast.success('New conversation started');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  // Load conversation
  const handleSelectConversation = async (conversationId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/conversations/${conversationId}`);

      if (!response.ok) {
        throw new Error('Failed to load conversation');
      }

      const data = await response.json();
      setCurrentConversationId(conversationId);
      setConversationTitle(data.conversation.title);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // If no conversation exists, create one first
    if (!currentConversationId) {
      await handleNewConversation();
      // Wait a bit for conversation to be created
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!currentConversationId) {
      toast.error('Please create a conversation first');
      return;
    }

    const userMessageContent = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch(
        `/api/chat/conversations/${currentConversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: userMessageContent,
            includeContext: true 
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        // Handle tier restriction with upgrade prompt
        if (response.status === 403 && errorData.code === 'TIER_RESTRICTED') {
          setTierInfo({ currentTier: errorData.currentTier, requiredTier: errorData.requiredTier });
          setShowUpgrade(true);
          setLoading(false);
          return;
        }

        // Also check for tier restriction in error message (fallback)
        if (response.status === 403 || errorData.error?.includes('Tier 3+ Required')) {
          setTierInfo({ 
            currentTier: errorData.currentTier || 1, 
            requiredTier: errorData.requiredTier || 3 
          });
          setShowUpgrade(true);
          setLoading(false);
          return;
        }

        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();
      
      // Add both user and assistant messages
      setMessages(prev => [
        ...prev,
        data.userMessage,
        data.assistantMessage
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Handle insert context from context panel
  const handleInsertContext = (context: string) => {
    setInputMessage(context);
  };

  // Handle select prompt from library
  const handleSelectPrompt = (prompt: string) => {
    setInputMessage(prompt);
    toast.success('Prompt loaded!');
  };

  // Handle save current prompt
  const handleSaveCurrentPrompt = () => {
    if (!inputMessage.trim()) {
      toast.error('Please type a prompt first');
      return;
    }
    setShowSavePromptModal(true);
  };

  // Handle successful save
  const handlePromptSaved = () => {
    setPromptRefreshKey(prev => prev + 1); // Trigger refresh in prompt library
    toast.success('Prompt saved to library!');
  };

  // Auto-create conversation on mount if none exists
  useEffect(() => {
    if (!currentConversationId) {
      handleNewConversation();
    }
  }, []);

  return (
    <>
      <div className="h-[calc(100vh-120px)] flex gap-4">
        {/* Chat History Sidebar */}
        <div className="w-64 shrink-0 overflow-y-auto">
          <ChatHistory
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{conversationTitle}</h2>
                    <p className="text-xs text-muted-foreground">
                      AI Assistant • Context-aware
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveCurrentPrompt}
                    disabled={!inputMessage.trim()}
                  >
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    Save Prompt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNewConversation}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              </div>
            </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Ask me anything about content creation, strategy, or get help with your work!
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                  />
                ))
              )}
              
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t bg-background/50">
            <div className="flex gap-2 max-w-3xl mx-auto">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message... (Press Enter to send)"
                disabled={loading}
                className="flex-1 h-11"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                size="icon"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2 max-w-3xl mx-auto">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </Card>
      </div>

      {/* Prompt Library Panel */}
      <div className="w-96 shrink-0 overflow-y-auto max-h-[calc(100vh-120px)]">
        <PromptLibraryPanel
          key={promptRefreshKey}
          onSelectPrompt={handleSelectPrompt}
          onSavePrompt={handleSaveCurrentPrompt}
        />
      </div>

      {/* Context Panel */}
      <div className="w-64 shrink-0 overflow-y-auto max-h-[calc(100vh-120px)]">
        <ChatContextPanel onInsertContext={handleInsertContext} />
      </div>
    </div>

    {/* Save Prompt Modal */}
    <SavePromptModal
      isOpen={showSavePromptModal}
      onClose={() => setShowSavePromptModal(false)}
      initialPrompt={inputMessage}
      onSuccess={handlePromptSaved}
    />

    {/* Upgrade Prompt Modal */}
    {showUpgrade && tierInfo && (
      <UpgradePrompt
        featureName="AI Chat Assistant"
        currentTier={tierInfo.currentTier}
        requiredTier={tierInfo.requiredTier}
        variant="modal"
        onClose={() => setShowUpgrade(false)}
      />
    )}
    </>
  );
}

