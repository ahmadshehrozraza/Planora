import { Models } from "node-appwrite";

export enum MemberRole{
    ADMIN = "ADMIN",
    MEMBER = "MEMBER",
};

export type Member = Models.Document &  {
  $id: string;
  workspaceId: string;
  userId: string;
  role: "ADMIN" | "MEMBER"; 
  name: string;
  email: string;
}
