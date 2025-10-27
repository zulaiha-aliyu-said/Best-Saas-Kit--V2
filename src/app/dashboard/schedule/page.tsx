"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { 
  CalendarIcon, 
  Clock, 
  Edit, 
  Trash2, 
  Eye,
  MoreVertical,
  Plus,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Target,
  BarChart3,
  Zap,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  X,
  Upload,
  Hash,
  Wand2,
  Bookmark,
  Check
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

interface TimingSlot {
  time: Date;
  timeString: string;
  score: number;
  platforms: string[];
  description: string;
}

interface TimingData {
  todaysOptimalTimes: TimingSlot[];
  weeklyPattern: any[];
  audienceInsights: any;
  lastUpdated: Date;
}

interface ConnectedAccount {
  id: string;
  platform: string;
  username: string;
  handle: string;
  name: string;
  avatar?: string;
  isActive: boolean;
}

interface HashtagSuggestion {
  hashtag: string;
  posts: number;
  relevance: number;
  isSelected: boolean;
}

interface ScheduledPost {
  id: string;
  platform: string;
  content: string;
  scheduledDate?: Date;
  scheduledTime?: string;
  status: 'scheduled' | 'published' | 'failed' | 'paused';
}

export default function SchedulePage(){
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isQuickScheduleOpen, setIsQuickScheduleOpen] = useState(false);
  const [quickScheduleContent, setQuickScheduleContent] = useState("");
  const [quickSchedulePlatform, setQuickSchedulePlatform] = useState("x");
  const [quickScheduleDateTime, setQuickScheduleDateTime] = useState<Date | undefined>(undefined);
  const [isDragOver, setIsDragOver] = useState(false);
  const [timingData, setTimingData] = useState<TimingData | null>(null);
  const [isLoadingTiming, setIsLoadingTiming] = useState(false);
  const [selectedPlatformForTiming, setSelectedPlatformForTiming] = useState<string>("all");
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  
  // Advanced Scheduler States
  const [isAdvancedSchedulerOpen, setIsAdvancedSchedulerOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [postPlatform, setPostPlatform] = useState<string>("twitter");
  const [postContent, setPostContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isDragOverMedia, setIsDragOverMedia] = useState(false);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [hashtagKeyword, setHashtagKeyword] = useState("");
  const [hashtagSuggestions, setHashtagSuggestions] = useState<HashtagSuggestion[]>([]);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [scheduledDateTime, setScheduledDateTime] = useState<Date | undefined>(undefined);
  const [postOptions, setPostOptions] = useState({
    tagPeople: false,
    addLocation: false,
    location: ""
  });

  // Caption management states
  const [savedCaptions, setSavedCaptions] = useState<any[]>([]);
  const [showSavedCaptions, setShowSavedCaptions] = useState(false);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [captionTemplates, setCaptionTemplates] = useState<any[]>([]);

  // Connected accounts state
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [businessPlanRequired, setBusinessPlanRequired] = useState(false);


  useEffect(() => {
    setDate(new Date());
    loadSavedCaptions();
    loadCaptionTemplates();
    fetchScheduledPosts();
    fetchConnectedAccounts();
  }, []);

  // Fetch connected accounts from Ayrshare
  const fetchConnectedAccounts = async () => {
    try {
      setIsLoadingAccounts(true);
      const response = await fetch('/api/ayrshare/accounts');
      if (response.ok) {
        const data = await response.json();
        setConnectedAccounts(data.accounts || []);
        setBusinessPlanRequired(data.businessPlanRequired || false);
        
        if (data.businessPlanRequired) {
          toast.info('Business Plan required for account management. You can still schedule posts manually.');
        }
      } else {
        console.error('Failed to fetch connected accounts');
        // Fallback to mock data
        setConnectedAccounts([
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
            platform: 'x',
            username: 'RepurposeAI',
            handle: '@RepurposeAI',
            name: 'RepurposeAI',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
            isActive: true
          },
          {
            id: '3',
            platform: 'linkedin',
            username: 'John Doe',
            handle: 'John Doe',
            name: 'John Doe',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
            isActive: false
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching connected accounts:', error);
      // Fallback to mock data
      setConnectedAccounts([
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
          platform: 'x',
          username: 'RepurposeAI',
          handle: '@RepurposeAI',
          name: 'RepurposeAI',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
          isActive: true
        }
      ]);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  const platformIcons: Record<string, { icon: string; color: string; bg: string; gradient: string }> = {
    x: { icon: "𝕏", color: "text-white", bg: "bg-gradient-to-br from-blue-500 to-blue-600", gradient: "from-blue-500 to-blue-600" },
    twitter: { icon: "𝕏", color: "text-white", bg: "bg-gradient-to-br from-blue-500 to-blue-600", gradient: "from-blue-500 to-blue-600" },
    linkedin: { icon: "💼", color: "text-white", bg: "bg-gradient-to-br from-blue-600 to-blue-700", gradient: "from-blue-600 to-blue-700" },
    instagram: { icon: "📸", color: "text-white", bg: "bg-gradient-to-br from-pink-500 to-purple-500", gradient: "from-pink-500 to-purple-500" },
    facebook: { icon: "👥", color: "text-white", bg: "bg-gradient-to-br from-blue-600 to-blue-800", gradient: "from-blue-600 to-blue-800" },
    pinterest: { icon: "📌", color: "text-white", bg: "bg-gradient-to-br from-red-500 to-red-700", gradient: "from-red-500 to-red-700" },
    youtube: { icon: "▶️", color: "text-white", bg: "bg-gradient-to-br from-red-600 to-red-800", gradient: "from-red-600 to-red-800" },
    tiktok: { icon: "🎵", color: "text-white", bg: "bg-gradient-to-br from-black to-gray-800", gradient: "from-black to-gray-800" },
    reddit: { icon: "🤖", color: "text-white", bg: "bg-gradient-to-br from-orange-500 to-orange-700", gradient: "from-orange-500 to-orange-700" },
    email: { icon: "✉️", color: "text-white", bg: "bg-gradient-to-br from-green-500 to-green-600", gradient: "from-green-500 to-green-600" },
  };

  // Helper function to get platform info with fallback
  const getPlatformInfo = (platform: string) => {
    return platformIcons[platform] || { 
      icon: "📱", 
      color: "text-white", 
      bg: "bg-gradient-to-br from-gray-500 to-gray-600", 
      gradient: "from-gray-500 to-gray-600" 
    };
  };

  const statusConfig = {
    scheduled: { 
      icon: Clock, 
      color: "text-blue-600", 
      bg: "bg-blue-50 dark:bg-blue-900/30", 
      border: "border-blue-200",
      label: "Scheduled"
    },
    published: { 
      icon: CheckCircle, 
      color: "text-green-600", 
      bg: "bg-green-50 dark:bg-green-900/30", 
      border: "border-green-200",
      label: "Published"
    },
    failed: { 
      icon: XCircle, 
      color: "text-red-600", 
      bg: "bg-red-50 dark:bg-red-900/30", 
      border: "border-red-200",
      label: "Failed"
    },
    paused: { 
      icon: Pause, 
      color: "text-yellow-600", 
      bg: "bg-yellow-50 dark:bg-yellow-900/30", 
      border: "border-yellow-200",
      label: "Paused"
    }
  };

  const formatScheduledDate = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `in ${diffMins}m`;
    if (diffHours < 24) return `in ${diffHours}h`;
    if (diffDays < 7) return `in ${diffDays}d`;
    return date.toLocaleDateString();
  };



  // Quick Schedule Handlers
  const handleQuickSchedule = () => {
    if (!quickScheduleContent.trim()) {
      toast.error('Please enter content to schedule');
      return;
    }
    if (!quickScheduleDateTime) {
      toast.error('Please select a date and time');
      return;
    }

    const newPost: ScheduledPost = {
      id: Date.now().toString(),
      platform: quickSchedulePlatform,
      content: quickScheduleContent,
      scheduledDate: quickScheduleDateTime,
      status: 'scheduled'
    };

    // Save to localStorage
    const existingPosts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
    existingPosts.unshift(newPost);
    localStorage.setItem('scheduledPosts', JSON.stringify(existingPosts));

    setScheduledPosts(prev => [newPost, ...prev]);
    setQuickScheduleContent("");
    setQuickScheduleDateTime(undefined);
    setIsQuickScheduleOpen(false);
    toast.success('Post scheduled successfully!');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const text = e.dataTransfer.getData('text/plain');
    if (text) {
      setQuickScheduleContent(text);
      setIsQuickScheduleOpen(true);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain');
    if (text) {
      setQuickScheduleContent(text);
      setIsQuickScheduleOpen(true);
    }
  };

  // Advanced Scheduler Handlers
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
      setIsLoadingTiming(true);
      
      // Call the Ayrshare hashtag generation API
      const response = await fetch(`/api/ayrshare/hashtags?keyword=${encodeURIComponent(keyword.trim())}&platform=${selectedAccount ? connectedAccounts.find(acc => acc.id === selectedAccount)?.platform : 'all'}`);

      if (response.ok) {
        const data = await response.json();
        const hashtags = data.hashtags.map((hashtag: string) => ({
          hashtag: hashtag.replace('#', ''),
          posts: Math.floor(Math.random() * 100000),
          relevance: Math.floor(Math.random() * 40) + 60,
          isSelected: false
        }));
        setHashtagSuggestions(hashtags);
        toast.success(`Generated ${hashtags.length} hashtag suggestions`);
      } else {
        throw new Error('Failed to generate hashtags');
      }
    } catch (error) {
      console.error('Error generating hashtags:', error);
      
      // Fallback to mock data
      const mockSuggestions: HashtagSuggestion[] = [
        { hashtag: keyword.toLowerCase(), posts: Math.floor(Math.random() * 1000000), relevance: 95, isSelected: false },
        { hashtag: `${keyword.toLowerCase()}tips`, posts: Math.floor(Math.random() * 500000), relevance: 88, isSelected: false },
        { hashtag: `${keyword.toLowerCase()}2024`, posts: Math.floor(Math.random() * 300000), relevance: 82, isSelected: false },
        { hashtag: `${keyword.toLowerCase()}business`, posts: Math.floor(Math.random() * 200000), relevance: 75, isSelected: false },
        { hashtag: `${keyword.toLowerCase()}marketing`, posts: Math.floor(Math.random() * 150000), relevance: 70, isSelected: false },
        { hashtag: `${keyword.toLowerCase()}success`, posts: Math.floor(Math.random() * 100000), relevance: 65, isSelected: false },
        { hashtag: `${keyword.toLowerCase()}growth`, posts: Math.floor(Math.random() * 80000), relevance: 60, isSelected: false },
        { hashtag: `${keyword.toLowerCase()}strategy`, posts: Math.floor(Math.random() * 60000), relevance: 55, isSelected: false },
      ];
      
      setHashtagSuggestions(mockSuggestions);
      toast.error('Using offline hashtag suggestions');
    } finally {
      setIsLoadingTiming(false);
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
    setSelectedHashtags(prev => 
      prev.includes(hashtag) 
        ? prev.filter(h => h !== hashtag)
        : [...prev, hashtag]
    );
  };

  const handleSelectAllHashtags = () => {
    const allHashtags = hashtagSuggestions.map(h => h.hashtag);
    setSelectedHashtags(allHashtags);
    setHashtagSuggestions(prev => 
      prev.map(h => ({ ...h, isSelected: true }))
    );
  };

  const handleAdvancedSchedule = async () => {
    if (!postContent.trim()) {
      toast.error('Please enter content to schedule');
      return;
    }

    // Create local post for fallback
    const createLocalPost = () => {
      const hashtagText = selectedHashtags.length > 0 ? `\n\n${selectedHashtags.map(tag => `#${tag}`).join(' ')}` : '';
      const fullContent = postContent + hashtagText;

      const newPost: ScheduledPost = {
        id: Date.now().toString(),
        platform: postPlatform,
        content: fullContent,
        scheduledDate: scheduledDateTime || new Date(),
        status: 'scheduled'
      };

      // Save to localStorage
      const existingPosts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
      existingPosts.unshift(newPost);
      localStorage.setItem('scheduledPosts', JSON.stringify(existingPosts));

      setScheduledPosts(prev => [newPost, ...prev]);
      
      // Reset form
      setPostContent("");
      setMediaFiles([]);
      setSelectedHashtags([]);
      setScheduledDateTime(undefined);
      setIsAdvancedSchedulerOpen(false);
    };

    try {
      const response = await fetch('/api/ayrshare/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platforms: [postPlatform],
          content: postContent,
          scheduledAt: scheduledDateTime || new Date(),
          mediaUrls: mediaFiles.map(file => URL.createObjectURL(file)),
          hashtags: selectedHashtags,
          location: postOptions.addLocation ? {
            name: postOptions.location
          } : undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add to local state
        const newPost: ScheduledPost = {
          id: data.post.id,
          platform: postPlatform,
          content: data.post.text,
          scheduledDate: new Date(data.post.scheduleDate),
          status: data.post.status
        };

        // Save to localStorage
        const existingPosts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        existingPosts.unshift(newPost);
        localStorage.setItem('scheduledPosts', JSON.stringify(existingPosts));

        setScheduledPosts(prev => [newPost, ...prev]);
        
        // Reset form
        setPostContent("");
        setMediaFiles([]);
        setSelectedHashtags([]);
        setScheduledDateTime(undefined);
        setIsAdvancedSchedulerOpen(false);
        
        toast.success(data.message || 'Post scheduled successfully!');
      } else if (data.planRequired) {
        // Premium/Business Plan required - fall back to local scheduling
        console.log('Ayrshare plan upgrade required, using local scheduling');
        createLocalPost();
        toast.info('Post scheduled locally. Upgrade to Premium Plan for Ayrshare integration.', {
          duration: 5000,
          action: {
            label: 'Upgrade',
            onClick: () => window.open(data.upgradeUrl, '_blank')
          }
        });
      } else {
        throw new Error(data.error || 'Failed to schedule post');
      }
    } catch (error) {
      console.error('Error scheduling post:', error);
      
      // Fall back to local scheduling on any error
      createLocalPost();
      toast.warning('Post scheduled locally (offline mode)', {
        description: 'Your post has been saved locally and will appear in your scheduled posts list.'
      });
    }
  };

  // Caption management functions
  const saveCaption = async () => {
    if (!postContent.trim()) {
      toast.error('Please enter some content to save');
      return;
    }

    try {
      const response = await fetch('/api/captions/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: postContent,
          platform: selectedAccount ? connectedAccounts.find(acc => acc.id === selectedAccount)?.platform : 'all',
          hashtags: selectedHashtags,
          tags: postOptions.tagPeople ? ['people'] : [],
          location: postOptions.addLocation ? postOptions.location : null
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSavedCaptions(prev => [data.caption, ...prev]);
        toast.success('Caption saved successfully!');
      } else {
        throw new Error('Failed to save caption');
      }
    } catch (error) {
      console.error('Error saving caption:', error);
      
      // Fallback to local storage
      const newCaption = {
        id: Date.now().toString(),
        content: postContent,
        platform: selectedAccount ? connectedAccounts.find(acc => acc.id === selectedAccount)?.platform : 'all',
        hashtags: selectedHashtags,
        tags: postOptions.tagPeople ? ['people'] : [],
        location: postOptions.addLocation ? postOptions.location : null,
        createdAt: new Date().toISOString()
      };
      
      const saved = JSON.parse(localStorage.getItem('savedCaptions') || '[]');
      saved.unshift(newCaption);
      localStorage.setItem('savedCaptions', JSON.stringify(saved));
      setSavedCaptions(prev => [newCaption, ...prev]);
      toast.success('Caption saved locally!');
    }
  };

  const loadSavedCaptions = async () => {
    try {
      const response = await fetch('/api/captions');
      if (response.ok) {
        const data = await response.json();
        setSavedCaptions(data.captions || []);
      } else {
        throw new Error('Failed to load captions');
      }
    } catch (error) {
      console.error('Error loading captions:', error);
      
      // Fallback to local storage
      const saved = JSON.parse(localStorage.getItem('savedCaptions') || '[]');
      setSavedCaptions(saved);
    }
  };

  const generateAICaption = async () => {
    if (!postContent.trim()) {
      toast.error('Please enter some content to enhance');
      return;
    }

    try {
      setIsGeneratingCaption(true);
      
      const response = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: postContent,
          platform: selectedAccount ? connectedAccounts.find(acc => acc.id === selectedAccount)?.platform : 'all',
          tone: 'professional',
          includeHashtags: true,
          maxLength: 280
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPostContent(data.caption);
        toast.success('AI caption generated successfully!');
      } else {
        throw new Error('Failed to generate caption');
      }
    } catch (error) {
      console.error('Error generating caption:', error);
      toast.error('Failed to generate AI caption. Please try again.');
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const loadCaptionTemplates = async () => {
    try {
      const response = await fetch('/api/captions/templates');
      if (response.ok) {
        const data = await response.json();
        setCaptionTemplates(data.templates || []);
      } else {
        throw new Error('Failed to load templates');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      
      // Fallback to mock templates
      const mockTemplates = [
        { id: '1', name: 'Product Launch', content: '🚀 Excited to announce our new product! #launch #innovation #excited' },
        { id: '2', name: 'Behind the Scenes', content: 'Behind the scenes of our creative process! #bts #creative #process' },
        { id: '3', name: 'Thank You', content: 'Thank you to our amazing community for your support! #grateful #community #thankyou' },
        { id: '4', name: 'Motivational Monday', content: 'Monday motivation: Every expert was once a beginner! #motivation #monday #inspiration' },
        { id: '5', name: 'Tip Tuesday', content: 'Pro tip: [Your tip here] #tips #tuesday #advice' }
      ];
      setCaptionTemplates(mockTemplates);
    }
  };

  // AI Timing Analysis Functions
  const generateOptimalTimingData = (): TimingData => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Generate realistic engagement data based on platform and time
    const platformTimings = {
      x: {
        peakHours: [9, 12, 15, 18, 21],
        bestDays: [1, 2, 3, 4, 5], // Monday to Friday
        engagementMultiplier: 1.2
      },
      linkedin: {
        peakHours: [8, 12, 17],
        bestDays: [1, 2, 3, 4, 5], // Monday to Friday
        engagementMultiplier: 1.5
      },
      instagram: {
        peakHours: [11, 14, 19, 20],
        bestDays: [1, 2, 3, 4, 5, 6], // Monday to Saturday
        engagementMultiplier: 1.3
      },
      email: {
        peakHours: [9, 10, 14, 15],
        bestDays: [1, 2, 3, 4, 5], // Monday to Friday
        engagementMultiplier: 1.8
      }
    };

    // Generate today's optimal times - simplified and guaranteed to work
    const todaysOptimalTimes: TimingSlot[] = [];
    const currentHour = now.getHours();
    
    // Always generate at least 3 optimal times
    const optimalHours = [9, 12, 15, 18, 21].filter(hour => hour > currentHour).slice(0, 3);
    
    // If we don't have enough future hours, add some for tomorrow
    if (optimalHours.length < 3) {
      const tomorrowHours = [9, 12, 15, 18, 21].slice(0, 3 - optimalHours.length);
      optimalHours.push(...tomorrowHours);
    }
    
    optimalHours.forEach((hour, index) => {
      const time = new Date(today);
      time.setHours(hour, 0, 0, 0);
      
      // Calculate engagement score
      let score = 60 + Math.random() * 30; // Score between 60-90
      const platforms = ['x', 'linkedin', 'instagram'].slice(0, Math.floor(Math.random() * 3) + 1);
      
      todaysOptimalTimes.push({
        time: time,
        timeString: time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        score: Math.round(score),
        platforms: platforms,
        description: getTimeDescription(hour, platforms)
      });
    });

    // Generate weekly engagement pattern
    const weeklyPattern = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let day = 0; day < 7; day++) {
      const dayEngagement = {
        day: dayNames[day],
        engagement: Math.round(50 + Math.random() * 40 + (day >= 1 && day <= 5 ? 20 : 0)),
        color: getDayColor(day)
      };
      weeklyPattern.push(dayEngagement);
    }

    // Generate audience insights
    const audienceInsights = {
      activeHours: [9, 12, 15, 18, 21],
      timezone: 'EST',
      peakEngagementDay: 'Tuesday',
      averageEngagement: 78,
      bestPerformingContent: 'Educational posts',
      optimalPostingFrequency: '2-3 times per day'
    };

    return {
      todaysOptimalTimes: todaysOptimalTimes,
      weeklyPattern,
      audienceInsights,
      lastUpdated: new Date()
    };
  };

  const getTimeDescription = (hour: number, platforms: string[]) => {
    if (hour >= 6 && hour < 9) return 'Early morning engagement';
    if (hour >= 9 && hour < 12) return 'Peak morning activity';
    if (hour >= 12 && hour < 14) return 'Lunch break engagement';
    if (hour >= 14 && hour < 17) return 'Afternoon productivity';
    if (hour >= 17 && hour < 19) return 'End of workday';
    if (hour >= 19 && hour < 22) return 'Evening relaxation';
    return 'Late night activity';
  };

  const getDayColor = (day: number) => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-orange-500'
    ];
    return colors[day];
  };

  const refreshTimingData = async () => {
    setIsLoadingTiming(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newData = generateOptimalTimingData();
    setTimingData(newData);
    setIsLoadingTiming(false);
    toast.success('Timing suggestions updated!');
  };

  const fetchScheduledPosts = async () => {
    try {
      setIsLoadingPosts(true);
      
      // Try to fetch from Ayrshare first
      const ayrshareResponse = await fetch('/api/ayrshare/posts');
      let apiPosts: any[] = [];
      
      if (ayrshareResponse.ok) {
        const ayrshareData = await ayrshareResponse.json();
        apiPosts = (ayrshareData.posts || []).map((post: any) => ({
          id: post.id,
          platform: post.platforms[0] || 'unknown',
          content: post.text,
          scheduledTime: post.scheduleDate,
          status: post.status
        }));
      }
      
      // Get posts from localStorage as well
      const localPosts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
      
      // Combine and deduplicate posts (API posts take precedence)
      const allPosts = [...apiPosts];
      localPosts.forEach((localPost: any) => {
        if (!apiPosts.find((apiPost: any) => apiPost.id === localPost.id)) {
          allPosts.push(localPost);
        }
      });
      
      // Sort by scheduled time
      allPosts.sort((a, b) => {
        const timeA = a.scheduledTime || a.scheduledDate;
        const timeB = b.scheduledTime || b.scheduledDate;
        return new Date(timeA).getTime() - new Date(timeB).getTime();
      });
      
      setScheduledPosts(allPosts);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      // Fallback to localStorage
      const localPosts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
      setScheduledPosts(localPosts);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handlePostAction = async (postId: string, action: string) => {
    try {
      const response = await fetch(`/api/ayrshare/posts/${postId}?action=${action}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        
        // Update localStorage
        const existingPosts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        const updatedPosts = existingPosts.map((post: any) => 
          post.id === postId ? { ...post, status: action === 'delete' ? 'deleted' : action } : post
        ).filter((post: any) => post.status !== 'deleted');
        localStorage.setItem('scheduledPosts', JSON.stringify(updatedPosts));
        
        // Refresh scheduled posts
        fetchScheduledPosts();
      } else {
        throw new Error('Failed to perform action');
      }
    } catch (error) {
      console.error('Error performing post action:', error);
      toast.error('Failed to perform action. Please try again.');
    }
  };

  const handleEditPost = (postId: string) => {
    // Find the post and open edit modal
    const post = scheduledPosts.find(p => p.id === postId);
    if (post) {
      setPostContent(post.content);
      setScheduledDateTime(new Date(post.scheduledTime || post.scheduledDate));
      setSelectedAccount(post.accountId);
      setIsAdvancedSchedulerOpen(true);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this scheduled post?')) {
      try {
        const response = await fetch(`/api/ayrshare/posts/${postId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          // Update localStorage immediately
          const existingPosts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
          const updatedPosts = existingPosts.filter((post: any) => post.id !== postId);
          localStorage.setItem('scheduledPosts', JSON.stringify(updatedPosts));
          
          // Update local state
          setScheduledPosts(prev => prev.filter(post => post.id !== postId));
          
          toast.success('Post deleted successfully');
        } else {
          throw new Error('Failed to delete post');
        }
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post. Please try again.');
      }
    }
  };

  // Connect new social media account
  const connectAccount = async (platform: string) => {
    try {
      const response = await fetch('/api/ayrshare/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          redirectUrl: window.location.href
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to OAuth URL
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to initiate account connection');
      }
    } catch (error) {
      console.error('Error connecting account:', error);
      toast.error('Failed to connect account. Please try again.');
    }
  };

  // Load timing data on component mount
  useEffect(() => {
    const data = generateOptimalTimingData();
    console.log('Generated timing data:', data);
    setTimingData(data);
  }, []);

  // Debug: Log timing data to console
  useEffect(() => {
    if (timingData) {
      console.log('Timing data loaded:', timingData);
    }
  }, [timingData]);

  const filteredPosts = selectedPlatform === "all" 
    ? scheduledPosts 
    : scheduledPosts.filter(p => p.platform === selectedPlatform);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Content Scheduler
            </h1>
            <p className="text-muted-foreground mt-2">
              Plan, schedule, and optimize your content across all platforms
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              className="repurpose-gradient gap-2"
              onClick={() => setIsAdvancedSchedulerOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Schedule New Post
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Scheduled Today", value: "3", icon: CalendarIcon, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "This Week", value: "12", icon: BarChart3, color: "text-green-600", bg: "bg-green-50" },
            { label: "Published", value: "8", icon: CheckCircle, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Failed", value: "1", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Calendar and Scheduler Section */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Main Calendar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="border-0 bg-card shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                    <CardTitle className="text-lg font-semibold">December 2024</CardTitle>
                    <CardDescription>Click on any date to schedule posts</CardDescription>
              </div>
            </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-50">
                    <ChevronLeft className="h-4 w-4" />
              </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-purple-50">
                    <ChevronRight className="h-4 w-4" />
              </Button>
                </div>
            </div>
          </CardHeader>
            <CardContent className="pt-0 pb-6">
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-lg" />
          </CardContent>
        </Card>
        </motion.div>

        {/* Quick Scheduler and Stats */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Quick Content Scheduler */}
          <Card className="border-0 bg-card shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Quick Scheduler</CardTitle>
                  <CardDescription>Drag & drop or paste content to schedule instantly</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <div 
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer group ${
                  isDragOver 
                    ? 'border-purple-400 bg-gradient-to-br from-purple-100/70 to-pink-100/70 dark:from-purple-900/30 dark:to-pink-900/30 scale-105' 
                    : 'border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/30 dark:to-pink-950/30 hover:from-purple-100/50 hover:to-pink-100/50 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onPaste={handlePaste}
                onClick={() => setIsQuickScheduleOpen(true)}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center transition-transform duration-200 ${
                  isDragOver ? 'scale-125' : 'group-hover:scale-110'
                }`}>
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg text-foreground">
                    {isDragOver ? 'Drop to schedule!' : 'Drop your content here'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isDragOver ? 'Release to open scheduler' : 'Or paste text, click to add content, or drag & drop'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    size="sm" 
                    className="repurpose-gradient gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsQuickScheduleOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Content
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-2 hover:bg-purple-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle URL input
                      const url = prompt('Enter URL to extract content from:');
                      if (url) {
                        setQuickScheduleContent(`Content from: ${url}`);
                        setIsQuickScheduleOpen(true);
                      }
                    }}
                  >
                    <Target className="w-4 h-4" />
                    Add URL
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          <Card className="border-0 bg-card shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">Bulk Actions</CardTitle>
                  <CardDescription>Manage multiple posts at once</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 pb-6">
              {[
                { icon: '📋', title: 'Duplicate Posts', desc: 'Copy to multiple dates', color: 'bg-blue-50 text-blue-700 border-blue-200', iconBg: 'bg-blue-100' },
                { icon: '📅', title: 'Weekly Series', desc: 'Schedule recurring posts', color: 'bg-green-50 text-green-700 border-green-200', iconBg: 'bg-green-100' },
                { icon: '🤖', title: 'Auto-Schedule', desc: 'AI optimal timing', color: 'bg-purple-50 text-purple-700 border-purple-200', iconBg: 'bg-purple-100' },
              ].map((action, index) => (
                <motion.div 
                  key={action.title} 
                  className={`flex items-center justify-between p-3 rounded-xl border ${action.color} hover:shadow-sm transition-all duration-200 cursor-pointer group`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${action.iconBg} flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-200`}>
                      {action.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-current transition-colors duration-200" />
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* This Week Stats */}
          <Card className="border-0 bg-card shadow-sm hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold">This Week</CardTitle>
                  <CardDescription>Platform distribution</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 pb-6">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl">
                <span className="text-sm font-medium text-foreground">Total Posts</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">12</span>
              </div>
              <div className="space-y-3">
                {[
                  { platform: 'Twitter', count: 5, color: 'bg-blue-500', percentage: 42 },
                  { platform: 'LinkedIn', count: 4, color: 'bg-blue-700', percentage: 33 },
                  { platform: 'Instagram', count: 3, color: 'bg-pink-500', percentage: 25 },
                ].map((stat, index) => (
                  <motion.div 
                    key={stat.platform} 
                    className="space-y-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stat.color}`} />
                        <span className="text-sm font-medium text-foreground">{stat.platform}</span>
                  </div>
                      <span className="text-sm font-bold">{stat.count}</span>
                </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className={`h-2 rounded-full ${stat.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.percentage}%` }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Connected Social Accounts */}
      <Card className="border-0 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Connected Social Accounts</CardTitle>
                <CardDescription className="text-xs">Manage your social media connections</CardDescription>
              </div>
            </div>
            <Button 
              size="sm" 
              className="repurpose-gradient text-xs h-7"
              onClick={() => {
                const platform = prompt('Enter platform to connect (twitter, instagram, linkedin, facebook):');
                if (platform && ['twitter', 'instagram', 'linkedin', 'facebook'].includes(platform.toLowerCase())) {
                  connectAccount(platform.toLowerCase());
                }
              }}
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Connect New Account
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          {isLoadingAccounts ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading connected accounts...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {businessPlanRequired ? (
                <div className="col-span-full text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-yellow-100 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Business Plan Required</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Account management requires Ayrshare Business Plan. You can still schedule posts by specifying platforms manually.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      variant="outline"
                      onClick={() => window.open('https://www.ayrshare.com/business-plan-for-multiple-users/', '_blank')}
                    >
                      View Business Plan
                    </Button>
                    <Button 
                      className="repurpose-gradient gap-2"
                      onClick={() => setIsAdvancedSchedulerOpen(true)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Schedule Post Manually
                    </Button>
                  </div>
                </div>
              ) : connectedAccounts.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Connected Accounts</h3>
                  <p className="text-sm text-muted-foreground mb-4">Connect your social media accounts to start scheduling posts</p>
                  <Button 
                    className="repurpose-gradient gap-2"
                    onClick={() => {
                      const platform = prompt('Enter platform to connect (twitter, instagram, linkedin, facebook):');
                      if (platform && ['twitter', 'instagram', 'linkedin', 'facebook'].includes(platform.toLowerCase())) {
                        connectAccount(platform.toLowerCase());
                      }
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Connect Your First Account
                  </Button>
                </div>
              ) : (
                connectedAccounts.map((account) => {
                  const platformInfo = getPlatformInfo(account.platform);
                  return (
                    <div
                      key={account.id}
                      className={`rounded-lg p-3 ${
                        account.isActive
                          ? `bg-gradient-to-br ${platformInfo.gradient} text-white`
                          : 'bg-secondary/20 border-2 border-dashed border-border'
                      } transition-all hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{platformInfo.icon}</span>
                          <span className="font-semibold text-sm capitalize">{account.platform}</span>
                        </div>
                        {account.isActive && (
                          <Badge className="bg-white/20 text-white border-0 text-xs">✓ Connected</Badge>
                        )}
                      </div>
                      <p className={`text-xs ${
                        account.isActive ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                        {account.handle}
                      </p>
                      {!account.isActive && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2 text-xs h-6 w-full"
                          onClick={() => connectAccount(account.platform)}
                        >
                          + Connect
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Optimal Timing Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="border-0 bg-card shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                  <CardTitle className="text-xl font-semibold">AI Optimal Timing Suggestions</CardTitle>
                  <CardDescription>Intelligent recommendations based on your audience engagement patterns</CardDescription>
              </div>
            </div>
              <div className="flex items-center gap-3">
                <Select value={selectedPlatformForTiming} onValueChange={setSelectedPlatformForTiming}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="x">Twitter/X</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={refreshTimingData}
                  disabled={isLoadingTiming}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingTiming ? 'animate-spin' : ''}`} />
                  {isLoadingTiming ? 'Analyzing...' : 'Refresh'}
            </Button>
              </div>
          </div>
        </CardHeader>
          <CardContent className="pt-0 pb-6">
            {isLoadingTiming ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 mx-auto mb-4 flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-yellow-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Analyzing Engagement Data</h3>
                  <p className="text-muted-foreground">Please wait while we calculate optimal timing...</p>
                </div>
              </div>
            ) : timingData && timingData.todaysOptimalTimes ? (
              <div className="grid gap-6 lg:grid-cols-2">
            {/* Today's Optimal Times */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <h3 className="text-lg font-semibold">Today's Optimal Times</h3>
                    <Badge variant="outline" className="text-xs">
                      {timingData.lastUpdated.toLocaleTimeString()}
                    </Badge>
              </div>
                  <div className="space-y-3">
                    {timingData.todaysOptimalTimes.map((slot: any, idx: number) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                          slot.score > 85 ? 'bg-green-50 border-green-200' :
                          slot.score > 75 ? 'bg-blue-50 border-blue-200' :
                          'bg-purple-50 border-purple-200'
                        }`}
                        onClick={() => {
                          setQuickScheduleDateTime(slot.time);
                          setIsQuickScheduleOpen(true);
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-bold">{slot.timeString}</span>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${
                              slot.score > 85 ? 'bg-green-100 text-green-700' :
                              slot.score > 75 ? 'bg-blue-100 text-blue-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {slot.score}% optimal
                            </Badge>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  </div>
                        <p className="text-sm text-muted-foreground mb-3">{slot.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">Best for:</span>
                          {slot.platforms.map((platform: string, i: number) => {
                            const platformInfo = getPlatformInfo(platform);
                            return (
                              <div key={i} className={`w-6 h-6 rounded-lg ${platformInfo.bg} flex items-center justify-center text-xs font-bold ${platformInfo.color}`}>
                                {platformInfo.icon}
                </div>
                            );
                          })}
                        </div>
                      </motion.div>
              ))}
                  </div>
            </div>

                {/* Weekly Engagement Pattern & Insights */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold">Weekly Engagement Pattern</h3>
              </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-br from-muted/30 to-muted/50 border border-border">
                    <div className="space-y-3">
                      {timingData.weeklyPattern.map((day: any, index: number) => (
                        <motion.div 
                          key={day.day} 
                          className="space-y-2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground w-20">{day.day}</span>
                            <span className="text-sm font-bold text-foreground">{day.engagement}%</span>
                        </div>
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${day.color} flex items-center justify-end pr-2`}
                              initial={{ width: 0 }}
                              animate={{ width: `${day.engagement}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                            >
                              <span className="text-xs font-semibold text-white">
                                {day.engagement}%
                              </span>
                            </motion.div>
                      </div>
                        </motion.div>
                  ))}
                </div>
              </div>

                  {/* Audience Insights */}
                  <div className="space-y-3">
                    <h4 className="text-md font-semibold text-foreground">Audience Insights</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="text-xs text-blue-600 font-medium mb-1">Peak Day</div>
                        <div className="text-sm font-bold text-blue-900">{timingData.audienceInsights.peakEngagementDay}</div>
            </div>
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <div className="text-xs text-green-600 font-medium mb-1">Avg Engagement</div>
                        <div className="text-sm font-bold text-green-900">{timingData.audienceInsights.averageEngagement}%</div>
          </div>
                      <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                        <div className="text-xs text-purple-600 font-medium mb-1">Best Content</div>
                        <div className="text-sm font-bold text-purple-900">{timingData.audienceInsights.bestPerformingContent}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                        <div className="text-xs text-orange-600 font-medium mb-1">Frequency</div>
                        <div className="text-sm font-bold text-orange-900">{timingData.audienceInsights.optimalPostingFrequency}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 mx-auto mb-4 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Timing Data Available</h3>
                  <p className="text-muted-foreground mb-4">Unable to load optimal timing suggestions. Please try refreshing.</p>
                  <Button onClick={refreshTimingData} className="repurpose-gradient gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Retry Analysis
                  </Button>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
      </motion.div>

      {/* Recent Scheduling Activity */}
      <Card className="border-0 bg-card shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">Recent Scheduling Activity</CardTitle>
                <CardDescription className="text-xs">Latest changes to your posting schedule</CardDescription>
              </div>
            </div>
            <Button variant="link" className="text-primary text-xs p-0 h-auto">View All</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0 pb-3">
          {[
            { icon: '✅', title: 'Post successfully scheduled', desc: '"AI Content Revolution" scheduled for Twitter - Dec 15, 9:00 AM', time: '2 min ago', color: 'bg-green-50 border-green-200' },
            { icon: '✏️', title: 'Post updated', desc: 'LinkedIn post time changed to 1:30 PM for better engagement', time: '15 min ago', color: 'bg-blue-50 border-blue-200' },
            { icon: '🎯', title: 'AI optimization applied', desc: '3 posts automatically rescheduled for optimal timing', time: '1 hour ago', color: 'bg-purple-50 border-purple-200' },
            { icon: '⚠️', title: 'Scheduling conflict resolved', desc: 'Instagram post moved to avoid overlapping with Twitter', time: '2 hours ago', color: 'bg-yellow-50 border-yellow-200' },
          ].map((activity, idx) => (
            <div key={idx} className={`flex items-start justify-between p-2.5 rounded-lg border ${activity.color}`}>
              <div className="flex items-start gap-2.5">
                <span className="text-lg">{activity.icon}</span>
                <div>
                  <p className="font-semibold text-sm">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.desc}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Scheduled Posts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="border-0 bg-card shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                  <CardTitle className="text-xl font-semibold">Scheduled Posts</CardTitle>
                  <CardDescription>Manage your upcoming content across all platforms</CardDescription>
              </div>
            </div>
            
              <div className="flex items-center gap-3">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger className="w-[160px] h-10">
                    <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="x">Twitter/X</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
              
                <Button 
                  className="repurpose-gradient gap-2"
                  onClick={() => setIsAdvancedSchedulerOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                Schedule New
              </Button>
            </div>
          </div>
        </CardHeader>
          <CardContent className="pt-0 pb-6">
          {isLoadingPosts ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mx-auto mb-6 flex items-center justify-center">
                <RefreshCw className="h-10 w-10 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Loading scheduled posts...</h3>
              <p className="text-muted-foreground">Please wait while we fetch your content</p>
            </div>
          ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mx-auto mb-6 flex items-center justify-center">
                  <CalendarIcon className="h-10 w-10 text-purple-600" />
              </div>
                <h3 className="text-xl font-semibold mb-3">No scheduled posts</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {selectedPlatform !== "all" 
                  ? `No posts scheduled for ${selectedPlatform}`
                    : "Start scheduling content to see it here. Create engaging posts and schedule them for optimal times."}
                </p>
                <Button 
                  size="lg" 
                  className="repurpose-gradient gap-2"
                  onClick={() => setIsAdvancedSchedulerOpen(true)}
                >
                  <Plus className="h-5 w-5" />
                Schedule Your First Post
              </Button>
            </div>
          ) : (
              <div className="space-y-4">
                {filteredPosts.map((post, index) => {
                const platformInfo = getPlatformInfo(post.platform);
                  const statusInfo = statusConfig[post.status as keyof typeof statusConfig];

                return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-all duration-200 border-0 bg-white group">
                        <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Platform Icon */}
                            <div className={`w-14 h-14 rounded-xl ${platformInfo.bg} flex items-center justify-center text-2xl font-bold ${platformInfo.color} flex-shrink-0 shadow-lg`}>
                          {platformInfo.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <Badge variant="outline" className="capitalize text-sm font-medium px-3 py-1">
                                {post.platform}
                              </Badge>
                                  <Badge className={`text-sm px-3 py-1 ${statusInfo.bg} ${statusInfo.color} border ${statusInfo.border}`}>
                                    <statusInfo.icon className="w-3 h-3 mr-1" />
                                    {statusInfo.label}
                              </Badge>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleEditPost(post.id)} className="gap-2">
                                      <Edit className="h-4 w-4" />
                                      Edit Post
                                </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2">
                                      <Eye className="h-4 w-4" />
                                  Preview
                                </DropdownMenuItem>
                                    <DropdownMenuItem className="gap-2">
                                      <Download className="h-4 w-4" />
                                  Export
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePost(post.id)}
                                      className="text-destructive gap-2"
                                >
                                      <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                              <p className="text-sm text-foreground line-clamp-3 mb-4 leading-relaxed">
                            {post.content}
                          </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span className="font-medium">
                                      {new Date(post.scheduledTime || post.scheduledDate).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: 'numeric', 
                                minute: '2-digit' 
                                      })}
                                    </span>
                            </div>
                                  <div className="flex items-center gap-2">
                              <span className="font-semibold text-primary">
                                {formatScheduledDate(new Date(post.scheduledTime || post.scheduledDate))}
                              </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {post.status === 'scheduled' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="gap-2 hover:bg-blue-50"
                                      onClick={() => handlePostAction(post.id, 'pause')}
                                    >
                                      <Pause className="h-3 w-3" />
                                      Pause
                                    </Button>
                                  )}
                                  {post.status === 'paused' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="gap-2 hover:bg-green-50"
                                      onClick={() => handlePostAction(post.id, 'resume')}
                                    >
                                      <Play className="h-3 w-3" />
                                      Resume
                                    </Button>
                                  )}
                                  {post.status === 'failed' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="gap-2 hover:bg-green-50"
                                      onClick={() => handlePostAction(post.id, 'retry')}
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                      Retry
                                    </Button>
                                  )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                    </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>

      {/* Quick Schedule Dialog */}
      <Dialog open={isQuickScheduleOpen} onOpenChange={setIsQuickScheduleOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Quick Schedule
            </DialogTitle>
            <DialogDescription>
              Schedule your content across platforms with optimal timing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Platform Selection */}
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={quickSchedulePlatform} onValueChange={setQuickSchedulePlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="x">Twitter/X</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Content Input */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter your content here..."
                value={quickScheduleContent}
                onChange={(e) => setQuickScheduleContent(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{quickScheduleContent.length} characters</span>
                <span>Max 280 for Twitter</span>
              </div>
            </div>

            {/* Date and Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={quickScheduleDateTime ? quickScheduleDateTime.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setQuickScheduleDateTime(date);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={quickScheduleDateTime ? quickScheduleDateTime.toTimeString().slice(0, 5) : ''}
                  onChange={(e) => {
                    if (quickScheduleDateTime && e.target.value) {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const newDate = new Date(quickScheduleDateTime);
                      newDate.setHours(hours, minutes);
                      setQuickScheduleDateTime(newDate);
                    }
                  }}
                />
              </div>
            </div>

            {/* Quick Time Suggestions */}
            <div className="space-y-2">
              <Label>Quick Schedule</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Now', time: new Date() },
                  { label: 'In 1 hour', time: new Date(Date.now() + 60 * 60 * 1000) },
                  { label: 'Tomorrow 9 AM', time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000) },
                  { label: 'Next Monday 9 AM', time: (() => {
                    const nextMonday = new Date();
                    nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
                    nextMonday.setHours(9, 0, 0, 0);
                    return nextMonday;
                  })() }
                ].map((option) => (
                  <Button
                    key={option.label}
                    variant="outline"
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => setQuickScheduleDateTime(option.time)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsQuickScheduleOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleQuickSchedule}
              className="repurpose-gradient"
              disabled={!quickScheduleContent.trim() || !quickScheduleDateTime}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Schedule Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Schedule Post Dialog */}
      <Dialog open={isAdvancedSchedulerOpen} onOpenChange={setIsAdvancedSchedulerOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Advanced Schedule Post</DialogTitle>
            <DialogDescription>Schedule a post with advanced options</DialogDescription>
          </DialogHeader>
          <div className="flex h-[85vh]">
            {/* Left Sidebar - Account Selection */}
            <div className="w-80 bg-gray-50 border-r border-gray-200 p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Platform Selection</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            {postPlatform.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground capitalize">{postPlatform}</p>
                          <p className="text-sm text-muted-foreground">Selected Platform</p>
                        </div>
                        <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                    </div>
                    
                    {businessPlanRequired && (
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Manual Scheduling</p>
                            <p className="text-xs text-yellow-600">Business Plan required for account management</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Media Upload */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Media</h4>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      isDragOverMedia
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleMediaDragOver}
                    onDragLeave={handleMediaDragLeave}
                    onDrop={handleMediaDrop}
                  >
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-2">
                      Drag & drop images or videos
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('media-upload')?.click()}
                      className="text-xs"
                    >
                      Choose Files
                    </Button>
                    <input
                      id="media-upload"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleMediaUpload}
                    />
                  </div>
                  {mediaFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {mediaFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span className="text-xs text-gray-600 truncate">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMediaFiles(mediaFiles.filter((_, i) => i !== index))}
                            className="h-6 w-6 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Options */}
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="tag-people"
                        checked={postOptions.tagPeople}
                        onCheckedChange={(checked: boolean) =>
                          setPostOptions({ ...postOptions, tagPeople: checked })
                        }
                      />
                      <Label htmlFor="tag-people" className="text-sm text-foreground">
                        Tag people
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="add-location"
                        checked={postOptions.addLocation}
                        onCheckedChange={(checked: boolean) =>
                          setPostOptions({ ...postOptions, addLocation: checked })
                        }
                      />
                      <Label htmlFor="add-location" className="text-sm text-foreground">
                        Add location
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="border-b border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-foreground">Create Post</h2>
                <p className="text-sm text-muted-foreground">Compose your content and schedule it</p>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6 space-y-6">
                {/* Platform Selection */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Select Platform</Label>
                  <Select value={postPlatform} onValueChange={setPostPlatform}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="pinterest">Pinterest</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="reddit">Reddit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Caption Input */}
                <div>
                  <Label className="text-sm font-medium text-foreground mb-2 block">Caption</Label>
                  <Textarea
                    placeholder="What's on your mind?"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    className="min-h-[200px] resize-none text-base"
                  />
                  <div className="flex space-x-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHashtagSuggestions(!showHashtagSuggestions)}
                    >
                      <Hash className="w-4 h-4 mr-1" />
                      Hashtag Suggestions
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={generateAICaption}
                      disabled={isGeneratingCaption}
                    >
                      <Wand2 className="w-4 h-4 mr-1" />
                      {isGeneratingCaption ? 'Generating...' : 'AI Caption Writer'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        loadSavedCaptions();
                        setShowSavedCaptions(!showSavedCaptions);
                      }}
                    >
                      <Bookmark className="w-4 h-4 mr-1" />
                      Saved Captions
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={saveCaption}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Save Caption
                    </Button>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">Schedule</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Date</Label>
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
                      <Label className="text-xs text-muted-foreground mb-1 block">Time</Label>
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

              {/* Footer */}
              <div className="border-t border-gray-200 p-6">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsAdvancedSchedulerOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAdvancedSchedule}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                  >
                    Schedule Post
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Sidebar - Hashtag Suggestions */}
            {showHashtagSuggestions && (
              <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">Hashtag Suggestions</h4>
                    <div className="space-y-2">
                      <Input
                        placeholder="Search hashtags..."
                        value={hashtagKeyword}
                        onChange={(e) => setHashtagKeyword(e.target.value)}
                        className="text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateHashtagSuggestions(hashtagKeyword)}
                        className="w-full"
                        disabled={isLoadingTiming}
                      >
                        {isLoadingTiming ? 'Generating...' : 'Generate Suggestions'}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {hashtagSuggestions.map((hashtag, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded border cursor-pointer hover:bg-gray-50"
                        onClick={() => handleHashtagSelect(hashtag.hashtag)}
                      >
                        <span className="text-sm text-foreground">#{hashtag.hashtag}</span>
                        <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center">
                          {selectedHashtags.includes(hashtag.hashtag) && (
                            <Check className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Selected Hashtags</span>
                      <span className="text-xs text-muted-foreground">{selectedHashtags.length}/30</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selectedHashtags.map((hashtag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          #{hashtag}
                          <X
                            className="w-3 h-3 ml-1 cursor-pointer"
                            onClick={() => handleHashtagSelect(hashtag)}
                          />
                        </span>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllHashtags}
                      className="w-full"
                    >
                      Select All
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Right Sidebar - Saved Captions */}
            {showSavedCaptions && (
              <div className="w-80 bg-gray-50 border-l border-gray-200 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">Saved Captions</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSavedCaptions(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {savedCaptions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bookmark className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm">No saved captions yet</p>
                        <p className="text-xs">Save your first caption to get started</p>
                      </div>
                    ) : (
                      savedCaptions.map((caption, index) => (
                        <div
                          key={caption.id || index}
                          className="p-3 bg-white rounded border cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            setPostContent(caption.content);
                            if (caption.hashtags) {
                              setSelectedHashtags(caption.hashtags);
                            }
                            setShowSavedCaptions(false);
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs text-muted-foreground">
                              {new Date(caption.createdAt).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {caption.platform}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground line-clamp-3">
                            {caption.content}
                          </p>
                          {caption.hashtags && caption.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {caption.hashtags.slice(0, 3).map((tag: string, tagIndex: number) => (
                                <span key={tagIndex} className="text-xs text-blue-600">
                                  #{tag}
                                </span>
                              ))}
                              {caption.hashtags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{caption.hashtags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      loadCaptionTemplates();
                      // Show templates in the saved captions
                      setSavedCaptions(prev => [...captionTemplates, ...prev]);
                    }}
                    className="w-full"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Load Templates
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
