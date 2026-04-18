import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth/auth";

export async function GET(
    req: Request,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: {
                id: params.userId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                createdAt: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);

    } catch (error) {
        console.error("GET_USER_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}