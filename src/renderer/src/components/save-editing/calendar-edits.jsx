import { HStack, Stack, Text, Flex, createListCollection } from "@chakra-ui/react"
import { useEditorContext } from "src/components/save-editing/index.jsx"
import { NumberInput } from "src/components/custom/number-input"
import { SelectInput } from "src/components/custom/select-input"
import { EditIcon } from "src/components/custom/icons"
import { useShallow } from "zustand/react/shallow"

export const seasonsList = ["Spring", "Summer", "Fall", "Winter"]

const seasonsCollection = createListCollection({
  items: seasonsList.map((season, index) => ({ label: season, value: index }))
})

const days = createListCollection({
  items: Array(28)
    .fill()
    .map((_, i) => ({ label: i + 1, value: i + 1 }))
})

export default function CalendarEdits() {
  const { day, setDay, season, setSeason, year, setYear } = useEditorContext(
    useShallow((s) => ({
      day: s.day,
      setDay: s.setDay,
      season: s.season,
      setSeason: s.setSeason,
      year: s.year,
      setYear: s.setYear
    }))
  )

  return (
    <Stack gap="4">
      <HStack gap="2">
        <EditIcon />
        <Text textStyle="xl" fontWeight="bold">
          Calendar
        </Text>
      </HStack>
      <Flex gap="2" w="full">
        <NumberInput value={year} onValueChange={setYear} label="Year" step={1} min={1} />
        <SelectInput
          collection={seasonsCollection}
          value={season}
          onValueChange={setSeason}
          textLabel="Season"
          placeholder={seasonsList[season]}
        />
        <SelectInput
          collection={days}
          value={day}
          onValueChange={setDay}
          textLabel="Day"
          placeholder={day}
        />
      </Flex>
    </Stack>
  )
}
