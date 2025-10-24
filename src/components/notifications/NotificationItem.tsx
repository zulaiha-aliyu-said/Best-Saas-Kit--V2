"use client";

import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles,
  Gift,
  AlertCircle,
  Lightbulb,
  Megaphone,
  Trophy,
  ExternalLink,
  X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: number) => void;
  onClose: () => void;
}

const ICON_MAP: Record<string, any> = {
  Sparkles,
  Gift,
  AlertCircle,
  Lightbulb,
  Megaphone,
  Trophy,
};

const TYPE_COLORS: Record<string, string> = {
  welcome: "text-blue-600 bg-blue-50",
  achievement: "text-purple-600 bg-purple-50",
  alert: "text-orange-600 bg-orange-50",
  tip: "text-green-600 bg-green-50",
  update: "text-indigo-600 bg-indigo-50",
  promotion: "text-pink-600 bg-pink-50",
};

export function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
  const Icon = ICON_MAP[notification.icon] || Sparkles;
  const colorClass = TYPE_COLORS[notification.type] || "text-gray-600 bg-gray-50";
  const isUnread = !notification.is_read;

  const handleClick = () => {
    if (isUnread) {
      onMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      onClose();
    }
  };

  const content = (
    <div
      className={cn(
        "p-4 hover:bg-muted/50 transition-colors cursor-pointer relative",
        isUnread && "bg-blue-50/30"
      )}
      onClick={handleClick}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn(
              "font-medium text-sm",
              isUnread && "font-semibold"
            )}>
              {notification.title}
            </p>
            {isUnread && (
              <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
            
            {notification.action_url && notification.action_text && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                asChild
              >
                <span className="flex items-center gap-1">
                  {notification.action_text}
                  <ExternalLink className="w-3 h-3" />
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (notification.action_url) {
    return (
      <Link href={notification.action_url} className="block">
        {content}
      </Link>
    );
  }

  return content;
}






