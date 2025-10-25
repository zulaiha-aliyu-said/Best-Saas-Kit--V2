'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  onSuccess?: () => void;
}

const categories = [
  { value: 'content_ideas', label: '💡 Content Ideas', icon: '💡' },
  { value: 'research', label: '🔍 Research', icon: '🔍' },
  { value: 'writing', label: '✍️ Writing', icon: '✍️' },
  { value: 'strategy', label: '🎯 Strategy', icon: '🎯' },
  { value: 'hooks', label: '🪝 Hooks', icon: '🪝' },
  { value: 'general', label: '⚡ General', icon: '⚡' },
];

export default function SavePromptModal({ isOpen, onClose, initialPrompt = '', onSuccess }: SavePromptModalProps) {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [category, setCategory] = useState('general');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError('');
    setSuccess(false);

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!prompt.trim()) {
      setError('Prompt is required');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          prompt: prompt.trim(),
          category,
          is_favorite: isFavorite,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);

        // Reset form
        setTimeout(() => {
          setTitle('');
          setPrompt('');
          setCategory('general');
          setIsFavorite(false);
          setSuccess(false);
          onClose();
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        setError(data.error || 'Failed to save prompt');
      }
    } catch (err) {
      console.error('Error saving prompt:', err);
      setError('Failed to save prompt. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setTitle('');
      setPrompt('');
      setCategory('general');
      setIsFavorite(false);
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Save Prompt to Library</DialogTitle>
          <DialogDescription>
            Save this prompt to reuse it later. You can organize it by category and mark it as favorite.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Content Ideas for LinkedIn"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              disabled={isSaving || success}
            />
            <p className="text-xs text-gray-500">{title.length}/255 characters</p>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt *</Label>
            <Textarea
              id="prompt"
              placeholder="Enter your prompt text..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              disabled={isSaving || success}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">{prompt.length} characters</p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={isSaving || success}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="favorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              disabled={isSaving || success}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="favorite" className="cursor-pointer">
              ⭐ Mark as favorite (appears at top of list)
            </Label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-600 dark:text-green-400">Prompt saved successfully!</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSaving || success}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || success || !title.trim() || !prompt.trim()}>
            {isSaving ? 'Saving...' : success ? 'Saved!' : 'Save Prompt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
