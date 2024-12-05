import { createStore, useStore } from "zustand"
import { useShallow } from "zustand/react/shallow"
import { InventoryKeys } from "src/utils"
import { createContext, useContext } from "react"

export const EditorContext = createContext(null)

export const createEditorStore = ({
  name,
  farmName,
  pronouns,
  gold,
  essence,
  renown,
  calendarTime,
  year,
  season,
  day,
  health,
  stamina,
  mana,
  rewardInventory,
  birthdayDay,
  birthdaySeason,
  inventory,
  maxMinesLevel
}) =>
  createStore((set, get) => ({
    name,
    farmName,
    pronouns,
    gold,
    essence,
    renown,
    calendarTime,
    year,
    season,
    day,
    health,
    stamina,
    mana,
    rewardInventory,
    birthdayDay,
    birthdaySeason,
    inventory,
    maxMinesLevel,
    setName: (newName) => set(() => ({ name: newName })),
    setFarmName: (newFarmName) => set(() => ({ farmName: newFarmName })),
    setPronouns: (newPronouns) => set(() => ({ pronouns: newPronouns })),
    setGold: (newGold) => set(() => ({ gold: newGold })),
    setEssence: (newEssence) => set(() => ({ essence: newEssence })),
    setRenown: (newRenown) => set(() => ({ renown: newRenown })),
    setCalendarTime: (newCalendarTime) => set(() => ({ calendarTime: newCalendarTime })),
    setYear: (newYear) => set(() => ({ year: newYear })),
    setSeason: (newSeason) => set(() => ({ season: newSeason })),
    setDay: (newDay) => set(() => ({ day: newDay })),
    setHealth: (newHealth) => set(() => ({ health: newHealth })),
    setStamina: (newStamina) => set(() => ({ stamina: newStamina })),
    setRewardInventory: (newRewardInventory) => set(() => ({ rewardInventory: newRewardInventory })),
    setMana: (newMana) => set(() => ({ mana: newMana })),
    setBirthdayDay: (newBirthdayDay) => set(() => ({ birthdayDay: newBirthdayDay })),
    setBirthdaySeason: (newBirthdaySeason) => set(() => ({ birthdaySeason: newBirthdaySeason })),
    setInventory: (newInventory) => set(() => ({ inventory: newInventory })),
    setMaxMinesLevel: (newMaxMinesLevel) => set(() => ({ maxMinesLevel: newMaxMinesLevel })),
    setEdits: set,
    getEdits: get
  }))

export function useEditorContext(selector) {
  const store = useContext(EditorContext)
  return useStore(store, selector)
}

export const useEditSettings = () =>
  useEditorContext(
    useShallow((s) => ({
      setEdits: s.setEdits,
      getEdits: s.getEdits
    }))
  )

export const useGeneralEdits = () =>
  useEditorContext(
    useShallow((s) => ({
      name: s.name,
      setName: s.setName,
      farmName: s.farmName,
      setFarmName: s.setFarmName,
      pronouns: s.pronouns,
      setPronouns: s.setPronouns,
      birthdayDay: s.birthdayDay,
      setBirthdayDay: s.setBirthdayDay,
      birthdaySeason: s.birthdaySeason,
      setBirthdaySeason: s.setBirthdaySeason
    }))
  )

export const useCalendarEdits = () =>
  useEditorContext(
    useShallow((s) => ({
      day: s.day,
      setDay: s.setDay,
      season: s.season,
      setSeason: s.setSeason,
      year: s.year,
      setYear: s.setYear
    }))
  )

export const useStatsEdits = () =>
  useEditorContext(
    useShallow((s) => ({
      gold: s.gold,
      setGold: s.setGold,
      essence: s.essence,
      setEssence: s.setEssence,
      renown: s.renown,
      setRenown: s.setRenown,
      health: s.health,
      setHealth: s.setHealth,
      stamina: s.stamina,
      setStamina: s.setStamina,
      mana: s.mana,
      setMana: s.setMana
    }))
  )

export const useInventory = (inventoryKey) =>
  useEditorContext(
    useShallow((s) => ({
      inventory: s[inventoryKey],
      setInventory: s[inventoryKey === InventoryKeys.Player ? "setInventory" : "setRewardInventory"]
    }))
  )
