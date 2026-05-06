# Prisma Query & Filter Migration Rules (CRITICAL)

We are migrating from static string roles to a dynamic `CustomRole` relation. 
The `role` field is NO LONGER a string. It is a relation object that contains a `permissions` array.

## Fix Prisma Database Queries:
Whenever you see a Prisma query checking for a static role, update it to query the `permissions` array using Prisma's `has` or `hasSome` operators.

- **Old:** `role: "ADMIN"`
- **New:** `role: { permissions: { has: "MANAGE_WORKSPACE_SETTINGS" } }`

- **Old:** `role: "PROJECT_MANAGER"`
- **New:** `role: { permissions: { has: "MANAGE_PROJECT_MEMBERS" } }`

- **Old:** `role: { in: ["PROJECT_MANAGER"] }`
- **New:** `role: { permissions: { has: "MANAGE_PROJECT_MEMBERS" } }`

- **Old:** `role: { in: ["ADMIN", "PROJECT_MANAGER"] }`
- **New:** `role: { permissions: { hasSome: ["MANAGE_WORKSPACE_SETTINGS", "MANAGE_PROJECT_MEMBERS"] } }`

## Fix Array Filtering / Mapping (Frontend/Logic):
Whenever you see `.filter()` or `.map()` checking for a static role string, update it to use Javascript's `.includes()`.

- **Old:** `.filter(p => p.role === "PROJECT_MANAGER")`
- **New:** `.filter(p => p.role?.permissions?.includes("MANAGE_PROJECT_MEMBERS"))`

- **Old:** `if (member.role === "ADMIN")`
- **New:** `if (member.role?.permissions?.includes("MANAGE_WORKSPACE_SETTINGS"))`