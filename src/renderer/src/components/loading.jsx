import { Center, Flex, Text, Spinner, VStack } from "@chakra-ui/react"

export default function Loading({ text = "", extra = "" }) {
  return (
    <Center>
      <Flex flexDir="column" gap="4" alignItems="center">
        <VStack>
          <Text>{text}</Text>
          <Text>{extra}</Text>
        </VStack>
        <Spinner />
      </Flex>
    </Center>
  )
}
