export type User = {
    userId: string;
    name: string;
    email: string;
    password: string;
    isActive: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLogin?: Date;
};