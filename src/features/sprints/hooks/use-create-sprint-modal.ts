import { create } from "zustand";

interface CreateSprintModalState {
    isOpen: boolean;
    projectId?: string;
    setIsOpen: (isOpen: boolean) => void;
    open: (projectId?: string) => void;
    close: () => void;
}

export const useCreateSprintModal = create<CreateSprintModalState>((set) => ({
    isOpen: false,
    projectId: undefined,
    setIsOpen: (isOpen) => set({ isOpen }),
    open: (projectId) => set({ isOpen: true, projectId }),
    close: () => set({ isOpen: false, projectId: undefined }),
}));