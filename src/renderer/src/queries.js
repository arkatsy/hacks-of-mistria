import { useQuery } from "@tanstack/react-query"

const defaultQueryOpts = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: true,
  staleTime: Infinity,
  retry: 2
}

export function useSaveMetadata() {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: ["save-metadata"],
    queryFn: window.api.getSortedLoadingSaves
  })
}

export function useSaveData(saveId) {
  return useQuery({
    ...defaultQueryOpts,
    queryKey: ["save-data", saveId],
    queryFn: window.api.getSaveData.bind(null, saveId)
  })
}
