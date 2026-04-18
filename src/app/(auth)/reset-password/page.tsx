"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { PageError } from "@/components/page-error";

export const ResetPasswordPage = () => {
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
};

export default ResetPasswordPage;