import { useCallback, useMemo } from "react"
import { Grid, GridItem, HStack, Stack, Text, createListCollection } from "@chakra-ui/react"
import { useEditorContext } from "src/components/save-editing/index.jsx"
import { TextInput } from "src/components/custom/text-input"
import { FarmIcon, NameIcon, EditIcon } from "src/components/custom/icons"
import { SelectInput } from "src/components/custom/select-input"
import { useShallow } from "zustand/react/shallow"

const PronounsList = {
  they_them: "they_them",
  she_her: "she_her",
  he_him: "he_him",
  she_they: "she_they",
  they_she: "they_she",
  he_they: "he_they",
  they_he: "they_he",
  he_she: "he_she",
  she_he: "she_he",
  it_its: "it_its",
  all: "all",
  none: "none"
}

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

export const seasonsList = ["Spring", "Summer", "Fall", "Winter"]

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
  } = useEditorContext(
    useShallow((s) => ({
      name: s.name,
      setName: s.setName,
      farmName: s.farmName,
      setFarmName: s.setFarmName,
      pronouns: s.pronouns,
      setPronouns: s.setPronouns,
      birthdayDay: s.birthdayDay,
      setBirthdayDay: s.setBirthdayDay,
      birthdaySeason: s.birthdaySeason,
      setBirthdaySeason: s.setBirthdaySeason
    }))
  )

  const setPronounsWrapper = useCallback((newPronouns) => {
    setPronouns(formatPronouns(newPronouns, true))
  }, [])

  const memoizedIcons = useMemo(
    () => ({
      farm: <FarmIcon />,
      name: <NameIcon />
    }),
    []
  )

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
          <TextInput value={name} onChange={setName} textLabel="Name" icon={memoizedIcons.name} />
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
          <TextInput
            value={farmName}
            onChange={setFarmName}
            textLabel="Farm Name"
            icon={memoizedIcons.farm}
          />
        </GridItem>
        <GridItem>
          <SelectInput
            colorPalette="teal"
            collection={seasonsCollection}
            value={birthdaySeason}
            onValueChange={setBirthdaySeason}
            textLabel="Birthday"
            placeholder={seasonsList[birthdaySeason]}
          />
          <SelectInput
            collection={daysCollection}
            colorPalette="teal"
            value={birthdayDay}
            onValueChange={setBirthdayDay}
            placeholder={birthdayDay}
          />
        </GridItem>
      </Grid>
    </Stack>
  )
}
