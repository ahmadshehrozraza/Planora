import { Task } from "../types";
import { useState } from "react";
import { 
  PencilIcon, 
  XIcon, 
  MessageSquare, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Reply,
  ChevronDown,
  ChevronRight,
  Heart,
  ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useUpdateTask } from "../api/use-update-task";
import { Card, CardContent } from "@/components/ui/card";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { DateIndicator } from "../../../components/date-indicator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  text: string;
  author: { 
    name: string; 
    id: string;
    avatarUrl?: string;
  };
  createdAt: string;
  likes: string[]; 
  replies: Comment[];
  parentId?: string; 
  isEditing?: boolean;
}

interface TaskCommentsProps {
  task: Task;
}

const initialComments: Comment[] = [
  {
    id: "1",
    text: "This task needs more clarification on the requirements. Can someone provide more details about the acceptance criteria?",
    author: { name: "Ibrahim Muhammad", id: "user1" },
    createdAt: "2024-01-15T10:30:00.000Z",
    likes: ["user2", "user3"],
    replies: [
      {
        id: "1.1",
        text: "I've added the acceptance criteria in the task description. Please check now.",
        author: { name: "Sami Ullah", id: "user2" },
        createdAt: "2024-01-15T11:45:00.000Z",
        likes: ["user1"],
        replies: [
          {
            id: "1.1.1",
            text: "Thanks! That clarifies everything.",
            author: { name: "Ibrahim Muhammad", id: "user1" },
            createdAt: "2024-01-15T12:30:00.000Z",
            likes: [],
            replies: []
          }
        ]
      }
    ]
  },
  {
    id: "2", 
    text: "I've updated the design files. Please review them and let me know your feedback.",
    author: { name: "Sami Ullah", id: "user2" },
    createdAt: "2024-01-16T14:20:00.000Z",
    likes: ["user3", "current"],
    replies: []
  },
  {
    id: "3",
    text: "The backend API is ready for integration. Please make sure to use the latest version.",
    author: { name: "Ahmad Shehroz Raza", id: "user3" },
    createdAt: "2024-01-17T09:15:00.000Z",
    likes: ["user1", "user2"],
    replies: [
      {
        id: "3.1",
        text: "Great! I'll start integrating it today.",
        author: { name: "Ibrahim Muhammad", id: "user1" },
        createdAt: "2024-01-17T10:00:00.000Z",
        likes: ["user3"],
        replies: []
      }
    ]
  }
];

