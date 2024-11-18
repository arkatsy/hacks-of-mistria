import { Box, Flex, Grid, Spinner, Text } from "@chakra-ui/react"
import { Button } from "@components/ui/button"
import { saves } from "@utils"
import { useEffect, useState } from "react"
import { NumberInputRoot, NumberInputField } from "@components/ui/number-input"

export default function SaveEditing({ saveId, onBack }) {
  const save = saves.find((save) => save.id === saveId)

  const [isLoadingSaveData, setIsLoadingSaveData] = useState(true)
  const [saveData, setSaveData] = useState(null)

  const [isApplyingEdits, setIsApplyingEdits] = useState(false)
  const [edits, setEdits] = useState(null)

  const refreshSaveData = async () => {
    setIsLoadingSaveData(true)
    const saveData = await window.api.getSaveData(saveId)
    setSaveData(saveData)
    setEdits(saveData)
    setIsLoadingSaveData(false)
  }

  const applyEdits = async () => {
    setIsApplyingEdits(true)
    await window.api.setGold(saveId, edits.gold)
    await window.api.setEssence(saveId, edits.essence)
    await window.api.setCalendarTime(saveId, edits.calendarTime)

    const success = await window.api.updateSave(saveId)
    setIsApplyingEdits(false)
    if (success) {
      console.log("Save updated succesfully")
      refreshSaveData()
    } else {
      console.error("Failed to update save")
    }
  }

  useEffect(() => {
    if (!save) {
      return
    }

    refreshSaveData()
  }, [saveId])

  const setGold = (newGold) => setEdits((edits) => ({ ...edits, gold: newGold }))
  const setEssence = (newEssence) => setEdits((edits) => ({ ...edits, essence: newEssence }))
  const setCalendarTime = (newCalendarTime) => setEdits((edits) => ({ ...edits, calendarTime: newCalendarTime }))

  const shouldDisable = isLoadingSaveData || isApplyingEdits

  return (
    <Box px={6} w="full">
      <Flex justifyContent="space-between" pos="relative">
        <Button variant="outline" onClick={onBack} disabled={shouldDisable}>
          Back
        </Button>
        <Flex flexDir="column" gap={2}>
          <Flex gap={3}>
            <Button
              variant="subtle"
              onClick={refreshSaveData}
              loading={isLoadingSaveData}
              disabled={shouldDisable}
            >
              Reload Save
            </Button>
            <Button onClick={applyEdits} loading={isApplyingEdits}>
              Apply Edits
            </Button>
          </Flex>
          <Text textStyle="sm" opacity={0.7} textAlign="end">
            {save.id}
          </Text>
        </Flex>
      </Flex>
      <Box my={10}>
        {isLoadingSaveData || isApplyingEdits ? (
          <Box>
            Refreshing
            <Spinner />
          </Box>
        ) : (
          <Grid templateColumns="repeat(3, 1fr)" gap="6">
            <NumberInput
              value={edits.gold}
              onValueChange={setGold}
              label="Gold"
              step={10} />
            <NumberInput
              value={edits.essence}
              onValueChange={setEssence}
              label="Essence"
              step={10}
            />
            <NumberInput
              value={edits.calendarTime}
              onValueChange={setCalendarTime}
              label="Calendar Time"
              step={86400}
            />
          </Grid>
        )}
      </Box>
    </Box>
  )
}

function NumberInput({ value, onValueChange, step, min, label }) {
  step ??= 1
  min ??= 0

  return (
    <Flex flexDir="column" gap={2}>
      <Box as="label">{label}</Box>

      <NumberInputRoot
        min={0}
        step={step}
        value={+value || 0}
        onValueChange={(e) => onValueChange(+e.value)}
      >
        <NumberInputField />
      </NumberInputRoot>
    </Flex>
  )
}
