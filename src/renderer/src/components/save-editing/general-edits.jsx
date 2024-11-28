import { useCallback, useContext, useMemo } from "react"
import { Grid, GridItem, HStack, Stack, Text, createListCollection } from "@chakra-ui/react"
import { EditorContext } from "src/components/save-editing/index.jsx"
import { TextInput } from "src/components/custom/text-input"
import { FarmIcon, NameIcon, EditIcon } from "src/components/custom/icons"
import { SelectInput } from "src/components/custom/select-input"

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

const pronouns = createListCollection({
  items: Object.keys(PronounsList).map((p) => ({
    label: formatPronouns(p),
    value: formatPronouns(p, true)
  }))
})

// Transforms pronouns from "they/them" to "They/Them" or vice versa (if `inverse` is true)
export function formatPronouns(pronouns, inverse = false) {
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

export default function GeneralEdits() {
  const { edits, setEdits } = useContext(EditorContext)

  const setName = useCallback((newName) => setEdits((edits) => ({ ...edits, name: newName })), [])
  const setFarmName = useCallback(
    (newFarmName) => setEdits((edits) => ({ ...edits, farmName: newFarmName })),
    []
  )
  const setPronouns = useCallback(
    (newPronouns) =>
      setEdits((edits) => ({ ...edits, pronouns: formatPronouns(newPronouns, true) })),
    []
  )

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
          <TextInput
            value={edits.name}
            onChange={setName}
            textLabel="Name"
            icon={memoizedIcons.name}
          />
        </GridItem>
        <GridItem>
          <SelectInput
            collection={pronouns}
            textLabel="Pronouns"
            value={formatPronouns(edits.pronouns, true)}
            onValueChange={setPronouns}
            placeholder={formatPronouns(edits.pronouns)}
          />
        </GridItem>
        <GridItem>
          <TextInput
            value={edits.farmName}
            onChange={setFarmName}
            textLabel="Farm Name"
            icon={memoizedIcons.farm}
          />
        </GridItem>
      </Grid>
    </Stack>
  )
}
