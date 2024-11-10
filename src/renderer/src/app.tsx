import fomClouds from './assets/fom-clouds.png'
import fomLogo from './assets/fom-logo.webp'
import { Image, Box, Flex, HStack, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import {
  PaginationRoot,
  PaginationPrevTrigger,
  PaginationNextTrigger,
  PaginationItems
} from './components/chakra/pagination'
import { SaveCard } from './components/save-card'

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

function SaveSelection() {
  const saveIds = window.api.getSortedLoadingSavesIds()
  const pageSize = 12

  const [page, setPage] = useState(1)

  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  const visibleSaveIds = saveIds.slice(startIndex, endIndex)

  useEffect(() => {
    window.scrollTo(0, 100)
  }, [page])

  return (
    <VStack textAlign="center" py={10}>
      <Flex flexDir="column" gap={6}>
        {visibleSaveIds.map((id) => (
          <SaveCard key={id} saveId={id} />
        ))}
      </Flex>
      <PaginationRoot
        count={saveIds.length}
        pageSize={pageSize}
        defaultPage={1}
        pt={5}
        onPageChange={(e) => setPage(e.page)}
      >
        <HStack gap={4}>
          <PaginationPrevTrigger />
          <PaginationItems />
          <PaginationNextTrigger />
        </HStack>
      </PaginationRoot>
    </VStack>
  )
}
