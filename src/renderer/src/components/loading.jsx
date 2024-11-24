import { Center, Flex, Text, Spinner } from "@chakra-ui/react"

export default function Loading({ text }) {
  return (
    <Center>
      <Flex flexDir="column" gap="4" alignItems="center">
        <Text>{text}</Text>
        <Spinner />
      </Flex>
    </Center>
  )
}
