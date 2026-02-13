
import { redirect } from "next/navigation";

import { getCurrent } from "@/features/auth/queries";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { UserProfileForm } from "@/features/auth/components/user-profile-form";


const UserProfilePage = async () => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");



    return (
        <div className="w-[767px] overflow-x-hidden h-full flex items-center justify-center flex-col">
            <div className="flex justify-center w-full">
                <UserProfileForm user={user} />
            </div>

        </div>
    );
}

export default UserProfilePage;