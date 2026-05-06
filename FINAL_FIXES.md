# Final TypeScript Fixes Guide

## 1. Missing Prisma Includes (CRITICAL)
In the following server files, the queries for `workspaceMember` or `projectMember` are missing the relation include. You MUST add `include: { role: true }` to the queries, otherwise TypeScript cannot access `.role.permissions`.
**Target Files:**
- `src/features/projects/server/get-projects.ts` 
- `src/features/projects/server/project-actions.ts` 
- `src/features/projects/server/reset-project-invite-code.ts` 
- `src/features/tasks/server/get-tasks.ts` 
- `src/features/projects/server/get-project-members.ts`

*Example Fix:*
const workspaceMember = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
    include: { role: true } // ADD THIS LINE
});

## 2. API Hook Parameter Fixes
**Target File:** `src/app/(dashboard)/workspaces/[workspaceId]/members/client.tsx`
- The `updateMember` hook expects `roleId`. Fix the call to: `updateMember({ workspaceId, memberId, roleId: role });`

**Target File:** `src/features/projects/components/project-members.tsx`
- The `addProjectMember` call is missing the `roleId`. Add a placeholder to satisfy the type: `addProjectMember({ projectId, userId: selectedWorkspaceMember, roleId: "default" })`

## 3. UI Component Minor Fixes
**Target File:** `src/features/sprints/components/sprints-view.tsx`
- Fix import case: change `./sprints-Card` to `./sprints-card`.
- Wrap data usage in optional chaining: `data?.length` and `data?.map`.

**Target File:** `src/app/(dashboard)/workspaces/[workspaceId]/projects/[projectId]/sprints/[sprintId]/client.tsx`
- Explicitly cast the status: `status: sprint.status as SprintStatus`.

**Target File:** `src/features/events/components/data-calendar.tsx`
- Handle null description: `description={event.resource?.description || undefined}`

**Target File:** `src/features/dashboard/components/members-list.tsx`
- If the `Member` type is missing, temporarily change `data: Member[];` to `data: any[];` to clear the type error.

**Target File:** `src/components/date-badge.tsx`
- If `@/lib/date-utils` does not exist, remove the import and replace `getCurrentDate()` with `new Date()`.