import { useQuery  } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

export const useCurrent = () => {
    const query  = useQuery({
        queryKey: ["current"],
        queryFn: async () => {
            const response = await client.api.auth.current.$get();

            console.log(response);
            
            if(!response.ok) {
                return null;
            }

            const { data } = await response.json();
            return data;
        },
    });

    return query;
}