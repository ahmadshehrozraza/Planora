"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { PageError } from "@/components/page-error";

const ResetPasswordContent = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    if (!token) {
        return <PageError message="Invalid or missing reset link"/>
    }

    return (
        <div>
            <ResetPasswordForm token={token} />
        </div>
    )
}

export const ResetPasswordPage = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    )
};

export default ResetPasswordPage;