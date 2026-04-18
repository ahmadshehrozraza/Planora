"use client";

import { Task } from "../types";
import { useState, useMemo } from "react";
import { 
  XIcon, MessageSquare, MoreVertical, Edit, 
  Trash2, Reply, ChevronDown, ChevronRight, ThumbsUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { DateIndicator } from "../../../components/date-indicator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useGetComments, useCommentMutations } from "../comments/api/use-comments";
import { PageLoader } from "@/components/page-loader";

interface TaskCommentsProps {
  task: Task;
}

export const TaskComments = ({ task }: TaskCommentsProps) => {

  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  const { data, isLoading } = useGetComments(task.id);
  const { createComment, updateComment, deleteComment, toggleLike } = useCommentMutations(task.id);

  const flatComments = data?.data || [];
  const currentUserId = data?.currentUserId || "";

  const commentsTree = useMemo(() => {
    const map = new Map();
    const roots: any[] = [];

    flatComments.forEach((c: any) => {
      map.set(c.id, {
        id: c.id,
        text: c.text,
        author: { name: c.author.name || "User", id: c.author.id, avatarUrl: c.author.image },
        createdAt: c.createdAt,
        likes: c.likedBy.map((user: any) => user.id),
        replies: [],
        parentId: c.parentId
      });
    });

    flatComments.reverse().forEach((c: any) => {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId).replies.push(map.get(c.id));
      } else if (!c.parentId) {
        roots.push(map.get(c.id));
      }
    });

    return roots.reverse();
  }, [flatComments]);

  const toggleCommentExpansion = (commentId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(commentId)) newExpanded.delete(commentId);
    else newExpanded.add(commentId);
    setExpandedComments(newExpanded);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    createComment.mutate({ taskId: task.id, text: commentText }, {
      onSuccess: () => {
        setCommentText("");
        setIsAddingComment(false);
      }
    });
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return;
    createComment.mutate({ taskId: task.id, text: replyText, parentId: commentId }, {
      onSuccess: () => {
        setReplyText("");
        setReplyingTo(null);
        setExpandedComments(prev => new Set(prev).add(commentId));
      }
    });
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editText.trim()) return;
    updateComment.mutate({ commentId, text: editText }, {
      onSuccess: () => {
        setEditingCommentId(null);
        setEditText("");
      }
    });
  };

  const renderComment = (comment: any, depth: number = 0) => {
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
        
        <Card className={cn("relative mb-3 transition-all hover:shadow-sm border-border bg-card", depth > 0 && "ml-6")}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <MemberAvatar name={comment.author.name} src={comment.author.avatarUrl} className="size-8 flex-shrink-0" fallbackClassname="text-sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate text-foreground">
                      {comment.author.name}
                      {isAuthor && <Badge variant="outline" className="ml-2 text-xs">You</Badge>}
                    </p>
                    <DateIndicator className="text-xs text-muted-foreground" value={comment.createdAt} />
                  </div>
                </div>
              </div>
              
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    <DropdownMenuItem onClick={() => { setEditingCommentId(comment.id); setEditText(comment.text); }} className="flex items-center gap-2 cursor-pointer">
                      <Edit className="size-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteComment.mutate(comment.id)} className="flex items-center gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                      <Trash2 className="size-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3 mb-3">
                <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} className="resize-none bg-background border-border" disabled={updateComment.isPending} />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setEditingCommentId(null)} disabled={updateComment.isPending}>Cancel</Button>
                  <Button size="sm" onClick={() => handleSaveEdit(comment.id)} disabled={!editText.trim() || updateComment.isPending}>Save</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground whitespace-pre-wrap mb-3">{comment.text}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className={cn("h-8 px-2", isLiked ? "text-primary" : "text-muted-foreground")} onClick={() => toggleLike.mutate(comment.id)} disabled={toggleLike.isPending}>
                  <ThumbsUp className={cn("size-4 mr-1", isLiked && "fill-primary")} />
                  <span className="text-xs">{comment.likes.length > 0 ? comment.likes.length : ''} Like</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
                  <Reply className="size-4 mr-1" />
                  <span className="text-xs">Reply</span>
                </Button>
              </div>
              
              {hasReplies && (
                <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={() => toggleCommentExpansion(comment.id)}>
                  {isExpanded ? <ChevronDown className="size-4 mr-1" /> : <ChevronRight className="size-4 mr-1" />}
                  <span className="text-xs">{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                </Button>
              )}
            </div>

            {replyingTo === comment.id && (
              <div className="mt-4 ml-4 border-l-2 border-primary/30 pl-4">
                <Textarea placeholder={`Reply to ${comment.author.name}...`} value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={2} className="resize-none mb-2 bg-background border-border" autoFocus disabled={createComment.isPending} />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => { setReplyingTo(null); setReplyText(""); }} disabled={createComment.isPending}>Cancel</Button>
                  <Button size="sm" onClick={() => handleReply(comment.id)} disabled={!replyText.trim() || createComment.isPending}>Post Reply</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {hasReplies && isExpanded && (
          <div className="ml-6">
            {comment.replies.map((reply: any) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const totalComments = flatComments.length;

  if (isLoading) {
    return <div className="p-8 border rounded-lg flex items-center justify-center"><PageLoader /></div>;
  }

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
        <Button onClick={() => setIsAddingComment(prev => !prev)} size="sm" variant="outline">
          {isAddingComment ? <XIcon className="size-4 mr-2" /> : <MessageSquare className="size-4 mr-2" />}
          {isAddingComment ? "Cancel" : "Add Comment"}
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      {isAddingComment && (
        <div className="flex flex-col gap-y-4 mb-6">
          <Textarea placeholder="Add a comment..." value={commentText} rows={3} onChange={(e) => setCommentText(e.target.value)} disabled={createComment.isPending} className="resize-none bg-background border-border" autoFocus />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setIsAddingComment(false); setCommentText(""); }} disabled={createComment.isPending}>Cancel</Button>
            <Button size="sm" onClick={handleAddComment} disabled={createComment.isPending || !commentText.trim()}>{createComment.isPending ? "Posting..." : "Post Comment"}</Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {commentsTree.length > 0 ? (
          <div className="space-y-2">
            {commentsTree.map(comment => renderComment(comment))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="size-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium text-foreground">No comments yet</p>
            <p className="text-sm mt-1">Start the conversation by adding the first comment</p>
            {!isAddingComment && (
              <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAddingComment(true)}>
                <MessageSquare className="size-4 mr-2" /> Add First Comment
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};