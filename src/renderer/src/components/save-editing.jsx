import { Box, Center, Flex, Grid, Spinner, Text } from "@chakra-ui/react"
import { Button } from "@components/ui/button"
import { saves, translateCalendarTime, displayCalendarTime } from "@utils"
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
    await window.api.setRenown(saveId, edits.renown)
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
  const setRenown = (newRenown) => setEdits((edits) => ({ ...edits, renown: newRenown }))
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
            <CalendarInput
              value={edits.calendarTime}
              onValueChange={setCalendarTime}
              label="Calendar Time"
              step={86400}
            />
            {/* <DateInput
              value={edits.calendarTime}
              onValueChange={setCalendarTime}
              yearLabel="Year"
              seasonLabel="Season"
              dayLabel="Day"
              yearStep={9676800}
              dayStep={86400}
            /> */}
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

function DateInput({ value, onValueChange, yearStep, dayStep, min, yearLabel, seasonLabel, dayLabel }) {
  min ??= 0

  let [year, season, day] = translateCalendarTime(value)

  const handleYearValueChange = (e) => {
    console.log(e)
    onValueChange(+translateCalendarTime(e.value)[0])
  }

  const handleDayValueChange = (e) => {
    console.log(+translateCalendarTime(e.value)[2])
    onValueChange(+translateCalendarTime(e.value)[2])
  }

  return (
    <Flex flexDir="column" gap={2}>
      <Box opacity={0.8}>{displayCalendarTime(value)}</Box>
      <Flex flexDir="row" gap={1}>
        <Flex flexDir="column" gap={2}>
          <Box>{yearLabel}</Box>
          <NumberInputRoot min={0} step={yearStep} value={+year || 0} onValueChange={handleYearValueChange} allowOverflow>
            <NumberInputField />
          </NumberInputRoot>
        </Flex>
        <Flex flexDir="column" gap={2}>
          <Box>{dayLabel}</Box>
          <NumberInputRoot min={0} step={dayStep} value={+day || 0} onValueChange={handleDayValueChange} allowOverflow>
            <NumberInputField />
          </NumberInputRoot>
        </Flex>
      </Flex>
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
