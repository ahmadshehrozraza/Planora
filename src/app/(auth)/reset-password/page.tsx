"use client";

import { useSearchParams } from "next/navigation";
import ResetPasswordForm from "@/features/auth/components/reset-password-form";
import { PageError } from "@/components/page-error";

export const ResetPasswordPage = () => {

    const searchParams = useSearchParams();

    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");
    const expire = searchParams.get("expire");

    if(!userId || !secret || !expire ){
        return <PageError message="Invalid reset link"/>
    }

    return (
        <div>
            <ResetPasswordForm secret={secret} userId={userId}  />
        </div>
    )
};

export default ResetPasswordPage;