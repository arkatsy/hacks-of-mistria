import { create } from "zustand";

export const useStore = create((set) => ({
  editingSaveId: null,
  setEditingSaveId: (saveId) => set({ editingSaveId: saveId }),
  goToSelection: () => set({ editingSaveId: null })
}))
