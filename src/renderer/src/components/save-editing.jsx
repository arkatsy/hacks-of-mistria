import { Box, Flex, Text } from "@chakra-ui/react"
import { Button } from "@components/ui/button"
import { saves } from "@utils"

export default function SaveEditing({ saveId, onBack }) {
  const save = saves.find((save) => save.id === saveId)

  return (
    <Box mx={6}>
      <Flex justifyContent="space-between" pos="relative">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Flex flexDir="column" gap={2}>
          <Flex gap={3}>
            <Button variant="subtle">Discard Changes</Button>
            <Button>Apply Edits</Button>
          </Flex>
          <Text textStyle="sm" opacity={0.7} textAlign="end">
            {save.id}
          </Text>
        </Flex>
      </Flex>
      <Box>
        <Box>{save.header.name}</Box>
        <Box>{save.header.farm_name}</Box>
      </Box>
    </Box>
  )
}
