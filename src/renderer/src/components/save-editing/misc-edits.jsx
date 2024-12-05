import { HStack, Stack, Text } from "@chakra-ui/react"
import { memo } from "react"
import { useEditorContext } from "src/components/save-editing/"
import { NumberInput } from "src/components/custom/number-input"
import { EditIcon } from "src/components/custom/icons"
import { useShallow } from "zustand/react/shallow"

const MiscEdits = memo(function MiscEdits() {
  const { maxMinesLevel, setMaxMinesLevel } = useEditorContext(
    useShallow((s) => ({
      maxMinesLevel: s.maxMinesLevel,
      setMaxMinesLevel: s.setMaxMinesLevel
    }))
  )

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
          value={maxMinesLevel}
          min={1}
          max={100}
          onValueChange={setMaxMinesLevel}
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
