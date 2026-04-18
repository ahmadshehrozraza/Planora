"use client";

import { useQuery } from "@tanstack/react-query";
import { getMemberProfileAction } from "../server/get-member-profile";

export const useGetMemberProfile = ({ memberId }: { memberId: string }) => {
    return useQuery({
        queryKey: ["member-profile", memberId],
        queryFn: async () => {
            const response = await getMemberProfileAction({ memberId });
            if (response.error) throw new Error(response.error);
            return response.data;
        },
        enabled: !!memberId,
    });
};