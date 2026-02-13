import { z } from "zod";
import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { zValidator } from "@hono/zod-validator";

import { createTaskSchema, editTaskSchema } from "../schemas";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { Task, TaskStatus, TaskType, TaskPriority } from "../types"; 
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";

const app = new Hono()
    .delete(
        "/:taskId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const { taskId } = c.req.param();

            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            const member = await getMember({
                databases,
                workspaceId: task.workspaceId,
                userId: user.$id,
            });


            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            await databases.deleteDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );

            return c.json({ data: { $id: taskId, deleted: true, }, }, 200)
        }
    )


    .get(
    "/",
    sessionMiddleware,
    zValidator(
        "query",
        z.object({
            workspaceId: z.string(),
            projectId: z.string().nullish(),
            assigneeId: z.string().nullish(),
            status: z.string().nullish(),
            search: z.string().nullish(),
            dueDate: z.string().nullish(),
            description: z.string().nullish(),
            taskType: z.string().nullish(), 
            priority: z.string().nullish(),
        })
    ),
    async (c) => {
        const { users } = await createAdminClient();
        const databases = c.get("databases");
        const user = c.get("user");

        const {
            workspaceId,
            projectId,
            status,
            search,
            assigneeId,
            dueDate,
            description,
            taskType, 
            priority,
        } = c.req.valid("query");

        const member = await getMember({
            databases,
            workspaceId,
            userId: user.$id,
        });

        if (!member) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const memberRole = member.role; 
        const memberId = member.$id; 

        const query = [
            Query.equal("workspaceId", workspaceId),
            Query.orderDesc("$createdAt")
        ];

        if (memberRole !== "ADMIN") {
            query.push(Query.equal("assigneeId", memberId));
        } else {

        }

        if (projectId && projectId !== "all") {
            query.push(Query.equal("projectId", projectId));
        }

        if (status && status !== "all") {
            if (Object.values(TaskStatus).includes(status as TaskStatus)) {
                query.push(Query.equal("status", status));
            }
        }

        if (taskType && taskType !== "all") {
            if (Object.values(TaskType).includes(taskType as TaskType)) {
                query.push(Query.equal("taskType", taskType));
            }
        }

        if (priority && priority !== "all") {
            if (Object.values(TaskPriority).includes(priority as TaskPriority)) {
                query.push(Query.equal("priority", priority));
            }
        }

        if (assigneeId && assigneeId !== "all-tasks") {
            if (memberRole === "ADMIN") {
                if (assigneeId === "no-assignee") {
                    query.push(Query.equal("assigneeId", "no-assignee"));
                } else {
                    query.push(Query.equal("assigneeId", assigneeId));
                }
            } else {

            }
        }

        if (dueDate) {
            try {
                const parsedDate = new Date(dueDate);
                const localYear = parsedDate.getFullYear();
                const localMonth = parsedDate.getMonth();
                const localDay = parsedDate.getDate();
                
                const startOfDay = new Date(localYear, localMonth, localDay, 0, 0, 0, 0);
                const endOfDay = new Date(localYear, localMonth, localDay, 23, 59, 59, 999);
                
                query.push(Query.greaterThanEqual("dueDate", startOfDay.toISOString()));
                query.push(Query.lessThanEqual("dueDate", endOfDay.toISOString()));
                
            } catch (error) {
                console.error("Date conversion error:", error);
            }
        }

        if (search) {
            query.push(Query.search("name", search));
        }

        if (description) {
            query.push(Query.search("description", description));
        }

        const tasks = await databases.listDocuments<Task>(
            DATABASE_ID,
            TASKS_ID,
            query,
        );

        const projectIds = tasks.documents.map((task) => task.projectId).filter(Boolean);
        const assigneeIds = tasks.documents.map((task) => task.assigneeId).filter(Boolean);

        const projects = await databases.listDocuments<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectIds?.length > 0 ? [Query.contains("$id", projectIds)] : [],
        );

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            assigneeIds?.length > 0 ? [Query.contains("$id", assigneeIds)] : [],
        );

        const assignees = await Promise.all(
            members.documents.map(async (member) => {
                const user = await users.get(member.userId);
                return {
                    ...member,
                    name: user.name || user.email,
                    email: user.email,
                }
            })
        )

        const populatedTasks = tasks.documents.map((task) => {
            const project = projects.documents.find(
                (project) => project.$id === task.projectId,
            );

            const assignee = assignees.find(
                (assignee) => assignee.$id === task.assigneeId,
            );

            return {
                ...task,
                project,
                assignee,
            };
        });

        return c.json({
            data: {
                ...tasks,
                documents: populatedTasks,
            },
            meta: {
                userRole: memberRole,
                canViewAllTasks: memberRole === "ADMIN",
                totalTasks: tasks.total,
                filtersApplied: query.length - 2, 
            }
        });
    }
)


    .post(
        "/",
        sessionMiddleware,
        zValidator("json", editTaskSchema),
        async (c) => {
            const user = c.get("user");
            const databases = c.get("databases");
            const {
                name,
                status,
                workspaceId,
                projectId,
                dueDate,
                assigneeId,
                assignedBy,
                description,
                taskType,
                priority,
            } = c.req.valid("json");

            const member = getMember({
                databases,
                workspaceId,
                userId: user.$id
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const highestPositionTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("status", status),
                    Query.equal("workspaceId", workspaceId),
                    Query.orderDesc("position"),
                    Query.limit(1),
                ],
            );

            const newPosition = highestPositionTask.documents.length > 0
                ? highestPositionTask.documents[0].position + 1000
                : 1000;

            const tasks = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name,
                    status,
                    workspaceId,
                    projectId,
                    dueDate,
                    assigneeId: assigneeId,
                    assignedBy: assignedBy , 
                    position: newPosition,
                    description,
                    taskType,
                    priority,
                },
            );

            return c.json({ data: tasks })
        }
    )


