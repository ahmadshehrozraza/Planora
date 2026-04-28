export const dynamic = 'force-dynamic';

import { UserProfileForm } from "@/features/auth/components/user-profile-form";

const UserProfilePage = async () => {
    return (
        <div className="w-full">
            <UserProfileForm />
        </div>
    );
}

export default UserProfilePage;