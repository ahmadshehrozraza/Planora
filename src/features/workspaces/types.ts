

import { Models } from "node-appwrite";

export type Workspace = Models.Document & {
    name: string;
    imageUrl: string;
    inviteCode: string;
    userId: string;
};

export type DummyWorkspace = {
    id: string;
    name: string;
    imageUrl: string | null | undefined;
    inviteCode: string;
    userId: string;
    createdDate: Date;
    createdBy: string;
};