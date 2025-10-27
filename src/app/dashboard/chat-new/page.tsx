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
  BookmarkPlus,
  History,
  Library,
  Lightbulb,
  Menu,
  X
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
  
  // Mobile sidebar states
  const [showHistory, setShowHistory] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [showContext, setShowContext] = useState(false);

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
      <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] flex gap-0 md:gap-6">
        {/* Chat History Sidebar - Desktop */}
        <div className="hidden lg:block w-72 shrink-0 overflow-y-auto">
          <ChatHistory
            currentConversationId={currentConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
          />
        </div>

        {/* Chat History Sidebar - Mobile Overlay */}
        {showHistory && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowHistory(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background shadow-xl overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Chat History</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <ChatHistory
                currentConversationId={currentConversationId}
                onSelectConversation={(id) => {
                  handleSelectConversation(id);
                  setShowHistory(false);
                }}
                onNewConversation={() => {
                  handleNewConversation();
                  setShowHistory(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <Card className="flex-1 flex flex-col shadow-lg border-2">
            {/* Header */}
            <div className="p-3 md:p-5 border-b bg-gradient-to-r from-background via-muted/20 to-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  {/* Mobile Menu Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setShowHistory(true)}
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                  
                  <div className="relative">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                      <Bot className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base md:text-lg truncate max-w-[150px] md:max-w-none">{conversationTitle}</h2>
                    <p className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      AI Assistant • Context-aware
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 md:gap-2">
                  {/* Mobile Action Buttons */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPromptLibrary(true)}
                    className="lg:hidden"
                  >
                    <Library className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowContext(true)}
                    className="lg:hidden"
                  >
                    <Lightbulb className="h-5 w-5" />
                  </Button>
                  
                  {/* Desktop Buttons */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveCurrentPrompt}
                    disabled={!inputMessage.trim()}
                    className="hidden md:flex shadow-sm hover:shadow-md transition-shadow"
                  >
                    <BookmarkPlus className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">Save Prompt</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleNewConversation}
                    className="shadow-sm hover:shadow-md transition-all hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Sparkles className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">New Chat</span>
                  </Button>
                </div>
              </div>
            </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3 md:p-6">
            <div className="space-y-4 md:space-y-6 max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <div className="text-center py-8 md:py-16 px-4">
                  <div className="relative inline-block mb-4 md:mb-6">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-gradient-to-br from-purple-100 via-purple-50 to-pink-100 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-pink-900/30 flex items-center justify-center mx-auto shadow-lg">
                      <Bot className="h-8 w-8 md:h-10 md:w-10 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <Sparkles className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Start a Conversation
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground mb-6 md:mb-8 max-w-md mx-auto px-4">
                    Ask me anything about content creation, strategy, or get help with your work!
                  </p>
                  
                  {/* Quick suggestions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 max-w-2xl mx-auto">
                    {[
                      { icon: "✨", text: "Help me brainstorm content ideas", color: "from-purple-500/10 to-pink-500/10 dark:from-purple-900/20 dark:to-pink-900/20" },
                      { icon: "🎯", text: "Analyze my content strategy", color: "from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20" },
                      { icon: "📝", text: "Write engaging social posts", color: "from-green-500/10 to-emerald-500/10 dark:from-green-900/20 dark:to-emerald-900/20" },
                      { icon: "🚀", text: "Improve my engagement rates", color: "from-orange-500/10 to-red-500/10 dark:from-orange-900/20 dark:to-red-900/20" },
                    ].map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInputMessage(suggestion.text)}
                        className={cn(
                          "p-3 md:p-4 rounded-xl border-2 border-border hover:border-purple-300 dark:hover:border-purple-700 transition-all hover:scale-105 hover:shadow-md text-left bg-gradient-to-br",
                          suggestion.color
                        )}
                      >
                        <span className="text-xl md:text-2xl mb-1 md:mb-2 block">{suggestion.icon}</span>
                        <p className="text-xs md:text-sm font-medium">{suggestion.text}</p>
                      </button>
                    ))}
                  </div>
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
                <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-left-2 duration-300">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-3 md:p-5 border-t bg-gradient-to-r from-background via-muted/10 to-background">
            <div className="flex gap-2 md:gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  disabled={loading}
                  className="flex-1 h-11 md:h-12 pr-16 md:pr-20 text-sm md:text-base shadow-sm focus:shadow-md transition-shadow border-2"
                />
                <div className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-1 text-xs text-muted-foreground">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded border">⏎</kbd>
                  <span>send</span>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                size="icon"
                className="h-11 w-11 md:h-12 md:w-12 shadow-md hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-purple-500 to-pink-500"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2 md:mt-3 max-w-4xl mx-auto flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              <span className="hidden sm:inline">AI can make mistakes. Verify important information.</span>
              <span className="sm:hidden">AI can make mistakes</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Prompt Library Panel - Desktop */}
      <div className="hidden lg:block w-96 shrink-0 overflow-y-auto max-h-[calc(100vh-120px)] space-y-4">
        <PromptLibraryPanel
          key={promptRefreshKey}
          onSelectPrompt={handleSelectPrompt}
          onSavePrompt={handleSaveCurrentPrompt}
        />
      </div>

      {/* Prompt Library Panel - Mobile Overlay */}
      {showPromptLibrary && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowPromptLibrary(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-96 max-w-[90vw] bg-background shadow-xl overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10">
              <h3 className="font-semibold">Prompt Library</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowPromptLibrary(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <PromptLibraryPanel
                key={promptRefreshKey}
                onSelectPrompt={(prompt) => {
                  handleSelectPrompt(prompt);
                  setShowPromptLibrary(false);
                }}
                onSavePrompt={handleSaveCurrentPrompt}
              />
            </div>
          </div>
        </div>
      )}

      {/* Context Panel - Desktop */}
      <div className="hidden lg:block w-72 shrink-0 overflow-y-auto max-h-[calc(100vh-120px)]">
        <ChatContextPanel onInsertContext={handleInsertContext} />
      </div>

      {/* Context Panel - Mobile Overlay */}
      {showContext && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowContext(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background shadow-xl overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10">
              <h3 className="font-semibold">Quick Actions</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowContext(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ChatContextPanel onInsertContext={(context) => {
              handleInsertContext(context);
              setShowContext(false);
            }} />
          </div>
        </div>
      )}
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