export const TaskComments = ({ task }: TaskCommentsProps) => {
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set(["1", "2", "3"]));
  const [currentUserId] = useState("current");

  const { mutate, isPending } = useUpdateTask();

  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedComments(newExpanded);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      text: commentText,
      author: { 
        name: "Current User", 
        id: currentUserId,
        avatarUrl: ""
      },
      createdAt: new Date().toISOString(),
      likes: [],
      replies: []
    };
    
    setComments(prev => [newComment, ...prev]);
    setCommentText("");
    setIsAddingComment(false);
    
    setExpandedComments(prev => new Set(prev).add(newComment.id));
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return;
    
    const newReply: Comment = {
      id: `${commentId}.${Date.now()}`,
      text: replyText,
      author: { 
        name: "Current User", 
        id: currentUserId,
        avatarUrl: ""
      },
      createdAt: new Date().toISOString(),
      likes: [],
      replies: [],
      parentId: commentId
    };
    
    const addReplyToComment = (commentsList: Comment[]): Comment[] => {
      return commentsList.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [newReply, ...comment.replies]
          };
        }
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReplyToComment(comment.replies)
          };
        }
        return comment;
      });
    };
    
    setComments(addReplyToComment(comments));
    setReplyText("");
    setReplyingTo(null);
    
    if (!expandedComments.has(commentId)) {
      setExpandedComments(prev => new Set(prev).add(commentId));
    }
  };

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditText(currentText);
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editText.trim()) return;
    
    const updateCommentText = (commentsList: Comment[]): Comment[] => {
      return commentsList.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, text: editText };
        }
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: updateCommentText(comment.replies)
          };
        }
        return comment;
      });
    };
    
    setComments(updateCommentText(comments));
    setEditingCommentId(null);
    setEditText("");
  };

  const handleDeleteComment = (commentId: string) => {
    const deleteComment = (commentsList: Comment[]): Comment[] => {
      return commentsList.filter(comment => {
        if (comment.id === commentId) return false;
        if (comment.replies.length > 0) {
          comment.replies = deleteComment(comment.replies);
        }
        return true;
      });
    };
    
    setComments(deleteComment(comments));
  };

  const handleLikeComment = (commentId: string) => {
    const toggleLike = (commentsList: Comment[]): Comment[] => {
      return commentsList.map(comment => {
        if (comment.id === commentId) {
          const likes = comment.likes.includes(currentUserId)
            ? comment.likes.filter(id => id !== currentUserId)
            : [...comment.likes, currentUserId];
          return { ...comment, likes };
        }
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: toggleLike(comment.replies)
          };
        }
        return comment;
      });
    };
    
    setComments(toggleLike(comments));
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isExpanded = expandedComments.has(comment.id);
    const hasReplies = comment.replies.length > 0;
    const isLiked = comment.likes.includes(currentUserId);
    const isAuthor = comment.author.id === currentUserId;
    const isEditing = editingCommentId === comment.id;

    return (
      <div key={comment.id} className="relative">
        {depth > 0 && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-4 border-l-2 border-border -ml-2"
            style={{ left: `${depth * 24}px` }}
          />
        )}
        
        <Card className={cn(
          "relative mb-3 transition-all hover:shadow-sm border-border bg-card",
          depth > 0 && "ml-6"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <MemberAvatar
                  name={comment.author.name}
                  className="size-8 flex-shrink-0"
                  fallbackClassname="text-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate text-foreground">
                      {comment.author.name}
                      {isAuthor && (
                        <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                    <DateIndicator
                      className="text-xs text-muted-foreground"
                      value={comment.createdAt}
                    />
                  </div>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border">

                    <DropdownMenuItem 
                      onClick={() => handleEditComment(comment.id, comment.text)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Edit className="size-4" />
                      Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isEditing ? (
              <div className="space-y-3 mb-3">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                  className="resize-none bg-background border-border"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCommentId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(comment.id)}
                    disabled={!editText.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground whitespace-pre-wrap mb-3">
                {comment.text}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 px-2", isLiked ? "text-primary" : "text-muted-foreground")}
                  onClick={() => handleLikeComment(comment.id)}
                >
                  <ThumbsUp className={cn(
                    "size-4 mr-1",
                    isLiked && "fill-primary"
                  )} />
                  <span className="text-xs">
                    {comment.likes.length > 0 ? comment.likes.length : ''} Like
                  </span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  <Reply className="size-4 mr-1" />
                  <span className="text-xs">Reply</span>
                </Button>
              </div>
              
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-muted-foreground"
                  onClick={() => toggleCommentExpansion(comment.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="size-4 mr-1" />
                  ) : (
                    <ChevronRight className="size-4 mr-1" />
                  )}
                  <span className="text-xs">
                    {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </Button>
              )}
            </div>

            {replyingTo === comment.id && (
              <div className="mt-4 ml-4 border-l-2 border-primary/30 pl-4">
                <Textarea
                  placeholder={`Reply to ${comment.author.name}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={2}
                  className="resize-none mb-2 bg-background border-border"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleReply(comment.id)}
                    disabled={!replyText.trim()}
                  >
                    Post Reply
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {hasReplies && isExpanded && (
          <div className="ml-6">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalComments = comments.reduce((total, comment) => {
    return total + 1 + comment.replies.length;
  }, 0);

  return (
    <div className="p-4 w-full border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-foreground" />
          <p className="text-lg font-semibold text-foreground">Comments</p>
          <Badge variant="secondary" className="ml-2">
            {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
          </Badge>
        </div>
        <Button
          onClick={() => setIsAddingComment(prev => !prev)}
          size="sm"
          variant="outline"
        >
          {isAddingComment ? (
            <XIcon className="size-4 mr-2" />
          ) : (
            <MessageSquare className="size-4 mr-2" />
          )}
          {isAddingComment ? "Cancel" : "Add Comment"}
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      {isAddingComment && (
        <div className="flex flex-col gap-y-4 mb-6">
          <Textarea
            placeholder="Add a comment..."
            value={commentText}
            rows={3}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={isPending}
            className="resize-none bg-background border-border"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddingComment(false);
                setCommentText("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddComment}
              variant={"primary"}
              disabled={isPending || !commentText.trim()}
            >
              {isPending ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.length > 0 ? (
          <div className="space-y-2">
            {comments.map(comment => renderComment(comment))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="size-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium text-foreground">No comments yet</p>
            <p className="text-sm mt-1">Start the conversation by adding the first comment</p>
            {!isAddingComment && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setIsAddingComment(true)}
              >
                <MessageSquare className="size-4 mr-2" />
                Add First Comment
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};