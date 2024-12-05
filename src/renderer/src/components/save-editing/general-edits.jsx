import { useCallback } from "react"
import { Grid, GridItem, HStack, Stack, Text, createListCollection } from "@chakra-ui/react"
import { TextInput } from "src/components/custom/text-input"
import { EditIcon, FarmIcon, NameIcon } from "src/components/custom/icons"
import { SelectInput } from "src/components/custom/select-input"
import { useGeneralEdits } from "src/components/save-editing/store"
import { seasonsList, PronounsList } from "src/utils"

function formatPronouns(pronouns, inverse = false) {
  const transformFn = inverse ? "toLowerCase" : "toUpperCase"

  if (!(pronouns.includes("/") || pronouns.includes("_"))) {
    return pronouns.charAt(0)[transformFn]() + pronouns.slice(1)
  }

  const fromSymbol = inverse ? "/" : "_"
  const toSymbol = inverse ? "_" : "/"

  return pronouns
    .split(fromSymbol)
    .map((word) => word.charAt(0)[transformFn]() + word.slice(1))
    .join(toSymbol)
}

const pronounsCollection = createListCollection({
  items: Object.keys(PronounsList).map((p) => ({
    label: formatPronouns(p),
    value: formatPronouns(p, true)
  }))
})

const seasonsCollection = createListCollection({
  items: seasonsList.map((season, index) => ({ label: season, value: index }))
})

const daysCollection = createListCollection({
  items: Array(28)
    .fill()
    .map((_, i) => ({ label: i + 1, value: i + 1 }))
})

export default function GeneralEdits() {
  const {
    name,
    setName,
    farmName,
    setFarmName,
    pronouns,
    setPronouns,
    birthdayDay,
    setBirthdayDay,
    birthdaySeason,
    setBirthdaySeason
  } = useGeneralEdits()

  const setPronounsWrapper = useCallback((newPronouns) => {
    setPronouns(formatPronouns(newPronouns, true))
  }, [])

  return (
    <Stack gap="4">
      <HStack gap="2">
        <EditIcon />
        <Text textStyle="xl" fontWeight="bold">
          General
        </Text>
      </HStack>
      <Grid templateColumns="repeat(3, 1fr)" gap="3">
        <GridItem>
          <TextInput value={name} onChange={setName} textLabel="Name" icon={<NameIcon />} />
        </GridItem>
        <GridItem>
          <SelectInput
            collection={pronounsCollection}
            textLabel="Pronouns"
            value={formatPronouns(pronouns, true)}
            onValueChange={setPronounsWrapper}
            placeholder={formatPronouns(pronouns)}
          />
        </GridItem>
        <GridItem>
          <TextInput value={farmName} onChange={setFarmName} textLabel="Farm Name" icon={<FarmIcon />} />
        </GridItem>
        <GridItem>
          <SelectInput
            collection={seasonsCollection}
            value={birthdaySeason}
            onValueChange={setBirthdaySeason}
            textLabel="Birthday"
            placeholder={seasonsList[birthdaySeason]}
          />
          <SelectInput collection={daysCollection} value={birthdayDay} onValueChange={setBirthdayDay} placeholder={birthdayDay} />
        </GridItem>
      </Grid>
    </Stack>
  )
}
