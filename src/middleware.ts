import { auth } from "@/auth/auth"; 
import { NextResponse } from "next/server";

export default auth((req) => {
    const isLoggedIn = !!req.auth; 
    const url = req.nextUrl;

    const isPublicPage = [
        "/", "/sign-in",
        "/sign-up", 
        "/forget-password", 
        "/reset-password",
        "/docs",
        "/privacy",
        "/terms",
        "/community",
    ].includes(url.pathname);

    if (isPublicPage) {
        if (isLoggedIn && url.pathname !== "/") { 
            return NextResponse.redirect(new URL("/", req.url));
        }
        return NextResponse.next(); // Public page ko chalne do
    }

    if (!isLoggedIn) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};