import fomClouds from "./assets/fom-clouds.png"
import fomLogo from "./assets/fom-logo.webp"
import { Image, Box, Flex, VStack, Input, Button, Text } from "@chakra-ui/react"
import { useState } from "react"
import {
  PaginationRoot,
  PaginationPrevTrigger,
  PaginationNextTrigger,
  PaginationItems
} from "./components/ui/pagination"
import SaveCard from "./components/save-card"
import { translateCalendarTime } from "./utils"

const pageSize = 5

const saves = window.api.getSortedLoadingSaves()

export function App() {
  const [editingSaveId, setEditingSaveId] = useState(null)

  const goToEditing = (saveId) => setEditingSaveId(saveId)

  const goToSelection = () => setEditingSaveId(null)

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
      {editingSaveId ? (
        <EditSave saveId={editingSaveId} onBack={goToSelection} />
      ) : (
        <SaveSelection onSaveSelected={goToEditing} />
      )}
    </Box>
  )
}

function EditSave({ saveId, onBack }) {
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

function SaveSelection({ onSaveSelected }) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")

  const filteredSaves = saves.filter((save) => {
    const query = search.toLowerCase()
    const seasons = ["spring", "summer", "fall", "winter"]
    const season = seasons[translateCalendarTime(save.header.calendar_time)[1]]
    const autosave = save.autosave ? "autosave" : ""
    return (
      save.header.name.toLowerCase().includes(query) ||
      save.header.farm_name.toLowerCase().includes(query) ||
      season.toLowerCase().includes(query) ||
      autosave.toLowerCase().includes(query)
    )
  })

  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  const visibleSaves = filteredSaves.slice(startIndex, endIndex)

  function handlePageChange(e) {
    setPage(e.page)
    window.scrollTo(0, 100)
  }

  function handleSearchChange(e) {
    setSearch(e.target.value)
    setPage(1)
  }

  function handleSaveClick(saveId) {
    onSaveSelected(saveId)
  }

  return (
    <VStack textAlign="center" py={10}>
      <Flex flexDir="column" gap={6} maxW="660px" w="full" justifyContent="center">
        <Input
          variant="subtle"
          w="full"
          value={search}
          onChange={handleSearchChange}
          placeholder="Search for a save by character name, farm name, season or autosave"
        />
        {visibleSaves.length === 0 ? (
          <Box>No saves found</Box>
        ) : (
          <>
            {visibleSaves.map((save) => (
              <SaveCard key={save.id} save={save} onClick={handleSaveClick} />
            ))}
            <PaginationRoot
              variant="solid"
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