.patch(
    "/:taskId",
    sessionMiddleware,
    // zValidator("json", editTaskSchema),
    async (c) => {
        console.log("✅ PATCH route reached!");
        
        try {
  
            const body = await c.req.json();
            
            const user = c.get("user");
            const databases = c.get("databases");
            const { taskId } = c.req.param();
            
            const existingTask = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId,
            );
            
            const updatePayload = {
                name: body.name || existingTask.name,
                description: body.description || existingTask.description,
            };
            
            
            const updatedTask = await databases.updateDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId,
                updatePayload,
            );
            
            console.log("✅ Update successful!");
            
            return c.json({ 
                success: true, 
                data: updatedTask 
            });
            
        } catch (error) {
;
            return c.json({ 
                success: false, 
                // error: error.message 
            }, 500);
        }
    }
)


    .get(
    "/:taskId",
    sessionMiddleware,
    async (c) => {
        const currentUser = c.get("user");
        const databases = c.get("databases");
        const { users } = await createAdminClient();
        const { taskId } = c.req.param();

        const task = await databases.getDocument<Task>(
            DATABASE_ID,
            TASKS_ID,
            taskId,
        );

        const currentMember = await getMember({
            databases,
            workspaceId: task.workspaceId,
            userId: currentUser.$id,
        });

        if (!currentMember) {
            return c.json({ error: "Unauthorized" }, 401);
        }

        const project = await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            task.projectId,
        );

        let assignedByUser = null;

        if (task.assignedBy) {
            try {
                const assignedByUserData = await users.get(task.assignedBy);

                assignedByUser = {
                    $id: task.assignedBy,
                    name: assignedByUserData.name || assignedByUserData.email,
                    email: assignedByUserData.email,
                };

            } catch (error) {
                assignedByUser = {
                    $id: task.assignedBy,
                    name: "Unknown User",
                    email: null
                };
            }
        }

        let assignee = null;
        
        if (task.assigneeId && task.assigneeId !== "no-assignee") {
            try {
                const member = await databases.getDocument(
                    DATABASE_ID,
                    MEMBERS_ID,
                    task.assigneeId,
                );

                const user = await users.get(member.userId);

                assignee = {
                    ...member,
                    name: user.name || user.email,
                    email: user.email,
                };
            } catch (error) {
                console.log("Assignee not found, might be deleted:", task.assigneeId);
            }
        }

        return c.json({
            data: {
                ...task,
                project,
                assignee, 
                assignedByUser,
            },
        });
    }
)


    .post(
        "/bulk-update",
        sessionMiddleware,
        zValidator(
            "json",
            z.object({
                tasks: z.array(
                    z.object({
                        $id: z.string(),
                        status: z.nativeEnum(TaskStatus),
                        position: z.number().int().positive().min(1000).max(1_000_000),
                    })
                ),
            })
        ),
        async (c) => {
            const databases = c.get("databases");
            const { tasks } = await c.req.valid("json");
            const user = c.get("user");

            const tasksToUpdate = await databases.listDocuments<Task>(
                DATABASE_ID,
                TASKS_ID,
                [Query.equal("$id", tasks.map((task) => task.$id))]
            );

            const workspaceIds = new Set(tasksToUpdate.documents.map((t) => t.workspaceId));

            if (workspaceIds.size !== 1) {
                return c.json({ error: "All tasks must belong to the same workspace" }, 400);
            }

            const workspaceId = workspaceIds.values().next().value;
            if (!workspaceId) {
                return c.json({ error: "Workspace ID cannot be null" }, 400);
            }

            const member = await getMember({
                databases,
                workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const updatedTasks = await Promise.all(
                tasks.map(async (task) => {
                    const { $id, status, position } = task;
                    return databases.updateDocument<Task>(
                        DATABASE_ID,
                        TASKS_ID,
                        $id,
                        { status, position }
                    );
                })
            );

            return c.json({ data: updatedTasks });
        }
    );


export default app;