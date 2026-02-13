"use client";

import Image from "next/image";

interface AuthLayoutProps {
    children: React.ReactNode;
};

const AuthLayoutProps = ({ children }: AuthLayoutProps) => {
    return ( 
        <main className="bg-neutral-100 min-h-screen">
            <div className="mx-auto max-w-screen-2xl py-2 ">
                <nav className="flex justify-between items-center px-2 ">
                    <Image className="relative left-3 " src="/Planora_Logo_shadow.png" alt="logo" width={45} height={45} />
                </nav>
                <div className="flex flex-col items-center justify-center pt-2 md:pt-5">
                    {children}
                </div>
            </div>
        </main>
     );
}
 
export default AuthLayoutProps;