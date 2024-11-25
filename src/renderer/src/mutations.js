import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useSaveDataMutation(saveId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => window.api.updateSave(saveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["save-data", saveId] })
      queryClient.invalidateQueries({ queryKey: ["save-metadata"] })
    },
    onError: (error) => {
      console.error(error)
    }
  })
}
