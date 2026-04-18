import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "../server/get-current-user";

export const useCurrent = () => {
    return useQuery({
        queryKey: ["current"],
        queryFn: async () => {
            const user = await getCurrentUser();
            return user;
        },
        retry: false, 
    });
};