import { useQuery  } from "@tanstack/react-query";

export const useCurrent = () => {
    const query  = useQuery({
        queryKey: ["current"],
        queryFn: async () => {
            
        },
    });

    return query;
}