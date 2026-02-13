"use client";

import Image from "next/image";
import  Link  from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface AuthLayoutProps {
    children: React.ReactNode;
};

const AuthLayoutProps = ({ children }: AuthLayoutProps) => {
    const pathname = usePathname();
    const isSignIn = pathname ==="/sign-in";

    return ( 
        <main className="bg-neutral-100 min-h-screen">
            <div className="mx-auto max-w-screen-2xl py-2 ">
                <nav className="flex justify-between items-center px-2 ">
                    <Image className="relative left-3 " src="/Planora_Logo_shadow.png" alt="logo" width={45} height={45} />
                    {/* <Button 
                    className="h-8"
                    asChild
                    variant="secondry">
                        <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
                        {isSignIn ? "Sign Up" : "Login"}
                        </Link>
                    </Button> */}
                </nav>
                <div className="flex flex-col items-center justify-center pt-2 md:pt-5">
                    {children}
                </div>
            </div>
        </main>
     );
}
 
export default AuthLayoutProps;