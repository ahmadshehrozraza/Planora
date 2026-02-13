
import { Account, Client } from "node-appwrite";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "./constants";
import { createSessionClient } from "@/lib/appwrite";

export const getCurrent = async () => {
    try{
        const { account } = await createSessionClient();
 
        return await account.get();

        } catch {
            return null;
        }
    };
