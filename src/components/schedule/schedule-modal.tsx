"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar, 
  Clock, 
  CalendarIcon, 
  X, 
  Upload, 
  Hash, 
  Wand2, 
  Bookmark, 
  Download, 
  Check,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { PredictivePerformanceModal } from "@/components/ai/predictive-performance-modal";

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  handle: string;
  name: string;
  avatar?: string;
  isActive: boolean;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  platform?: string;
  title?: string;
  description?: string;
}

export function ScheduleModal({ 
  isOpen, 
  onClose, 
  content, 
  platform = "all",
  title = "Schedule Content",
  description = "Schedule this content for posting"
}: ScheduleModalProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [postContent, setPostContent] = useState(content);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isDragOverMedia, setIsDragOverMedia] = useState(false);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [hashtagKeyword, setHashtagKeyword] = useState("");
  const [hashtagSuggestions, setHashtagSuggestions] = useState<any[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | undefined>(undefined);
  const [postOptions, setPostOptions] = useState({
    tagPeople: false,
    addLocation: false,
    location: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isContentEnhanced, setIsContentEnhanced] = useState(false);
  
  // Prediction modal state
  const [performanceModalOpen, setPerformanceModalOpen] = useState(false);
  const [performanceContent, setPerformanceContent] = useState("");
  const [performancePlatform, setPerformancePlatform] = useState<string>("x");

  // Mock connected accounts data
  const connectedAccounts: ConnectedAccount[] = [
    {
      id: '1',
      platform: 'instagram',
      username: 'NewCraft Studio',
      handle: '@NewCraft_Studio',
      name: 'NewCraft Studio',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      isActive: true
    },
    {
      id: '2',
      platform: 'instagram',
      username: 'Mimu Studio',
      handle: '@mimu_Studio',
      name: 'Mimu Studio',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
      isActive: false
    },
    {
      id: '3',
      platform: 'x',
      username: 'RepurposeAI',
      handle: '@RepurposeAI',
      name: 'RepurposeAI',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
      isActive: false
    },
    {
      id: '4',
      platform: 'linkedin',
      username: 'John Doe',
      handle: 'John Doe',
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
      isActive: false
    }
  ];

  // Update content when prop changes
  useEffect(() => {
    setPostContent(content);
  }, [content]);

  // Set default scheduled time to 1 hour from now
  useEffect(() => {
    if (isOpen && !scheduledDateTime) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      setScheduledDateTime(now);
    }
  }, [isOpen, scheduledDateTime]);

  // Filter accounts by platform if specified
  const filteredAccounts = platform === "all" 
    ? connectedAccounts 
    : connectedAccounts.filter(acc => acc.platform === platform);

  const handleMediaDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverMedia(false);
    const files = Array.from(e.dataTransfer.files);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const handleMediaDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverMedia(true);
  };

  const handleMediaDragLeave = () => {
    setIsDragOverMedia(false);
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMediaFiles(prev => [...prev, ...files]);
    }
  };

  const generateHashtagSuggestions = async (keyword: string) => {
    if (!keyword.trim()) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/hashtags/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          keyword: keyword.trim(),
          platform: selectedAccount ? connectedAccounts.find(acc => acc.id === selectedAccount)?.platform : platform,
          count: 15
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const hashtags = data.hashtags.map((hashtag: any) => ({
          hashtag: hashtag.text.replace('#', ''),
          posts: hashtag.posts || Math.floor(Math.random() * 100000),
          relevance: hashtag.relevance || Math.floor(Math.random() * 40) + 60,
          isSelected: false
        }));
        setHashtagSuggestions(hashtags);
        toast.success(`Generated ${hashtags.length} hashtag suggestions`);
      } else {
        throw new Error('Failed to generate hashtags');
      }
    } catch (error) {
      console.error('Error generating hashtags:', error);
      toast.error('Failed to generate hashtags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHashtagSelect = (hashtag: string) => {
    setHashtagSuggestions(prev => 
      prev.map(h => 
        h.hashtag === hashtag 
          ? { ...h, isSelected: !h.isSelected }
          : h
      )
    );
    
    if (selectedHashtags.includes(hashtag)) {
      setSelectedHashtags(prev => prev.filter(h => h !== hashtag));
    } else {
      setSelectedHashtags(prev => [...prev, hashtag]);
    }
  };

  const handleSelectAllHashtags = () => {
    setHashtagSuggestions(prev => 
      prev.map(h => ({ ...h, isSelected: true }))
    );
    setSelectedHashtags(hashtagSuggestions.map(h => h.hashtag));
  };

  const handleUseHashtags = () => {
    if (selectedHashtags.length === 0) {
      toast.error('Please select hashtags to use');
      return;
    }

    const hashtagString = selectedHashtags.map(tag => `#${tag}`).join(' ');
    const currentContent = postContent.trim();
    
    // Add hashtags to the end of the content
    const newContent = currentContent ? `${currentContent}\n\n${hashtagString}` : hashtagString;
    setPostContent(newContent);
    
    // Clear selected hashtags and close the hashtag panel
    setSelectedHashtags([]);
    setShowHashtagSuggestions(false);
    setHashtagSuggestions([]);
    
    toast.success(`Added ${selectedHashtags.length} hashtags to content`);
  };

  const handleClearHashtags = () => {
    setSelectedHashtags([]);
    setHashtagSuggestions(prev => 
      prev.map(h => ({ ...h, isSelected: false }))
    );
  };

  const handleAIEnhance = async () => {
    if (!postContent.trim()) {
      toast.error('Please enter some content to enhance');
      return;
    }

    if (!selectedAccount) {
      toast.error('Please select an account first');
      return;
    }

    try {
      setIsEnhancing(true);
      
      const account = connectedAccounts.find(acc => acc.id === selectedAccount);
      if (!account) return;

      const response = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: postContent,
          platform: account.platform,
          tone: 'professional',
          includeHashtags: true,
          maxLength: 500
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.caption) {
          setPostContent(data.caption);
          setIsContentEnhanced(true);
          toast.success('Content enhanced successfully!');
          
          // Automatically show prediction for enhanced content
          setTimeout(() => {
            setPerformanceContent(data.caption);
            setPerformancePlatform(account.platform);
            setPerformanceModalOpen(true);
          }, 1000); // Small delay to let user see the success message
        } else {
          throw new Error('No enhanced content received');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enhance content');
      }
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to enhance content');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handlePerformancePrediction = () => {
    if (!postContent.trim()) {
      toast.error('Please enter some content to analyze');
      return;
    }

    if (!selectedAccount) {
      toast.error('Please select an account first');
      return;
    }

    const account = connectedAccounts.find(acc => acc.id === selectedAccount);
    if (!account) return;

    setPerformanceContent(postContent);
    setPerformancePlatform(account.platform);
    setPerformanceModalOpen(true);
  };

  const handleSchedule = async () => {
    if (!selectedAccount || !postContent.trim()) {
      toast.error('Please select an account and enter content');
      return;
    }

    try {
      setIsLoading(true);
      
      const account = connectedAccounts.find(acc => acc.id === selectedAccount);
      if (!account) return;

      const response = await fetch('/api/schedule/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: selectedAccount,
          platform: account.platform,
          content: postContent,
          scheduledTime: scheduledDateTime || new Date(),
          media: mediaFiles.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
          })),
          hashtags: selectedHashtags,
          options: postOptions
        }),
      });

      console.log('Schedule API response status:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Content scheduled successfully!');
        if (data.creditsRemaining !== undefined) {
          toast.info(`${data.creditsUsed} credits used. ${data.creditsRemaining} credits remaining.`);
        }
        onClose();
        
        // Reset form
        setSelectedAccount("");
        setPostContent("");
        setMediaFiles([]);
        setSelectedHashtags([]);
        setScheduledDateTime(undefined);
      } else {
        // Get the error details from the response
        let errorData: any = {};
        try {
          const text = await response.text();
          console.log('Raw error response:', text);
          if (text) {
            errorData = JSON.parse(text);
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorData = { error: 'Failed to schedule content', status: response.status };
        }
        
        console.error('Schedule API error:', errorData);
        console.error('Response status:', response.status, response.statusText);
        
        // Show specific error message
        if (errorData.code === 'TIER_RESTRICTED') {
          toast.error(errorData.message || 'Tier 2+ Required', {
            description: `You're on Tier ${errorData.currentTier}. Upgrade to Tier ${errorData.requiredTier}+ to use this feature.`,
            duration: 5000,
          });
        } else if (errorData.code === 'INSUFFICIENT_CREDITS') {
          toast.error('Insufficient Credits', {
            description: `You need ${errorData.required} credits but only have ${errorData.available} credits remaining.`,
            duration: 5000,
          });
        } else if (errorData.code === 'LIMIT_EXCEEDED') {
          toast.error('Scheduling Limit Reached', {
            description: errorData.message,
            duration: 5000,
          });
        } else {
          toast.error(errorData.error || errorData.message || `Failed to schedule content (Status: ${response.status})`);
        }
        return; // Don't throw, just return
      }
    } catch (error) {
      console.error('Error scheduling content:', error);
      toast.error('Failed to schedule content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-purple-600" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Connected Accounts */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Select Account</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAccount === account.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAccount(account.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {account.platform.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {account.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {account.handle}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedAccount === account.id && (
                          <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Content</h3>
                {isContentEnhanced && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    ✨ AI Enhanced
                  </Badge>
                )}
              </div>
              <Textarea
                placeholder="Your content here..."
                value={postContent}
                onChange={(e) => {
                  setPostContent(e.target.value);
                  // Reset enhanced flag if user manually edits content
                  if (isContentEnhanced) {
                    setIsContentEnhanced(false);
                  }
                }}
                className="min-h-[120px] resize-none"
              />
              
              {/* Selected Hashtags Preview */}
              {selectedHashtags.length > 0 && (
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-purple-700">
                      Selected Hashtags ({selectedHashtags.length})
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleClearHashtags}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedHashtags.map((hashtag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                      >
                        #{hashtag}
                        <button
                          onClick={() => handleHashtagSelect(hashtag)}
                          className="ml-1 hover:text-purple-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={handleUseHashtags}
                    className="mt-2 bg-purple-600 hover:bg-purple-700 text-xs"
                  >
                    Add to Content
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => setShowHashtagSuggestions(!showHashtagSuggestions)}
                >
                  <Hash className="w-4 h-4" />
                  Hashtag Suggestions
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleAIEnhance}
                  disabled={isEnhancing || !postContent.trim() || !selectedAccount}
                >
                  <Wand2 className="w-4 h-4" />
                  {isEnhancing ? 'Enhancing...' : 'AI Enhance'}
                </Button>
                <Button size="sm" variant="outline" className="gap-2">
                  <Bookmark className="w-4 h-4" />
                  Save Template
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={handlePerformancePrediction}
                  disabled={!postContent.trim() || !selectedAccount}
                >
                  <BarChart3 className="w-4 h-4" />
                  Predict Performance
                </Button>
              </div>
            </div>

            {/* Schedule Time */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Schedule Time</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Date</Label>
                  <Input
                    type="date"
                    value={scheduledDateTime ? scheduledDateTime.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const date = e.target.value;
                      const time = scheduledDateTime ? scheduledDateTime.toTimeString().slice(0, 5) : '12:00';
                      setScheduledDateTime(new Date(`${date}T${time}`));
                    }}
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Time</Label>
                  <Input
                    type="time"
                    value={scheduledDateTime ? scheduledDateTime.toTimeString().slice(0, 5) : ''}
                    onChange={(e) => {
                      const time = e.target.value;
                      const date = scheduledDateTime ? scheduledDateTime.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                      setScheduledDateTime(new Date(`${date}T${time}`));
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Hashtag Suggestions */}
          {showHashtagSuggestions && (
            <div className="lg:col-span-1 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Hashtag Suggestions</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowHashtagSuggestions(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search hashtags..."
                    value={hashtagKeyword}
                    onChange={(e) => setHashtagKeyword(e.target.value)}
                  />
                  <Button
                    size="sm"
                    onClick={() => generateHashtagSuggestions(hashtagKeyword)}
                    disabled={isLoading}
                  >
                    {isLoading ? '...' : 'Suggest'}
                  </Button>
                </div>
                
                {selectedHashtags.length > 0 && (
                  <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="text-sm text-purple-700">
                      {selectedHashtags.length} hashtag{selectedHashtags.length !== 1 ? 's' : ''} selected
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSelectAllHashtags}
                        className="text-xs"
                      >
                        Select All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleClearHashtags}
                        className="text-xs text-gray-600 hover:text-gray-700"
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleUseHashtags}
                        className="bg-purple-600 hover:bg-purple-700 text-xs"
                      >
                        Use Hashtags
                      </Button>
                    </div>
                  </div>
                )}
                
                {hashtagSuggestions.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {hashtagSuggestions.length} suggestions
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleSelectAllHashtags}
                      className="text-xs text-purple-600 hover:text-purple-700"
                    >
                      Select All
                    </Button>
                  </div>
                )}
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {hashtagSuggestions.map((hashtag, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        hashtag.isSelected 
                          ? 'bg-purple-50 border border-purple-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleHashtagSelect(hashtag.hashtag)}
                    >
                      <input
                        type="checkbox"
                        checked={hashtag.isSelected}
                        onChange={() => handleHashtagSelect(hashtag.hashtag)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          hashtag.isSelected ? 'text-purple-900' : 'text-gray-900'
                        }`}>
                          #{hashtag.hashtag}
                        </p>
                        <p className="text-xs text-gray-500">
                          {hashtag.posts.toLocaleString()} posts • {hashtag.relevance}% relevant
                        </p>
                      </div>
                      {hashtag.isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancel
          </Button>
          
          <Button 
            onClick={handleSchedule}
            className="repurpose-gradient"
            disabled={!selectedAccount || !postContent.trim() || isLoading}
          >
            {isLoading ? 'Scheduling...' : 'Schedule Post'}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Predictive Performance Modal */}
      <PredictivePerformanceModal
        isOpen={performanceModalOpen}
        onClose={() => setPerformanceModalOpen(false)}
        content={performanceContent}
        platform={performancePlatform}
        tone="professional"
        contentType="post"
      />
    </Dialog>
  );
}
