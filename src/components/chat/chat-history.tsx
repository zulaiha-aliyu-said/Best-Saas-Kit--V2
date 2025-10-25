'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Trash2, 
  Archive,
  MoreVertical,
  Clock
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Conversation {
  id: number;
  title: string;
  last_message_at: Date;
  message_count: number;
  is_archived: boolean;
}

interface ChatHistoryProps {
  currentConversationId: number | null;
  onSelectConversation: (conversationId: number) => void;
  onNewConversation: () => void;
  className?: string;
}

export function ChatHistory({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  className
}: ChatHistoryProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [showArchived]);

  useEffect(() => {
    // Filter conversations based on search query
    if (searchQuery.trim()) {
      const filtered = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredConversations(filtered);
    } else {
      setFilteredConversations(conversations);
    }
  }, [searchQuery, conversations]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(
        `/api/chat/conversations?includeArchived=${showArchived}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: number) => {
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      toast.success('Conversation deleted');
      fetchConversations();

      // If deleted conversation was active, trigger new conversation
      if (conversationId === currentConversationId) {
        onNewConversation();
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const handleArchiveConversation = async (conversationId: number, archive: boolean) => {
    try {
      const response = await fetch(`/api/chat/conversations/${conversationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_archived: archive }),
      });

      if (!response.ok) {
        throw new Error('Failed to archive conversation');
      }

      toast.success(archive ? 'Conversation archived' : 'Conversation unarchived');
      fetchConversations();
    } catch (error) {
      console.error('Error archiving conversation:', error);
      toast.error('Failed to archive conversation');
    }
  };

  const formatLastMessage = (date: Date) => {
    try {
      const messageDate = new Date(date);
      const now = new Date();
      const diff = now.getTime() - messageDate.getTime();
      const days = diff / (1000 * 60 * 60 * 24);

      if (days < 1) {
        return formatDistanceToNow(messageDate, { addSuffix: true });
      } else if (days < 7) {
        return format(messageDate, 'EEEE');
      } else {
        return format(messageDate, 'MMM d');
      }
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-white border-r', className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </h2>
          <Button
            size="sm"
            onClick={onNewConversation}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Toggle Archived */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className="w-full justify-start text-xs"
        >
          <Archive className="h-3 w-3 mr-2" />
          {showArchived ? 'Hide Archived' : 'Show Archived'}
        </Button>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 rounded-lg bg-muted animate-pulse">
                  <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                {searchQuery
                  ? 'No conversations found'
                  : 'No conversations yet. Start a new chat!'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    'group relative p-3 rounded-lg cursor-pointer transition-all',
                    'hover:bg-muted/50',
                    currentConversationId === conversation.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'border border-transparent'
                  )}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate mb-1">
                        {conversation.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatLastMessage(conversation.last_message_at)}</span>
                        <span>•</span>
                        <span>{conversation.message_count} messages</span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveConversation(
                              conversation.id,
                              !conversation.is_archived
                            );
                          }}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          {conversation.is_archived ? 'Unarchive' : 'Archive'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation.id);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      {conversations.length > 0 && (
        <div className="p-3 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground text-center">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}


