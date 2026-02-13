"use client";


import { Loader } from "lucide-react";




const LoadingPage = () => {
    return (
        <div className=" h-[70vh] items-center justify-center flex flex-col">
            <Loader className="size-6 animate-spin text-muted-foreground" />
            
        </div>
    );
}

export default LoadingPage;