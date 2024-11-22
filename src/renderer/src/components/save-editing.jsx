import { useEffect, useState } from "react"
import {
  Box,
  Center,
  Flex,
  Grid,
  GridItem,
  HStack,
  Input,
  Image,
  Spinner,
  Stack,
  Text,
  createListCollection
} from "@chakra-ui/react"
import { Field } from "@components/ui/field"
import { Button } from "@components/ui/button"
import { InputGroup } from "@components/ui/input-group"
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
import editIcon from "@assets/edit.png"
import farmIcon from "@assets/farm.png"
import nameIcon from "@assets/name.png"
import healthIcon from "@assets/heart.png"
import staminaIcon from "@assets/stamina.png"
import manaIcon from "@assets/mana.png"
import { saves, seasonsList, getCalendarTime, PronounsList, formatPronouns } from "@utils"

const TesseraeIcon = () => <Image src={tesseraeIcon} w="20px" h="20px" />
const EssenceIcon = () => <Image src={essenceIcon} w="20px" h="20px" />
const RenownIcon = () => <Image src={renownIcon} w="20px" h="20px" />
const EditIcon = () => <Image src={editIcon} w="20px" h="20px" />
const FarmIcon = () => <Image src={farmIcon} w="20px" h="20px" />
const NameIcon = () => <Image src={nameIcon} w="20px" h="20px" />
const HealthIcon = () => <Image src={healthIcon} w="20px" h="20px" />
const StaminaIcon = () => <Image src={staminaIcon} w="20px" h="20px" />
const ManaIcon = () => <Image src={manaIcon} w="20px" h="20px" />

export default function SaveEditing({ saveId, onBack }) {
  const save = saves.find((save) => save.id === saveId)

  const [isLoadingSaveData, setIsLoadingSaveData] = useState(true)
  const [_, setSaveData] = useState(null)

  const [isApplyingEdits, setIsApplyingEdits] = useState(false)
  const [edits, setEdits] = useState(null)

  const refreshSaveData = async () => {
    setIsLoadingSaveData(true)
    const saveData = await window.api.getSaveData(saveId)
    // we assume the data shape of api.getSaveData(), edits & saveData is the same
    setSaveData(saveData)
    setEdits(saveData)
    setIsLoadingSaveData(false)
  }

  const applyEdits = async () => {
    setIsApplyingEdits(true)
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

  const setName = (newName) => setEdits((edits) => ({ ...edits, name: newName }))
  const setFarmName = (newFarmName) => setEdits((edits) => ({ ...edits, farmName: newFarmName }))
  const setGold = (newGold) => setEdits((edits) => ({ ...edits, gold: newGold }))
  const setEssence = (newEssence) => setEdits((edits) => ({ ...edits, essence: newEssence }))
  const setRenown = (newRenown) => setEdits((edits) => ({ ...edits, renown: newRenown }))
  const setYear = (newYear) => setEdits((edits) => ({ ...edits, year: newYear }))
  const setSeason = (newSeason) => setEdits((edits) => ({ ...edits, season: newSeason }))
  const setDay = (newDay) => setEdits((edits) => ({ ...edits, day: newDay }))
  const setPronouns = (pronouns) => setEdits((edits) => ({ ...edits, pronouns: pronouns }))
  const setHealth = (newHealth) => setEdits((edits) => ({ ...edits, health: newHealth }))
  const setStamina = (newStamina) => setEdits((edits) => ({ ...edits, stamina: newStamina }))
  const setMana = (newMana) => setEdits((edits) => ({ ...edits, mana: newMana }))

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
            {/* ===== General ===== */}
            <Stack gap="4">
              <HStack gap="2">
                <EditIcon />
                <Text textStyle="xl" fontWeight="bold">
                  General
                </Text>
              </HStack>
              <Grid templateColumns="repeat(3, 1fr)" gap="3">
                <GridItem>
                  <TextInput
                    currentValue={edits.name}
                    onChange={setName}
                    textLabel="Name"
                    icon={<NameIcon />}
                  />
                </GridItem>
                <GridItem>
                  <SelectInput
                    currentValue={edits.pronouns}
                    onValueChange={setPronouns}
                    textLabel="Pronouns"
                    collection={pronouns}
                  />
                </GridItem>
                <GridItem>
                  <TextInput
                    currentValue={edits.farmName}
                    onChange={setFarmName}
                    textLabel="Farm Name"
                    icon={<FarmIcon />}
                  />
                </GridItem>
              </Grid>
            </Stack>
            {/* ===== Stats ===== */}
            <Stack gap="4">
              <HStack gap="2">
                <EditIcon />
                <Text textStyle="xl" fontWeight="bold">
                  Stats
                </Text>
              </HStack>
              <Grid templateColumns="repeat(3, 1fr)" gap="3">
                <GridItem>
                  <NumberInput
                    value={edits.gold}
                    onValueChange={setGold}
                    label="Gold"
                    step={10}
                    icon={<TesseraeIcon />}
                  />
                </GridItem>
                <GridItem>
                  <NumberInput
                    value={edits.essence}
                    onValueChange={setEssence}
                    label="Essence"
                    step={10}
                    icon={<EssenceIcon />}
                  />
                </GridItem>
                <GridItem>
                  <NumberInput
                    value={edits.renown}
                    onValueChange={setRenown}
                    label="Renown"
                    step={10}
                    icon={<RenownIcon />}
                  />
                </GridItem>
                <GridItem>
                  <NumberInput
                    value={edits.health}
                    onValueChange={setHealth}
                    label="Health"
                    step={10}
                    icon={<HealthIcon />}
                  />
                </GridItem>
                <GridItem>
                  <NumberInput
                    value={edits.stamina}
                    onValueChange={setStamina}
                    label="Stamina"
                    step={10}
                    icon={<StaminaIcon />}
                  />
                </GridItem>
                <GridItem>
                  <NumberInput
                    value={edits.mana}
                    onValueChange={setMana}
                    label="Mana"
                    step={4}
                    icon={<ManaIcon />}
                  />
                </GridItem>
              </Grid>
            </Stack>
            {/* ===== Calendar ===== */}
            <Stack gap="4">
              <HStack gap="2">
                <EditIcon />
                <Text textStyle="xl" fontWeight="bold">
                  Calendar
                </Text>
              </HStack>
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

function TextInput({ currentValue, textLabel, onChange, icon }) {
  return (
    <Field label={textLabel}>
      <InputGroup flex="" w="full" startElement={icon || null}>
        <Input 
          value={currentValue}
          onChange={(e) => onChange(e.target.value)}
        />
      </InputGroup>
      
    </Field>
  )
}

function SelectInput({ collection, textLabel, currentValue, onValueChange }) {
  return (
    <SelectRoot
      collection={collection}
      size="md"
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

const pronouns = createListCollection({
  items: Object.keys(PronounsList).map((p) => ({ label: formatPronouns(p), value: p }))
})

const seasons = createListCollection({
  items: seasonsList.map((season, index) => ({ label: season, value: index}))
})

const days = createListCollection({
  items: Array(28)
    .fill()
    .map((_, i) => ({ label: i + 1, value: i + 1 }))
})
