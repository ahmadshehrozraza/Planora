import { useQuery } from "@tanstack/react-query";
import { dummyUsers } from "@/features/auth/server/dummy-users";
import { User } from "@/features/auth/types";

interface UseGetUsersOptions {
  isActive?: boolean;
  searchQuery?: string;
}

export const useGetUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      
      const user = dummyUsers.find(u => u.userId === userId);
      
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      
      return user;
    },
    enabled: !!userId,
  });
};

export const useGetUsers = (options?: UseGetUsersOptions) => {
  return useQuery({
    queryKey: ["users", options],
    queryFn: async () => {
      
      let filteredUsers = [...dummyUsers];
      
      // Apply filters
      if (options?.isActive !== undefined) {
        filteredUsers = filteredUsers.filter(u => u.isActive === options.isActive);
      }
      
      if (options?.searchQuery) {
        const query = options.searchQuery.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
        );
      }
      
      // Statistics
      const activeUsers = filteredUsers.filter(u => u.isActive).length;
      const inactiveUsers = filteredUsers.filter(u => !u.isActive).length;
      
      // Recent users (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentUsers = filteredUsers.filter(u => 
        u.lastLogin && u.lastLogin > oneWeekAgo
      ).length;
      
      return {
        documents: filteredUsers,
        total: filteredUsers.length,
        activeUsers,
        inactiveUsers,
        recentUsers,
      };
    },
  });
};

export const useGetActiveUsers = () => {
  return useQuery({
    queryKey: ["active-users"],
    queryFn: async () => {
      
      const activeUsers = dummyUsers.filter(u => u.isActive);
      
      return {
        documents: activeUsers,
        total: activeUsers.length,
      };
    },
  });
};

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ["search-users", query],
    queryFn: async () => {
      
      if (!query.trim()) {
        return {
          documents: [],
          total: 0,
        };
      }
      
      const searchTerm = query.toLowerCase();
      const results = dummyUsers.filter(u => 
        u.name.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm)
      );
      
      return {
        documents: results,
        total: results.length,
      };
    },
    enabled: query.length > 0,
  });
};

export const useGetUserByIds = (userIds: string[]) => {
  return useQuery({
    queryKey: ["users-by-ids", userIds],
    queryFn: async () => {
      
      const users = dummyUsers.filter(u => userIds.includes(u.userId));
      
      return {
        documents: users,
        total: users.length,
      };
    },
    enabled: userIds.length > 0,
  });
};