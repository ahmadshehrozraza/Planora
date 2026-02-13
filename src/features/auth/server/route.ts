import { z } from "zod";
import { Account, Client, ID, Query } from "node-appwrite";
import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";

import { emailSchema, loginSchema, registerSchema, updateProfileSchema } from "../schemas";
import { createAdminClient } from "@/lib/appwrite";
import { AUTH_COOKIE } from "../constants";
import { sessionMiddleware } from "@/lib/session-middleware";
import { IMAGES_BUCKET_ID, DATABASE_ID, MEMBERS_ID } from "@/config";

const app = new Hono()

.get("/current", 
        sessionMiddleware, 
        async (c) => {
            try {
                const databases = c.get("databases");
                const user = c.get("user");
                
                let avatarBase64: string | undefined;

                const members = await databases.listDocuments(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [
                        Query.equal("userId", user.$id), 
                        Query.limit(1)
                    ]
                );

                if (members.documents.length > 0 && members.documents[0].memberImage) {
                    avatarBase64 = members.documents[0].memberImage;
                }

                return c.json({ 
                    data: {
                        ...user,
                        prefs: {
                            avatar: avatarBase64
                        }
                    }
                });
            } catch (error) {
                console.error("Error getting current user:", error);
                return c.json({ error: "Failed to get user" }, 500);
            }
        }
    )


