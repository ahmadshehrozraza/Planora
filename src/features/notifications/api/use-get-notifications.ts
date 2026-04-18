"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotificationsAction } from "../server/notifications";

export const useGetNotifications = () => {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await getNotificationsAction();
            if (res?.error) throw new Error(res.error);
            return res.data;
        },
        // refetchInterval: 10000 yahan se hta diya gaya hai
    });
};