import { Box, Center, Flex, Grid, Spinner, Text, createListCollection } from "@chakra-ui/react"
import { Button } from "@components/ui/button"
import { saves, translateCalendarTime, displayCalendarTime } from "@utils"
import { useEffect, useState } from "react"
import { NumberInputRoot, NumberInputField } from "@components/ui/number-input"
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText
} from "@components/ui/select"

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
    await window.api.setRenown(saveId, edits.renown)
    console.log(edits.year)
    // await window.api.setCalendarTime(saveId, edits.calendarTime)

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
  const setRenown = (newRenown) => setEdits((edits) => ({ ...edits, renown: newRenown }))
  const setYear = (newYear) => setEdits((edits) => ({ ...edits, year: newYear }))
  const setCalendarTime = (newCalendarTime) =>
    setEdits((edits) => ({ ...edits, calendarTime: newCalendarTime }))

  const shouldPreventUserInteraction = isLoadingSaveData || isApplyingEdits
  const loadingMessage = isLoadingSaveData
    ? "Reloading Save..."
    : isApplyingEdits
      ? "Applying edits..."
      : ""

  return (
    <Box px={6} w="full">
      <Flex justifyContent="space-between" pos="relative">
        <Button variant="outline" onClick={onBack} disabled={shouldPreventUserInteraction}>
          Back
        </Button>
        <Flex flexDir="column" gap={2}>
          <Flex gap={3}>
            <Button
              variant="subtle"
              onClick={refreshSaveData}
              disabled={shouldPreventUserInteraction}
            >
              Reload Save
            </Button>
            <Button onClick={applyEdits} disabled={shouldPreventUserInteraction}>
              Apply Edits
            </Button>
          </Flex>
          <Text textStyle="sm" opacity={0.7} textAlign="end">
            {save.id}
          </Text>
        </Flex>
      </Flex>
      <Box my={10}>
        {shouldPreventUserInteraction ? (
          <Center>
            <Flex flexDir="column" gap={4} alignItems="center">
              <Text>{loadingMessage}</Text>
              <Spinner />
            </Flex>
          </Center>
        ) : (
          <Grid templateColumns="repeat(3, 1fr)" gap="6">
            <NumberInput value={edits.gold} onValueChange={setGold} label="Gold" step={10} />
            <NumberInput
              value={edits.essence}
              onValueChange={setEssence}
              label="Essence"
              step={10}
            />
            <NumberInput
              value={edits.renown}
              onValueChange={setRenown}
              label="Renown"
              step={10}
            />
            {/* <CalendarInput
              value={edits.calendarTime}
              onValueChange={setCalendarTime}
              label="Calendar Time"
              step={86400}
            /> */}
            <Flex flexDir="row" gap={4} alignItems="center">
              <NumberInput
                value={edits.year}
                onValueChange={setYear}
                label="Year"
                step={1}
              />
              <SelectInput
                currentValue={edits.year}
                // onValueChange={setYear}
                textLabel="Year"
                collection={seasons}
              />
            </Flex>
          </Grid>
        )}
      </Box>
    </Box>
  )
}

function CalendarInput({ value, onValueChange, step, min, label }) {
  min ??= 0
  step ??= 1

  const handleValueChange = (e) => {
    console.log(e)
    onValueChange(+e.value)
  }

  return (
    <Flex flexDir="column" gap={2}>
      <Flex justifyContent="space-between">
        <Box as="label">{label}</Box>
        <Box opacity={0.8}>{displayCalendarTime(value)}</Box>
      </Flex>

      <NumberInputRoot min={0} step={step} value={+value || 0} onValueChange={handleValueChange}>
        <NumberInputField />
      </NumberInputRoot>
    </Flex>
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

function SelectInput({ collection, textLabel, currentValue }) {
  // const [value, setValue] = useState<string[]>([])
  return (
    <SelectRoot collection={collection} size="sm" width="320px">
      <SelectLabel>{textLabel}</SelectLabel>
      <SelectTrigger>
        <SelectValueText placeholder="Select season" />
      </SelectTrigger>
      <SelectContent>
        {collection.items.map((item) => (
          <SelectItem item={item} key={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  )
}

const seasons = createListCollection({
  items: [
    {label: "Spring", value: "spring"},
    {label: "Summer", value: "summer"},
    {label: "Fall", value: "fall"},
    {label: "Winter", value: "winter"},
  ]
})