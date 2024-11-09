import './globals.css'
import fomClouds from './assets/fom-clouds.png'
import fomLogo from './assets/fom-logo.webp'
import { Image, Box, Text, Card, Flex, HStack, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { translatePlaytime, translateClockTime, translateCalendarTime } from './utils'
import {
  PaginationRoot,
  PaginationPrevTrigger,
  PaginationNextTrigger,
  PaginationPageText
} from './pagination'

export function App() {
  return (
    <Box minH="100svh" bg="black" color="gray.50" display="flex" flexDir="column" gap="50px">
      <Box display="flex" justifyContent="center" pos="relative">
        <Image
          src={fomClouds}
          objectFit="cover"
          h="250px"
          w="100vw"
          alt="background"
          userSelect="none"
          draggable={false}
          pos="absolute"
        />
        <Image src={fomLogo} zIndex={1} draggable={false} />
      </Box>
      <SaveSelection />
    </Box>
  )
}

type Save = ReturnType<(typeof window)['api']['getSaves']>[0]

function SaveSelection() {
  const saves = window.api.getSaves()
  const pageSize = 5

  const [page, setPage] = useState(1)

  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  const visibleSaves = saves.slice(startIndex, endIndex)

  return (
    <VStack textAlign="center" py={10}>
      <Flex flexDir="column" gap={6}>
        {visibleSaves.map((save) => (
          <SaveCard key={save.saveFileName} save={save} />
        ))}
      </Flex>
      <PaginationRoot
        count={saves.length}
        pageSize={5}
        defaultPage={1}
        pt={5}
        onPageChange={(e) => setPage(e.page)}
      >
        <HStack gap={4}>
          <PaginationPrevTrigger />
          <PaginationPageText />
          <PaginationNextTrigger />
        </HStack>
      </PaginationRoot>
    </VStack>
  )
}

function SaveCard({ save }: { save: Save }) {
  const data = {
    Gold: Intl.NumberFormat().format(save.gold),
    Essence: Intl.NumberFormat().format(save.essence),
    Renown: Intl.NumberFormat().format(save.renown)
  }

  return (
    <Card.Root
      as="button"
      display="inline"
      bg="gray.900"
      w={{ base: '100%', md: '660px' }}
      maxW="660px"
      mx="auto"
      cursor="pointer"
    >
      <Card.Header display="flex" flexDir="row" justifyContent="space-between" pos="relative">
        <Text textStyle="xl">
          {save.name} | {translateCalendarTime(save.calendarTime)} -&nbsp;
          {translateClockTime(save.clockTime)} &nbsp;
          <Box as="span">{save.isAutosave && '(autosave)'}</Box>
        </Text>

        <Box pos="relative">
          <Text textStyle="xl" textAlign="end" ml={2}>
            {save.farmName}
          </Text>
          <Text pos="absolute" textStyle="xl" opacity={0.9} right="0">
            {translatePlaytime(save.playtime)}
          </Text>
        </Box>
      </Card.Header>
      <Card.Body>
        <Flex flexDir="column" gap={1}>
          {Object.keys(data).map((key, idx) => (
            <Text key={idx}>
              {key}:{' '}
              <Box as="span" opacity="0.9">
                {data[key]}
              </Box>
            </Text>
          ))}
        </Flex>
        <Box pos="absolute" right={6} bottom={7}>
          <Text fontSize="sm" opacity="0.8">
            {save.saveFileName}
          </Text>
        </Box>
      </Card.Body>
    </Card.Root>
  )
}
