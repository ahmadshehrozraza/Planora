"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import Router from "next/router";



const ErrorPage = () => {
    return (
        <div className=" h-[70vh] items-center justify-center flex flex-col gap-y-4">
            <AlertTriangle className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
                Something went wrong
            </p>
            <Button
                variant="secondry"
                onClick={Router.back}
                size="sm">
                    Back
            </Button>
        </div>
    );
}

export default ErrorPage;