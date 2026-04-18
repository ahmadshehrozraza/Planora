"use server";

import { writeFile, mkdir } from "fs/promises";
import path from "path";

type UploadFolder = "avatars" | "files" | "projects" | "workspaces";

export async function uploadFileAction(formData: FormData, folder: UploadFolder) {
    try {
        const file = formData.get("file") as File;
        
        if (!file) {
            throw new Error("No file uploaded");
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const originalName = file.name.replace(/\s+/g, '-');
        const uniqueId = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const uniqueFilename = `${uniqueId}-${originalName}`;

        const uploadDir = path.join(process.cwd(), "public", "uploads", folder);

        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, uniqueFilename);
        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/${folder}/${uniqueFilename}`;

        return { 
            success: true, 
            fileUrl, 
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        };

    } catch (error: any) {
        console.error("UPLOAD_ERROR:", error);
        return { error: "Failed to upload file to local storage" };
    }
}