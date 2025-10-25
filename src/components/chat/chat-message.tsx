'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Bot, User, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ChatMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (role === 'user') {
    return (
      <div className="flex gap-3 justify-end group">
        <div className="rounded-2xl px-4 py-3 max-w-[80%] bg-primary text-primary-foreground">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
          <User className="h-4 w-4 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-start group">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4 text-white" />
      </div>
      
      <div className="rounded-2xl px-4 py-3 max-w-[80%] bg-muted relative">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
          title="Copy message"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              // Paragraphs
              p: ({ node, ...props }) => (
                <p className="mb-3 last:mb-0 leading-relaxed text-sm" {...props} />
              ),
              // Headers
              h1: ({ node, ...props }) => (
                <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-base font-bold mb-2 mt-3 first:mt-0" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-sm font-semibold mb-2 mt-3 first:mt-0" {...props} />
              ),
              // Lists
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside mb-3 space-y-1 text-sm" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside mb-3 space-y-1 text-sm" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="leading-relaxed" {...props} />
              ),
              // Code blocks
              code: ({ node, inline, className, children, ...props }: any) => {
                if (inline) {
                  return (
                    <code
                      className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-xs font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <code
                    className={cn(
                      'block p-3 rounded-lg bg-black/5 dark:bg-white/5 overflow-x-auto text-xs font-mono mb-3',
                      className
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre: ({ node, ...props }) => (
                <pre className="mb-3 rounded-lg overflow-hidden" {...props} />
              ),
              // Blockquotes
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-primary/30 pl-4 italic my-3 text-sm"
                  {...props}
                />
              ),
              // Links
              a: ({ node, ...props }) => (
                <a
                  className="text-primary underline hover:text-primary/80 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              // Tables
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto mb-3">
                  <table className="min-w-full divide-y divide-border text-sm" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="px-3 py-2 text-left font-semibold bg-muted/50" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="px-3 py-2 border-t border-border" {...props} />
              ),
              // Horizontal rule
              hr: ({ node, ...props }) => (
                <hr className="my-4 border-border" {...props} />
              ),
              // Strong/Bold
              strong: ({ node, ...props }) => (
                <strong className="font-semibold" {...props} />
              ),
              // Emphasis/Italic
              em: ({ node, ...props }) => (
                <em className="italic" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
