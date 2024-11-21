import {
  Box,
  Center,
  Flex,
  Grid,
  HStack,
  Image,
  Input,
  Spinner,
  Stack,
  Text,
  VStack,
  createListCollection
} from "@chakra-ui/react"
import { Field } from "@components/ui/field"
import { Button } from "@components/ui/button"
import { InputGroup } from "@components/ui/input-group"
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
import tesseraeIcon from "@assets/tessarae.webp"
import essenceIcon from "@assets/essence.png"
import renownIcon from "@assets/renown.png"

const TesseraeIcon = () => <Image src={tesseraeIcon} w="20px" h="20px" />
const EssenceIcon = () => <Image src={essenceIcon} w="20px" h="20px" />
const RenownIcon = () => <Image src={renownIcon} w="20px" h="20px" />

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
            <Flex flexDir="column" gap="4" alignItems="center">
              <Text>{loadingMessage}</Text>
              <Spinner />
            </Flex>
          </Center>
        ) : (
          <Stack gap="5">
            {/* ===== Stats ===== */}
            <Stack gap="4">
              <Text textStyle="xl" fontWeight="bold">
                Stats
              </Text>
              <Flex gap="3">
                <NumberInput
                  value={edits.gold}
                  onValueChange={setGold}
                  label="Gold"
                  step={10}
                  icon={<TesseraeIcon />}
                />
                <NumberInput
                  value={edits.essence}
                  onValueChange={setEssence}
                  label="Essence"
                  step={10}
                  icon={<EssenceIcon />}
                />
                <NumberInput
                  value={edits.renown}
                  onValueChange={setRenown}
                  label="Renown"
                  step={10}
                  icon={<RenownIcon />}
                />
              </Flex>
            </Stack>
            {/* ===== Calendar ===== */}
            <Stack gap="4">
              <Text textStyle="xl" fontWeight="bold">
                Calendar
              </Text>
              <Flex gap="2" w="full">
                <SelectInput
                  currentValue={edits.day}
                  onValueChange={setDay}
                  textLabel="Day"
                  collection={days}
                />
                <SelectInput
                  currentValue={seasonsList[edits.season]}
                  onValueChange={setSeason}
                  textLabel="Season"
                  collection={seasons}
                />
                <NumberInput
                  value={edits.year}
                  onValueChange={setYear}
                  label="Year"
                  step={1}
                  min={1}
                />
              </Flex>
            </Stack>
            {/* ===== Inventory ===== */}
            <Stack gap="4"></Stack>
          </Stack>
        )}
      </Box>
    </Box>
  )
}

function NumberInput({ value, onValueChange, step, min, label, helper, icon }) {
  return (
    <Field label={label} helperText={helper || ""}>
      <NumberInputRoot
        min={min || 0}
        step={step || 1}
        value={+value || 0}
        onValueChange={(e) => onValueChange(+e.value)}
        w="full"
      >
        <InputGroup flex="" w="full" startElement={icon || null}>
          <NumberInputField />
        </InputGroup>
      </NumberInputRoot>
    </Field>
  )
}

function SelectInput({ collection, textLabel, currentValue, onValueChange }) {
  return (
    <SelectRoot
      collection={collection}
      size="md"
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
    { label: "Spring", value: 0 },
    { label: "Summer", value: 1 },
    { label: "Fall", value: 2 },
    { label: "Winter", value: 3 }
  ]
})

const days = createListCollection({
  items: Array(28)
    .fill()
    .map((_, i) => ({ label: i + 1, value: i + 1 }))
})
