import { Box, Center, Flex, Grid, Spinner, Text, createListCollection } from "@chakra-ui/react"
import { Button } from "@components/ui/button"
import { saves, seasonsList, getCalendarTime } from "@utils"
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
    await window.api.setCalendarTime(saveId, getCalendarTime(edits.year, edits.season, edits.day))
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
  const setSeason = (newSeason) => setEdits((edits) => ({ ...edits, season: newSeason }))
  const setDay = (newDay) => setEdits((edits) => ({ ...edits, day: newDay }))
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
          <Grid templateColumns="repeat(2, 1fr)" gap="3">
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
              <NumberInput
                value={edits.year}
                onValueChange={setYear}
                label="Year"
                step={1}
              />
              <SelectInput
                currentValue={seasonsList[edits.season]}
                onValueChange={setSeason}
                textLabel="Season"
                collection={seasons}
              />
              <SelectInput
                currentValue={edits.day}
                onValueChange={setDay}
                textLabel="Day"
                collection={days}
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

function SelectInput({ collection, textLabel, currentValue, onValueChange }) {
  return (
    <SelectRoot 
      collection={collection} 
      size="md" 
      width="320px"
      positioning={{ placement: "bottom", flip: false }}
      onValueChange={(e) => onValueChange(e.value[0])}
    >
      <SelectLabel>{textLabel}</SelectLabel>
      <SelectTrigger>
        <SelectValueText placeholder={currentValue} />
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
    {label: "Spring", value: 0},
    {label: "Summer", value: 1},
    {label: "Fall", value: 2},
    {label: "Winter", value: 3},
  ]
})

const days = createListCollection({
  items: Array(28).fill().map((_,i) => ({ label: i+1, value: i+1}))
})