import { useCallback, useContext } from "react"
import { HStack, Stack, Text, Flex, createListCollection } from "@chakra-ui/react"
import { EditorContext } from "src/components/save-editing/index.jsx"
import { NumberInput } from "src/components/custom/number-input"
import { SelectInput } from "src/components/custom/select-input"
import { EditIcon } from "src/components/custom/icons"

export const seasonsList = ["Spring", "Summer", "Fall", "Winter"]

const seasons = createListCollection({
  items: seasonsList.map((season, index) => ({ label: season, value: index }))
})

const days = createListCollection({
  items: Array(28)
    .fill()
    .map((_, i) => ({ label: i + 1, value: i + 1 }))
})

export default function CalendarEdits() {
  const { edits, setEdits } = useContext(EditorContext)

  const setYear = useCallback((newYear) => setEdits((edits) => ({ ...edits, year: newYear })), [])
  const setSeason = useCallback(
    (newSeason) => setEdits((edits) => ({ ...edits, season: newSeason })),
    []
  )
  const setDay = useCallback((newDay) => setEdits((edits) => ({ ...edits, day: newDay })), [])

  return (
    <Stack gap="4">
      <HStack gap="2">
        <EditIcon />
        <Text textStyle="xl" fontWeight="bold">
          Calendar
        </Text>
      </HStack>
      <Flex gap="2" w="full">
        <NumberInput value={edits.year} onValueChange={setYear} label="Year" step={1} min={1} />
        <SelectInput
          collection={seasons}
          value={edits.season}
          onValueChange={setSeason}
          textLabel="Season"
          placeholder={seasonsList[edits.season]}
        />
        <SelectInput
          collection={days}
          value={edits.day}
          onValueChange={setDay}
          textLabel="Day"
          placeholder={edits.day}
        />
      </Flex>
    </Stack>
  )
}
