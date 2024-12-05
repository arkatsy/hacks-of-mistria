import { Fragment, useCallback, useEffect, useState, useContext, useRef } from "react"
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
import Inventory from "src/components/save-editing/inventory"
import { EditIcon } from "src/components/custom/icons"
import ErrorBoundary from "src/components/custom/error-boundary"
import { EditorProvider } from "src/components/save-editing/provider"
import { useEditorContext, useEditSettings } from "src/components/save-editing/store"
import { InventoryKeys } from "src/utils"
import { useShallow } from "zustand/react/shallow"

export default function Init() {
  const { goToSelection, editingSaveId } = useContext(SaveIdContext)
  const { data, isError } = useSaveData(editingSaveId)

  useEffect(() => {
    const handleMouseUp = (e) => {
      const btnCode = e.button
      if (btnCode === 3) {
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
        <ErrorBoundary>
          <EditorProvider {...structuredClone(data)}>
            <SaveEditor saveId={editingSaveId} />
          </EditorProvider>
        </ErrorBoundary>
      </Box>
    </Box>
  )
}

function SaveEditor({ saveId }) {
  const { setEdits, getEdits } = useEditSettings()
  const { mutate, isPending, isError, error } = useSaveMutation(saveId)
  const { data } = useSaveData(saveId)

  const handleApplyEdits = () => mutate(getEdits())
  const handleDiscardEdits = () => setEdits({ ...structuredClone(data) })

  return (
    <Fragment>
      <Button variant="subtle" pos="absolute" right="20" onClick={handleDiscardEdits} disabled={isPending}>
        Discard
      </Button>
      <Button pos="absolute" right="0" onClick={handleApplyEdits} disabled={isPending}>
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
          <InventoryEdits />
        </Stack>
      </Box>
    </Fragment>
  )
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
