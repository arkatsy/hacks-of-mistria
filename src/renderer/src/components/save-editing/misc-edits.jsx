import { HStack, Stack, Text } from "@chakra-ui/react"
import { memo, useContext } from "react"
import { EditorContext } from "src/components/save-editing/"
import { NumberInput } from "src/components/custom/number-input"
import { EditIcon } from "src/components/custom/icons"

const MiscEdits = memo(function MiscEdits() {
  const { edits, setEdits } = useContext(EditorContext)

  const handleLevelChange = (val) => {
    setEdits((prev) => ({ ...prev, maximumMinesLevel: val }))
  }

  return (
    <Stack gap="4">
      <HStack gap="2">
        <EditIcon />
        <Text textStyle="xl" fontWeight="bold">
          Miscellaneous
        </Text>
      </HStack>

      <Stack maxW="300px" w="full">
        <NumberInput
          label="Maximum Mines Level"
          value={edits.maximumMinesLevel}
          min={1}
          max={100}
          onValueChange={handleLevelChange}
        />
        <Text textStyle="sm">
          The max level for the version of the game v0.12.x is 59. Recommend to put that value again
          after done exploring.
        </Text>
      </Stack>
    </Stack>
  )
})

export default MiscEdits
