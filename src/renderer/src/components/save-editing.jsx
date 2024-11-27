import { useEffect, useState } from "react"
import {
  Box,
  Flex,
  Grid,
  GridItem,
  HStack,
  Stack,
  Text,
  createListCollection
} from "@chakra-ui/react"
import { Button } from "@components/ui/button"
import NumberInput from "@components/number-input"
import TextInput from "@components/text-input"
import SelectInput from "@components/select-input"
import {
  TesseraeIcon,
  EssenceIcon,
  RenownIcon,
  EditIcon,
  FarmIcon,
  NameIcon,
  HealthIcon,
  StaminaIcon,
  ManaIcon
} from "@components/icons"
import { seasonsList, getCalendarTime, PronounsList, formatPronouns } from "@utils"
import Loading from "./loading"
import { useSaveData } from "../queries"
import { useSaveDataMutation } from "../mutations"
import { useStore } from "../store"
import { LuArrowLeft } from "react-icons/lu"

export default function SaveEditing() {
  const { goToSelection: onBack, editingSaveId: saveId } = useStore()

  const { data: saveData, isError: isErrorData } = useSaveData(saveId)
  const {
    mutate: updateSave,
    isPending: isUpdatePending,
    isError: isUpdateError
  } = useSaveDataMutation(saveId)
  const [edits, setEdits] = useState(null)

  useEffect(() => {
    setEdits(saveData)
  }, [saveData])

  useEffect(() => {
    if (edits === null && saveData) {
      setEdits(saveData)
    }
  }, [edits])

  const handleDiscardEdits = () => {
    setEdits(null)
  }

  const handleApplyEdits = async () => {
    // TODO: diff the edits and make all the edits mutations
    await window.api.setName(saveId, edits.name)
    await window.api.setPronouns(saveId, formatPronouns(edits.pronouns, true))
    await window.api.setFarmName(saveId, edits.farmName)
    await window.api.setGold(saveId, edits.gold)
    await window.api.setEssence(saveId, edits.essence)
    await window.api.setRenown(saveId, edits.renown)
    await window.api.setCalendarTime(saveId, getCalendarTime(edits.year, edits.season, edits.day))
    await window.api.setHealth(saveId, edits.health)
    await window.api.setStamina(saveId, edits.stamina)
    await window.api.setMana(saveId, edits.mana)

    updateSave()
  }

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

  if (isUpdateError) {
    return <Text>Error updating save</Text>
  }

  if (isUpdatePending) {
    return <Loading text="Updating save..." />
  }

  if (isErrorData) {
    return <Text>Error loading save data</Text>
  }

  if (!saveData || !edits) {
    return <Loading text="Loading..." />
  }

  return (
    <Box px={6} py={4} w="full">
      <Flex justifyContent="space-between" pos="relative">
        <Button variant="subtle" onClick={onBack}>
          <LuArrowLeft /> Back
        </Button>
        <Flex flexDir="column" gap={2}>
          <Flex gap={3}>
            <Button variant="subtle" onClick={handleDiscardEdits}>
              Discard
            </Button>
            <Button onClick={handleApplyEdits}>Apply</Button>
          </Flex>
          <Text textStyle="sm" opacity={0.7} textAlign="end">
            {saveData.id}
          </Text>
        </Flex>
      </Flex>
      <Box my={10}>
        <Stack gap="8">
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
                  colorPalette="teal"
                  currentValue={formatPronouns(edits.pronouns)}
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
                  value={edits ? edits.gold : saveData.gold}
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
              <NumberInput
                value={edits.year}
                onValueChange={setYear}
                label="Year"
                step={1}
                min={1}
              />
              <SelectInput
                colorPalette="teal"
                currentValue={seasonsList[edits.season]}
                onValueChange={setSeason}
                textLabel="Season"
                collection={seasons}
              />
              <SelectInput
                colorPalette="teal"
                currentValue={edits.day}
                onValueChange={setDay}
                textLabel="Day"
                collection={days}
              />
            </Flex>
          </Stack>
          {/* ===== Inventory ===== */}
          <Stack gap="4"></Stack>
        </Stack>
      </Box>
    </Box>
  )
}

const pronouns = createListCollection({
  items: Object.keys(PronounsList).map((p) => ({
    label: formatPronouns(p),
    value: formatPronouns(p)
  }))
})

const seasons = createListCollection({
  items: seasonsList.map((season, index) => ({ label: season, value: index }))
})

const days = createListCollection({
  items: Array(28)
    .fill()
    .map((_, i) => ({ label: i + 1, value: i + 1 }))
})
