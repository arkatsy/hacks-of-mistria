import fomClouds from './assets/fom-clouds.png'
import fomLogo from './assets/fom-logo.webp'
import { Image, Box, Flex, HStack, VStack, Input } from '@chakra-ui/react'
import { useState } from 'react'
import {
  PaginationRoot,
  PaginationPrevTrigger,
  PaginationNextTrigger,
  PaginationItems
} from './components/chakra/pagination'
import SaveCard from './components/save-card'

const pageSize = 5

const saves = window.api.getSortedLoadingSaves()

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
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const filteredSaves = saves.filter((save) => {
    const query = search.toLowerCase()
    return (
      save.header.name.toLowerCase().includes(query) ||
      save.header.farm_name.toLowerCase().includes(query)
    )
  })

  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  const visibleSaves = filteredSaves.slice(startIndex, endIndex)

  function handlePageChange(e: { page: number }) {
    setPage(e.page)
    window.scrollTo(0, 100)
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value)
    setPage(1)
  }

  return (
    <VStack textAlign="center" py={10}>
      <Flex flexDir="column" gap={6} maxW="660px" w="full" justifyContent="center">
        <Input
          w="full"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search for character or farm name"
        />
        {visibleSaves.length === 0 ? (
          <Box>No saves found</Box>
        ) : (
          <>
            {visibleSaves.map((save) => (
              <SaveCard key={save.id} save={save} />
            ))}
            <PaginationRoot
              count={filteredSaves.length}
              pageSize={pageSize}
              defaultPage={1}
              pt={5}
              onPageChange={handlePageChange}
              display="flex"
              justifyContent="center"
              gap={2}
            >
              <PaginationPrevTrigger />
              <PaginationItems />
              <PaginationNextTrigger />
            </PaginationRoot>
          </>
        )}
      </Flex>
    </VStack>
  )
}
