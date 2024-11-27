import { useState } from "react"
import { translateCalendarTime } from "@utils"
import { Box, Flex, Input, Image, Stack } from "@chakra-ui/react"
import {
  PaginationItems,
  PaginationPrevTrigger,
  PaginationNextTrigger,
  PaginationRoot
} from "@components/ui/pagination"
import SaveCard from "@components/save-card"
import dozy from "@assets/dozy.webp"
import Loading from "./loading"
import { useSaveMetadata } from "../queries"
import { useRefreshSavesMutation } from "../mutations"
import { Button } from "@components/ui/button"
import { InputGroup } from "@components/ui/input-group"
import { FarmIcon } from "@components/icons"
import { LuRefreshCw } from "react-icons/lu"
import { useStore } from "../store"

const pageSize = 10

export default function SaveSelection() {
  const { setEditingSaveId } = useStore()
  const { data } = useSaveMetadata()
  const {
    mutate: refreshSaves,
    isPending: isRefreshPending,
    isError: isRefreshError
  } = useRefreshSavesMutation()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")

  if (!data || isRefreshPending) {
    return <Loading text="Loading saves..." extra="It might take a moment, depending on how many saves you have" />
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
    setEditingSaveId(saveId)
  }

  const handleRefreshClick = () => refreshSaves()

  return (
    <Stack w="full">
      <Flex flexDir="column" mx="auto" mt="5" gap={6} maxW="660px" w="full" justifyContent="center">
        <Flex gap="2">
          <InputGroup flex="1" startElement={<FarmIcon />}>
            <Input
              bg="orange.900/10"
              variant="outline"
              w="full"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search your saves"
            />
          </InputGroup>
          <Button
            variant="subtle"
            onClick={handleRefreshClick}
            isLoading={isRefreshPending}
            isDisabled={isRefreshPending}
          >
            <LuRefreshCw />
          </Button>
        </Flex>
        {visibleSaves.length === 0 ? (
          <Box>No saves found</Box>
        ) : (
          <>
            {visibleSaves.map((save) => (
              <SaveCard key={save.id} save={save} onClick={handleSaveClick} />
            ))}
            <Box pos="relative" w="full" pb="8">
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
      <Box w="full" pos="relative" mb="2">
        <Image
          src={dozy}
          zIndex={2}
          draggable={false}
          pos="absolute"
          right="10"
          bottom="8"
          transform="scaleX(-1)"
        />
        <Image src={dozy} zIndex={2} draggable={false} pos="absolute" bottom="8" left="10" />
      </Box>
    </Stack>
  )
}
