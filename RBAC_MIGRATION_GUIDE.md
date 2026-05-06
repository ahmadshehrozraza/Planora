# RBAC Migration Rules (CRITICAL)
We have moved from Static Enums (`ADMIN`, `MEMBER`) to a Dynamic RBAC system with a `CustomRole` table.

## The Old Way (DO NOT USE)
- Checking admin: `if (member.role === "ADMIN")`
- Assigning role: `role: "ADMIN"` or `role: "MEMBER"`
- Prisma schema used `enum WorkspaceRole` and `enum ProjectRole`.

## The New Way (USE THIS STRICTLY)
- Every Member now has a `roleId` pointing to a `CustomRole`.
- `CustomRole` has a `permissions` array (e.g., `[MANAGE_WORKSPACE_SETTINGS, VIEW_PROJECT]`).
- **To check if someone is an Admin/Owner:** Query if their assigned role's `permissions` array includes `"MANAGE_WORKSPACE_SETTINGS"`.
- **To assign a default role on joining Workspace:** Find the role where `isWorkspaceDefault: true` and assign its `id` to `roleId`.
- **To assign a default role on joining Project:** Find the role where `isProjectDefault: true` and assign its `id` to `roleId`.