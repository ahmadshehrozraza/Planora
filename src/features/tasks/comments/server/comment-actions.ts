"use server";

import { auth } from "@/auth/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog } from "@/features/activity-logs/server/create-log";
import { ACTION, ENTITY_TYPE } from "@/features/activity-logs/types";
import { createNotification } from "@/features/notifications/server/create-notification";
import { eventEmitter } from "@/lib/event-emitter";

export async function getCommentsAction(taskId: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");
        
        const user = await prisma.user.findUnique({ 
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const comments = await prisma.comment.findMany({
            where: { taskId },
            include: {
                author: { select: { id: true, name: true, image: true } },
                likedBy: { select: { id: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        return { data: comments, currentUserId: user.id };
    } catch (error: any) {
        return { error: error.message || "Failed to fetch comments" };
    }
}

export async function createCommentAction({ taskId, text, parentId }: { taskId: string, text: string, parentId?: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({ 
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { workspaceId: true, projectId: true, name: true, assigneeId: true }
        });

        if (!task) throw new Error("Task not found");

        const newComment = await prisma.comment.create({
            data: { text, taskId, authorId: user.id, parentId: parentId || null }
        });

        await createAuditLog({
            workspaceId: task.workspaceId,
            projectId: task.projectId,
            entityId: newComment.id,
            entityType: ENTITY_TYPE.COMMENT,
            action: ACTION.CREATE,
            metadata: {
                message: `commented on task "${task.name}"`
            }
        });

        const usersToNotify = new Set<string>(); 

        if (task.assigneeId) {
            usersToNotify.add(task.assigneeId);
        }

        if (parentId) {
            const parentComment = await prisma.comment.findUnique({ 
                where: { id: parentId }, 
                select: { authorId: true }
            });
            if (parentComment?.authorId) {
                usersToNotify.add(parentComment.authorId);
            }
        }

        if (usersToNotify.size > 0) {
            await createNotification({
                userIds: Array.from(usersToNotify),
                actorId: user.id,
                workspaceId: task.workspaceId,
                projectId: task.projectId,
                entityId: taskId,
                entityType: "TASK",
                action: "COMMENTED",
                title: "New Comment",
                message: `commented on "${task.name}"`
            });
        }

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) { 
        return { error: error.message || "Failed to post comment" }; 
    }
}

export async function updateCommentAction({ commentId, text }: { commentId: string, text: string }) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({ 
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const existingComment = await prisma.comment.findUnique({
            where: { id: commentId },
            select: { authorId: true }
        });

        if (!existingComment) throw new Error("Comment not found");
        if (existingComment.authorId !== user.id) throw new Error("You can only edit your own comments");

        const updatedComment = await prisma.comment.update({ 
            where: { id: commentId }, 
            data: { text },
            include: { task: { select: { workspaceId: true, projectId: true, name: true } } }
        });

        await createAuditLog({
            workspaceId: updatedComment.task.workspaceId,
            projectId: updatedComment.task.projectId,
            entityId: updatedComment.id,
            entityType: ENTITY_TYPE.COMMENT,
            action: ACTION.UPDATE,
            metadata: {
                message: `updated their comment on task "${updatedComment.task.name}"`
            }
        });

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) { 
        return { error: error.message || "Failed to update comment" }; 
    }
}

export async function deleteCommentAction(commentId: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({ 
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const commentToDelete = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { task: { select: { workspaceId: true, projectId: true, name: true } } }
        });

        if (!commentToDelete) throw new Error("Comment not found");
        if (commentToDelete.authorId !== user.id) throw new Error("You can only delete your own comments");

        await prisma.comment.delete({ where: { id: commentId } });

        await createAuditLog({
            workspaceId: commentToDelete.task.workspaceId,
            projectId: commentToDelete.task.projectId,
            entityId: commentId,
            entityType: ENTITY_TYPE.COMMENT,
            action: ACTION.DELETE,
            metadata: {
                message: `deleted a comment on task "${commentToDelete.task.name}"`
            }
        });

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) { 
        return { error: error.message || "Failed to delete comment" }; 
    }
}

export async function toggleLikeCommentAction(commentId: string) {
    try {
        const session = await auth();
        if (!session?.user?.email) throw new Error("Unauthorized");

        const user = await prisma.user.findUnique({ 
            where: { email: session.user.email },
            select: { id: true }
        });
        if (!user) throw new Error("User not found");

        const comment = await prisma.comment.findUnique({
            where: { id: commentId }, 
            include: { 
                likedBy: { select: { id: true } },
                task: { select: { workspaceId: true, projectId: true, name: true, id: true } }
            }
        });

        if (!comment) throw new Error("Comment not found");

        const hasLiked = comment.likedBy.some(u => u.id === user.id);

        if (hasLiked) {
            await prisma.comment.update({ 
                where: { id: commentId }, 
                data: { likedBy: { disconnect: { id: user.id } } } 
            });
        } else {
            await prisma.comment.update({ 
                where: { id: commentId }, 
                data: { likedBy: { connect: { id: user.id } } } 
            });

            if (comment.authorId !== user.id) {
                await createNotification({
                    userIds: [comment.authorId],
                    actorId: user.id,
                    workspaceId: comment.task.workspaceId,
                    projectId: comment.task.projectId,
                    entityId: comment.task.id,
                    entityType: "TASK",
                    action: "UPDATED", 
                    title: "Comment Liked",
                    message: `liked your comment on "${comment.task.name}"`
                });
            }
        }

        eventEmitter.emit('invalidate');

        return { success: true };
    } catch (error: any) { 
        return { error: error.message || "Failed to toggle like" }; 
    }
}