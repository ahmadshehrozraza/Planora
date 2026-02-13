import { Task } from "../types";
import { useState } from "react";
import { PencilIcon, XIcon, MessageSquare, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@radix-ui/react-separator";
import { useUpdateTask } from "../api/use-update-task";
import { Card, CardContent } from "@/components/ui/card";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { TaskDate } from "./task-date";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface TaskCommentsProps {
    task: Task;
}

const dummyComments = [
    {
        id: "1",
        text: "This task needs more clarification on the requirements.",
        author: { name: "Ibrahim Muhammad", id: "user1" },
        createdAt: "2024-01-15T10:30:00.000Z"
    },
    {
        id: "2", 
        text: "I've updated the design files. Please review them.",
        author: { name: "Sami Ullah", id: "user2" },
        createdAt: "2024-01-16T14:20:00.000Z"
    },
    {
        id: "3",
        text: "The backend API is ready for integration.",
        author: { name: "Ahmad Shehroz Raza", id: "user3" },
        createdAt: "2024-01-17T09:15:00.000Z"
    }
];

export const TaskComments = ({
    task,
}: TaskCommentsProps) => {

    const [isEditing, setIsEditing] = useState(false);
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState(dummyComments);

    const { mutate, isPending } = useUpdateTask();

    const handleAddComment = () => {
        if (!comment.trim()) return;
        
        
        const newComment = {
            id: Date.now().toString(),
            text: comment,
            author: { name: "Current User", id: "current" },
            createdAt: new Date().toISOString()
        };
        
        setComments(prev => [newComment, ...prev]);
        setComment("");
        setIsEditing(false);
        
    
    }

    const handleEditComment = (commentId: string) => {
        console.log("Edit comment:", commentId);
    }

    const handleDeleteComment = (commentId: string) => { 
        setComments(prev => prev.filter(comment => comment.id !== commentId));
    }
    
    return(
        <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <MessageSquare className="size-5" />
                    <p className="text-lg font-semibold">Comments</p>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
                        {comments.length}
                    </span>
                </div>
                <Button
                    onClick={() => setIsEditing((prev) => !prev)}
                    size="sm"
                    variant="secondry"
                >
                    {isEditing ? (
                        <XIcon className="size-4 mr-2" />
                    ) : (
                        <MessageSquare className="size-4 mr-2" />
                    )}
                    {isEditing ? "Cancel" : "Add Comment"}
                </Button>
            </div>
            <Separator className="my-3" />
            
            {/* Comment Input Section */}
            {isEditing && (
                <div className="flex flex-col gap-y-4 mb-6">
                    <Textarea
                        placeholder="Add a comment..."
                        value={comment}
                        rows={3}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={isPending}
                        className="resize-none"
                    />
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleAddComment}
                            disabled={isPending || !comment.trim()}
                        >
                            {isPending ? "Posting..." : "Post Comment"}
                        </Button>
                    </div>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {comments.length > 0 ? (
                    comments.map((comment) => (
                        <Card key={comment.id} className="relative">
                            <CardContent className="p-4">
                                {/* Comment Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <MemberAvatar
                                            name={comment.author.name}
                                            className="size-8"
                                            fallbackClassname="text-sm"
                                        />
                                        <div>
                                            <p className="text-sm font-medium">
                                                {comment.author.name}
                                            </p>
                                            <TaskDate 
                                                className="text-xs text-muted-foreground"
                                                value={comment.createdAt}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* Edit/Delete Dropdown */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreVertical className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem 
                                                onClick={() => handleEditComment(comment.id)}
                                                className="flex items-center gap-2"
                                            >
                                                <Edit className="size-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem 
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="flex items-center gap-2 text-destructive"
                                            >
                                                <Trash2 className="size-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {/* Comment Text */}
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                    {comment.text}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="size-12 mx-auto mb-3 opacity-50" />
                        <p>No comments yet</p>
                        <p className="text-sm">Be the first to add a comment</p>
                    </div>
                )}
            </div>
        </div>
    )
}