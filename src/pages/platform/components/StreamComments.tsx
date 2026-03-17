import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, MessageSquare, ThumbsUp, ThumbsDown, Send } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useAuth } from "../context/AuthContext";

interface Comment {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
  isVerified?: boolean;
}

const MOCK_COMMENTS: Comment[] = [
  { id: "1", username: "StreamFan42", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=StreamFan42", text: "This stream is amazing! 🔥", timestamp: "2 min ago", likes: 12 },
  { id: "2", username: "NightOwl", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=NightOwl", text: "Can you play something chill next?", timestamp: "5 min ago", likes: 4 },
  { id: "3", username: "PixelMaster", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=PixelMaster", text: "Been watching for 3 hours straight, no regrets 😂", timestamp: "8 min ago", likes: 23 },
  { id: "4", username: "CozyVibes", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=CozyVibes", text: "Perfect background for studying", timestamp: "12 min ago", likes: 8 },
  { id: "5", username: "TechWiz", avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=TechWiz", text: "Audio quality is top notch today 🎧", timestamp: "15 min ago", likes: 6 },
];

interface StreamCommentsProps {
  channelName: string;
  className?: string;
}

export const StreamComments: React.FC<StreamCommentsProps> = ({ channelName, className }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const { user, openAuthModal } = useAuth();
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (!newComment.trim()) return;
    setComments(prev => [{
      id: Date.now().toString(),
      username: user.displayName || "Anonymous",
      avatar: user.photoURL || `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.uid}`,
      text: newComment.trim(),
      timestamp: "Just now",
      likes: 0,
    }, ...prev]);
    setNewComment("");
  };

  return (
    <div className={cn("border-t border-border/30", className)}>
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Comments</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Comment Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Add a comment..." : "Sign in to comment"}
              className="flex-1 bg-muted/50 border border-border/50 rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="p-2 rounded-full bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <img
                  src={comment.avatar}
                  alt={comment.username}
                  className="w-8 h-8 rounded-full bg-muted shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{comment.username}</span>
                    <span className="text-[10px] text-muted-foreground">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5 leading-snug">{comment.text}</p>
                  <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-[10px]">{comment.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                    <button className="text-[10px] text-muted-foreground hover:text-foreground transition-colors font-medium">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
