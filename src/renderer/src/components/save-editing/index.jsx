import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react"
import { Box, HStack, Portal, Show, Stack, Tabs, Text } from "@chakra-ui/react"
import { Button } from "src/components/primitives/button"
import { Loading } from "src/components/custom/loading"
import { useSaveData } from "src/queries"
import { useSaveMutation } from "src/mutations"
import { LuArrowLeft } from "react-icons/lu"
import { SaveIdContext } from "src/app"
import GeneralEdits from "src/components/save-editing/general-edits"
import StatsEdits from "src/components/save-editing/stats-edits"
import CalendarEdits from "src/components/save-editing/calendar-edits"
import MiscEdits from "src/components/save-editing/misc-edits"
import Inventory from "src/components/save-editing/inventory"
import { EditIcon } from "src/components/custom/icons"
import { createStore, useStore } from "zustand"

const BROWSER_BACK_BTN = 3

export default function Init() {
  const { goToSelection, editingSaveId } = useContext(SaveIdContext)
  const { data, isError } = useSaveData(editingSaveId)

  // Some keyboard shortcuts for easier navigation
  useEffect(() => {
    const handleMouseUp = (e) => {
      const btnCode = e.button
      if (btnCode === BROWSER_BACK_BTN) {
        goToSelection()
      }
    }

    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  if (isError) {
    return <Text>Error loading the save data</Text>
  }

  if (!data) {
    return <Loading text="Loading save data..." />
  }

  return (
    <Box px={6} py={4} w="full">
      <Box pos="relative">
        <Button variant="subtle" onClick={goToSelection}>
          <LuArrowLeft /> Back
        </Button>
        <EditorProvider {...structuredClone(data)}>
          <SaveEditor saveId={editingSaveId} />
        </EditorProvider>
      </Box>
    </Box>
  )
}

const createEditorStore = ({
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
}) => {
  return createStore((set) => ({
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
    setRewardInventory: (newRewardInventory) =>
      set(() => ({ rewardInventory: newRewardInventory })),
    setMana: (newMana) => set(() => ({ mana: newMana })),
    setBirthdayDay: (newBirthdayDay) => set(() => ({ birthdayDay: newBirthdayDay })),
    setBirthdaySeason: (newBirthdaySeason) => set(() => ({ birthdaySeason: newBirthdaySeason })),
    setInventory: (newInventory) => set(() => ({ inventory: newInventory })),
    setMaxMinesLevel: (newMaxMinesLevel) => set(() => ({ maxMinesLevel: newMaxMinesLevel })),
    discardEdits: (defaultState) => set(() => ({ ...defaultState }))
  }))
}

const EditorContext = createContext(null)

function EditorProvider({ children, ...props }) {
  const storeRef = useRef()
  if (!storeRef.current) {
    storeRef.current = createEditorStore(props)
  }

  return <EditorContext.Provider value={storeRef.current}>{children}</EditorContext.Provider>
}

export function useEditorContext(selector) {
  const store = useContext(EditorContext)
  return useStore(store, selector)
}

function SaveEditor({ saveId }) {
  const { mutate, isPending, isError, error } = useSaveMutation(saveId)
  const store = useContext(EditorContext)

  const handleDiscard = useEditorContext((s) => s.discardEdits)
  const handleApply = () => mutate(store.getState())

  return (
    <Fragment>
      <Button
        variant="subtle"
        pos="absolute"
        right="20"
        onClick={handleDiscard}
        disabled={isPending}
      >
        Discard
      </Button>
      <Button pos="absolute" right="0" onClick={handleApply} disabled={isPending}>
        Apply
      </Button>
      <Text textStyle="sm" pos="absolute" right="0" opacity="0.8" my="2">
        {saveId}
      </Text>
      <Show when={isPending}>
        <Portal>
          <Box
            pos="fixed"
            top="0"
            left="0"
            w="100vw"
            h="100vh"
            bg="rgba(0, 0, 0, 0.5)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="overlay"
          >
            <Loading text="Updating your save..." />
          </Box>
        </Portal>
      </Show>
      <Show when={isError}>{isError && <Text>Error updating save: {error.message}</Text>}</Show>
      <Box my="10">
        <Stack gap="8" w="full">
          <GeneralEdits />
          <CalendarEdits />
          <StatsEdits />
          <MiscEdits />
          <InventoryEdits />
        </Stack>
      </Box>
    </Fragment>
  )
}

export const InventoryKeys = {
  Player: "inventory",
  Rewards: "rewardInventory"
}

function InventoryEdits() {
  const [activeTab, setActiveTab] = useState(InventoryKeys.Player)
  const handleTabChange = useCallback((e) => setActiveTab(e.value), [])

  return (
    <Stack gap="4">
      <HStack gap="2">
        <EditIcon />
        <Text textStyle="xl" fontWeight="bold">
          Items
        </Text>
      </HStack>
      <Tabs.Root variant="enclosed" value={activeTab} onValueChange={handleTabChange} lazyMount>
        <Tabs.List>
          <Tabs.Trigger value={InventoryKeys.Player}>Inventory</Tabs.Trigger>
          <Tabs.Trigger value={InventoryKeys.Rewards}>Rewards</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value={InventoryKeys.Player}>
          <Inventory inventoryKey={InventoryKeys.Player} label="Your Inventory" />
        </Tabs.Content>
        <Tabs.Content value={InventoryKeys.Rewards}>
          <Inventory inventoryKey={InventoryKeys.Rewards} label="Rewards Inventory" />
        </Tabs.Content>
      </Tabs.Root>
    </Stack>
  )
}
