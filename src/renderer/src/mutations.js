import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getCalendarTime } from "src/utils"

export function useSavesRefresh() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: window.api.refreshSaves,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["save-metadata"] })
    }
  })
}

export function useSaveMutation(saveId) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (edits) => {
      await window.api.setName(saveId, edits.name)
      await window.api.setPronouns(saveId, edits.pronouns)
      await window.api.setFarmName(saveId, edits.farmName)
      await window.api.setGold(saveId, edits.gold)
      await window.api.setEssence(saveId, edits.essence)
      await window.api.setRenown(saveId, edits.renown)
      await window.api.setCalendarTime(saveId, getCalendarTime(edits.year, edits.season, edits.day))
      await window.api.setHealth(saveId, edits.health)
      await window.api.setStamina(saveId, edits.stamina)
      await window.api.setMana(saveId, edits.mana)
      await window.api.setRewardInventory(saveId, edits.rewardInventory)
      await window.api.setBirthday(
        saveId,
        getCalendarTime(0, edits.birthdaySeason, edits.birthdayDay)
      )
      await window.api.setInventory(saveId, edits.inventory)

      await window.api.updateSave(saveId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["save-data", saveId] })
      queryClient.invalidateQueries({ queryKey: ["save-metadata"] })
    }
  })
}
