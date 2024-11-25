import { useEffect, useState } from "react"
import { translateCalendarTime } from "@utils"
import { Box, Flex, Input, VStack, Separator, Image } from "@chakra-ui/react"
import {
  PaginationItems,
  PaginationPrevTrigger,
  PaginationNextTrigger,
  PaginationRoot
} from "@components/ui/pagination"
import SaveCard from "@components/save-card"
import dozy from "@assets/dozy.webp"
import UnpackingMeasurement from "./unpacking-measurement"
import Loading from "./loading"
import { useSaveMetadata } from "../queries"

const pageSize = 5

export default function SaveSelection({ onSaveSelected }) {
  const { data } = useSaveMetadata()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")

  if (!data) {
    return <Loading text="Loading saves..." />
  }

  const filteredSaves = data.filter((save) => {
    const query = search.toLowerCase()
    const seasons = ["spring", "summer", "fall", "winter"]
    const season = seasons[translateCalendarTime(save.header.calendar_time)[1]]
    const autosave = save.autosave ? "autosave" : ""
    return (
      save.header.name.toLowerCase().includes(query) ||
      save.header.farm_name.toLowerCase().includes(query) ||
      season.toLowerCase().includes(query) ||
      autosave.toLowerCase().includes(query) ||
      save.id.includes(query)
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
    <VStack textAlign="center" py={10} w="full">
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
            <Box pos="relative" w="full">
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
            </Box>
          </>
        )}
      </Flex>
      <Box w="full" pos="relative">
        <Image
          src={dozy}
          zIndex={2}
          draggable={false}
          pos="absolute"
          right="10"
          bottom="0"
          transform="scaleX(-1)"
        />
        <Image src={dozy} zIndex={2} draggable={false} pos="absolute" bottom="0" left="10" />
      </Box>
      <Box w="full" py="4">
        <Separator />
        <UnpackingMeasurement />
      </Box>
    </VStack>
  )
}
