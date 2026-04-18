export type Workspace = {
    id: string;
    name: string;
    imageUrl: string | null; // Prisma mein yeh null ho sakta hai
    inviteCode: string;
    createdAt: Date;
    updatedAt: Date;
};