.post(
  "/login",
  zValidator("json", loginSchema),
  async (c) => {
    const { email, password } = await c.req.valid("json");

    const { account } = await createAdminClient();

    const session = await account.createEmailPasswordSession(email, password);

    setCookie(c, AUTH_COOKIE, session.secret, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return c.json({ success: true });
  }
)


.post(
    "/register",
    zValidator("json", registerSchema),
    async (c) => {
        const { name, email, password } = await c.req.valid("json");

        const { account } = await createAdminClient();
        await account.create(
            ID.unique(),
            email,
            password,
            name,
        );

        const session = await account.createEmailPasswordSession(
            email,
            password,
        );

        setCookie(c,AUTH_COOKIE, session.secret, {
            path: "/",
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 30,
        });

        return c.json({ success: "true" });
}
)


.post(
    "/forgot-password",
    zValidator("json", emailSchema),
    async (c) => {
        const { email } = await c.req.valid("json");

        const { account } = await createAdminClient();

        try {

            await account.createRecovery(email, "http://localhost:3000/reset-password");
            
            return c.json({ 
                success: true,
                message: "Password reset instructions sent to your email"
            });
        } catch (error) {

            console.error("Recovery error:", error);
            return c.json({ 
                success: false,
                error: "Email not found in our system" 
            }, 404);
        }
    }
) 


.post(
    "/reset-password",
    zValidator("json", z.object({
        userId: z.string(),
        secret: z.string(),
        password: z.string().min(6),
        confirmPassword: z.string().min(6),
    })),
    async (c) => {
        const { userId, secret, password } = await c.req.valid("json");

        try {
            const { account } = await createAdminClient();
            
            await account.updateRecovery(userId, secret, password);
            
            return c.json({ 
                success: true,
                message: "Password reset successfully" 
            });
        } catch (error) {
            console.error("Password reset error:", error);
            return c.json({ 
                success: false,
                error: "Password reset failed. Link may be expired or invalid." 
            }, 400);
        }
    }
)


.patch(
    "/:userId",
    sessionMiddleware,
    zValidator("form", updateProfileSchema), 
    async (c) => {
        try {
            const { name, imageUrl } = c.req.valid("form"); 
            const { userId } = c.req.param();
            
            const account = c.get("account"); 
            const storage = c.get("storage");
            const databases = c.get("databases");
            const user = c.get("user");

            if (user.$id !== userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const updatedUser = await account.updateName(name);

            if (imageUrl === undefined) return;

            let avatarBase64: string | null = null;
            let fileIdToDelete: string | null = null;

            const members = await databases.listDocuments(
                DATABASE_ID,
                MEMBERS_ID,
                [Query.equal("userId", userId)]
            );

            if (members.documents.length > 0 && members.documents[0].memberImage) {
                const existingImageUrl = members.documents[0].memberImage;
                
                if (typeof existingImageUrl === 'string' && existingImageUrl.includes('/files/')) {
                    const match = existingImageUrl.match(/\/files\/([^/]+)\/view/);
                    if (match && match[1]) {
                        fileIdToDelete = match[1];
                    }
                }
            }

            if (imageUrl === "no-image") {
                avatarBase64 = null;
                
                if (members.documents.length > 0) {
                    const updatePromises = members.documents.map(member => 
                        databases.updateDocument(
                            DATABASE_ID,
                            MEMBERS_ID,
                            member.$id,
                            { memberImage: avatarBase64 }
                        )
                    );
                    await Promise.all(updatePromises);
                }

                if (fileIdToDelete) {
                    try {
                        await storage.deleteFile(IMAGES_BUCKET_ID, fileIdToDelete);
                    } catch (error) {
                    }
                }

            } else if (imageUrl instanceof File) {
                if (fileIdToDelete) {
                    try {
                        await storage.deleteFile(IMAGES_BUCKET_ID, fileIdToDelete);
                    } catch (error) {
                    }
                }
                
                const file = await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    imageUrl,
                );

                const arrayBuffer = await storage.getFileView(
                    IMAGES_BUCKET_ID,
                    file.$id,
                );

                avatarBase64 = `data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;

                if (members.documents.length > 0) {
                    const updatePromises = members.documents.map(member => 
                        databases.updateDocument(
                            DATABASE_ID,
                            MEMBERS_ID,
                            member.$id,
                            { memberImage: avatarBase64 }
                        )
                    );
                    await Promise.all(updatePromises);
                }

            } else {
                avatarBase64 = imageUrl;
            }

            return c.json({ 
                data: {
                    ...updatedUser,
                    prefs: {
                        avatar: avatarBase64 
                    }
                }
            });

        } catch (error) {
            console.error("Profile update error:", error);
            return c.json({ error: "Failed to update profile" }, 500);
        }
    }
)


.post(
    "/verify-password",
    zValidator("json", z.object({
        email: z.string().email(),
        currentPassword: z.string().min(1, "Current password is required"),
    })),
    async (c) => {
        try {
            const { email, currentPassword } = await c.req.valid("json");
            
            const { account } = await createAdminClient();
            
            console.log("Verifying password for:", email);

            try {
                const session = await account.createEmailPasswordSession(email, currentPassword);
                
                console.log("✅ Password verified successfully - session created");
                
                return c.json({ 
                    success: true,
                    message: "Password verified successfully" 
                });
                
            } catch (sessionError) {
                return c.json({ 
                    success: false,
                    error: "Invalid email or password" 
                }, 401);
            }
        } catch (error) {
            return c.json({ 
                success: false,
                error: "Password verification failed" 
            }, 500);
        }
    }
)


.delete(
    "/:userId",
    sessionMiddleware,
    async (c) => {
        try {
            const { userId } = c.req.param();
            const user = c.get("user");
            const databases = c.get("databases");

            if (user.$id !== userId) {
                return c.json({ error: "Unauthorized" }, 401);
            }
            
            console.log("🗑️ Marking user as inactive...");
            
            try {
                const userMemberships = await databases.listDocuments(
                    DATABASE_ID,
                    MEMBERS_ID,
                    [Query.equal("userId", userId)]
                );
                
                
                for (const member of userMemberships.documents) {
                    await databases.updateDocument(
                        DATABASE_ID,
                        MEMBERS_ID,
                        member.$id,
                        { isActive: false }
                    );

                }

            } catch (updateError) {
                console.error("Members update error:", updateError);
            }

            const { users } = await createAdminClient();
            await users.delete(userId);
            
            setCookie(c, AUTH_COOKIE, "", {
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 0, 
            });

            return c.json({ 
                success: true,
                message: "User account deleted successfully" 
            });

        } catch (error) {
            console.error("User deletion error:", error);
            return c.json({ error: "Failed to delete user account" }, 500);
        }
    }
)


.post(
    "/logout",
    sessionMiddleware,
    async (c) => {
        const account = c.get("account");

        const body = await c.req.json().catch(() => ({}));

        const workspaceId = body.workspaceId;

        if (workspaceId) {
            try {
                const user = await account.get();
                const currentPrefs = user.prefs || {};
                
                await account.updatePrefs({
                    ...currentPrefs,
                    lastWorkspace: workspaceId,
                    lastLogoutAt: new Date().toISOString()
                });
            } catch (prefsError) {
                console.log("Could not update user prefs:", prefsError);
            }
        }

        deleteCookie(c, AUTH_COOKIE);

        try {
            await account.deleteSession("current");
        } catch (error) {
            console.log("Session already invalid or missing on Appwrite, skipping.");
        }

        return c.json({ 
            success: true, 
            message: "Logged out successfully",
            lastWorkspace: workspaceId 
        });
    }
);
 
export default app;